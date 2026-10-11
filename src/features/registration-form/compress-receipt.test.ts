import { afterEach, describe, expect, it, vi } from 'vitest';

import { compressReceipt } from './compress-receipt';

// Dobles de APIs del navegador: ejercitan dispositivos sin ImageBitmap ni File constructor en el cliente.
function legacyBrowser({ canEncode = true, fails = false } = {}) {
  const revoke = vi.fn();
  const draw = vi.fn();
  const compressed = new Blob(['small'], { type: 'image/jpeg' });
  vi.stubGlobal('createImageBitmap', undefined);
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:receipt');
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(revoke);
  vi.stubGlobal(
    'Image',
    class {
      naturalWidth = 4000;
      naturalHeight = 3000;
      onload?: () => void;
      onerror?: () => void;
      set src(_value: string) {
        if (fails) this.onerror?.();
        else this.onload?.();
      }
    },
  );
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({ fillStyle: '', fillRect: vi.fn(), drawImage: draw }),
    toBlob: canEncode ? (callback: (value: Blob) => void) => callback(compressed) : undefined,
  };
  vi.stubGlobal('document', { createElement: () => canvas });
  return { revoke, draw, canvas, compressed };
}

function receipt() {
  return new File(['large receipt'.repeat(100)], 'receipt.png', { type: 'image/png' });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('comprobantes en navegadores antiguos', () => {
  it('comprime con Image y JPEG cuando no hay ImageBitmap ni codificador WebP', async () => {
    const { canvas, compressed, revoke, draw } = legacyBrowser();
    const file = receipt();
    vi.stubGlobal('File', undefined);
    expect(await compressReceipt(file)).toBe(compressed);
    expect(canvas.width).toBe(2000);
    expect(canvas.height).toBe(1500);
    expect(draw).toHaveBeenCalledOnce();
    expect(revoke).toHaveBeenCalledWith('blob:receipt');
  });

  it.each([{ canEncode: false }, { fails: true }])(
    'conserva el original si no puede optimizar (%o)',
    async (options) => {
      const { revoke } = legacyBrowser(options);
      const file = receipt();
      expect(await compressReceipt(file)).toBe(file);
      expect(revoke).toHaveBeenCalledOnce();
    },
  );

  it('conserva los PDF sin intentar decodificarlos', async () => {
    const file = new File(['pdf'], 'receipt.pdf', { type: 'application/pdf' });
    expect(await compressReceipt(file)).toBe(file);
  });
});
