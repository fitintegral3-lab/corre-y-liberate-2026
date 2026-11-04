import { afterEach, describe, expect, it, vi } from 'vitest';

import { SHEET_HEADERS } from '@/lib/sheets/registration-row';
import { columnLetter, updateSheetShirtSize } from '@/lib/sheets/update-status';

vi.mock('@/lib/google/service-account', () => ({ accessToken: async () => 'test-only-token' }));
afterEach(() => vi.unstubAllGlobals());

describe('columnLetter', () => {
  it('convierte indices en letras de columna', () => {
    expect(columnLetter(0)).toBe('A');
    expect(columnLetter(25)).toBe('Z');
    expect(columnLetter(26)).toBe('AA');
    expect(columnLetter(27)).toBe('AB');
    expect(columnLetter(51)).toBe('AZ');
    expect(columnLetter(52)).toBe('BA');
  });

  it('ubica "Estado pago" en B y el ID en AA, como en la hoja real', () => {
    expect(columnLetter(SHEET_HEADERS.indexOf('Estado pago'))).toBe('B');
    expect(columnLetter(SHEET_HEADERS.indexOf('ID'))).toBe('AA');
  });
});

describe('sincronizar talla en Drive', () => {
  const config = {
    spreadsheetId: 'test',
    tab: 'Inscripciones',
    account: { clientEmail: 'test', privateKey: 'test' },
  };
  it('busca por ID y cambia únicamente la celda de talla en RAW', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ values: [['ID'], ['otro-id'], ['runner-id']] }))
      .mockResolvedValueOnce(Response.json({}));
    vi.stubGlobal('fetch', fetch);
    expect(await updateSheetShirtSize(config, 'runner-id', 'Medium (M)')).toBe(true);
    expect(decodeURIComponent(fetch.mock.calls[0][0])).toContain("'Inscripciones'!AA:AA");
    expect(decodeURIComponent(fetch.mock.calls[1][0])).toContain(
      "'Inscripciones'!J3?valueInputOption=RAW",
    );
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({
      range: "'Inscripciones'!J3",
      majorDimension: 'ROWS',
      values: [['Medium (M)']],
    });
  });
  it('si la inscripción no está en la hoja, no cambia otra fila', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(Response.json({ values: [['ID'], ['otro-id']] }));
    vi.stubGlobal('fetch', fetch);
    expect(await updateSheetShirtSize(config, 'runner-id', 'Medium (M)')).toBe(false);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('señala un error de la hoja para que administración pueda corregir la copia', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(Response.json({ values: [['runner-id']] }))
        .mockResolvedValueOnce(new Response('unavailable', { status: 503 })),
    );
    await expect(updateSheetShirtSize(config, 'runner-id', 'Medium (M)')).rejects.toThrow('503');
  });
});
