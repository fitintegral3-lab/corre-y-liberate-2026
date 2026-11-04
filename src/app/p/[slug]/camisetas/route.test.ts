import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from '@/app/p/[slug]/camisetas/route';
import { adminAllowed } from '@/lib/admin/auth';
import { assignShirtReservation, changePendingShirt } from '@/lib/admin/shirts';
import { sheetsConfig } from '@/lib/sheets/config';
import { updateSheetShirtSize } from '@/lib/sheets/update-status';
import { supabaseConfig } from '@/lib/supabase/config';

vi.mock('next/server', () => ({ after: vi.fn() }));
vi.mock('@/lib/admin/auth', () => ({ adminAllowed: vi.fn() }));
vi.mock('@/lib/admin/shirts', () => ({
  assignShirtReservation: vi.fn(),
  changePendingShirt: vi.fn(),
}));
vi.mock('@/lib/email/config', () => ({ emailConfig: () => null }));
vi.mock('@/lib/email/shirt-stock', () => ({ tryShirtStockAlerts: vi.fn() }));
vi.mock('@/lib/sheets/config', () => ({ sheetsConfig: vi.fn() }));
vi.mock('@/lib/sheets/update-status', () => ({ updateSheetShirtSize: vi.fn() }));
vi.mock('@/lib/supabase/config', () => ({ supabaseConfig: vi.fn() }));

const config = { url: 'https://test.supabase.co', secretKey: 'test' };
const id = '0b0f8c9e-1d2a-4c3b-9e8f-7a6b5c4d3e2f';
const context = { params: Promise.resolve({ slug: 'test-slug' }) };
const registration = {
  action: 'registration',
  id,
  previousSize: 'Small (S)',
  shirtSize: 'Medium (M)',
};
function request(body: unknown, origin = 'https://race.test') {
  return new Request('https://race.test/p/test-slug/camisetas', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(adminAllowed).mockReturnValue({
    slug: 'test-slug',
    user: 'admin',
    password: 'test-only',
  });
  vi.mocked(supabaseConfig).mockReturnValue(config);
  vi.mocked(changePendingShirt).mockResolvedValue({ ok: true });
  vi.mocked(assignShirtReservation).mockResolvedValue({ ok: true });
  vi.mocked(sheetsConfig).mockReturnValue(null);
});
describe('gestión protegida de camisetas', () => {
  it('sin autenticación no consulta ni modifica datos', async () => {
    vi.mocked(adminAllowed).mockReturnValue(null);
    expect((await POST(request(registration), context)).status).toBe(404);
    expect(supabaseConfig).not.toHaveBeenCalled();
  });
  it('rechaza peticiones de otro origen', async () => {
    expect((await POST(request(registration, 'https://other.test'), context)).status).toBe(403);
    expect(changePendingShirt).not.toHaveBeenCalled();
  });
  it('no permite quitar la camiseta o cambiar de opción de precio', async () => {
    expect(
      (await POST(request({ ...registration, shirtSize: 'Sin camiseta' }), context)).status,
    ).toBe(422);
    expect(changePendingShirt).not.toHaveBeenCalled();
  });
  it('guarda una talla pendiente y sincroniza la columna de la hoja', async () => {
    const sheet = {
      spreadsheetId: 'sheet',
      tab: 'Inscripciones',
      account: { clientEmail: 'test', privateKey: 'test' },
    };
    vi.mocked(sheetsConfig).mockReturnValue(sheet);
    vi.mocked(updateSheetShirtSize).mockResolvedValue(true);
    const result = await POST(request(registration), context);
    expect(await result.json()).toEqual({ ok: true, sheet: 'updated' });
    expect(changePendingShirt).toHaveBeenCalledWith(config, id, 'Small (S)', 'Medium (M)');
    expect(updateSheetShirtSize).toHaveBeenCalledWith(sheet, id, 'Medium (M)');
  });
  it('un stock agotado no escribe en la hoja', async () => {
    vi.mocked(changePendingShirt).mockResolvedValue({ ok: false, reason: 'shirt-sold-out' });
    expect((await POST(request(registration), context)).status).toBe(409);
    expect(updateSheetShirtSize).not.toHaveBeenCalled();
  });
  it('asigna una cédula normalizada sin cambiar talla, género ni stock', async () => {
    expect(
      (
        await POST(
          request({ action: 'reservation', id, cedula: '1.144.135.260', previousCedula: null }),
          context,
        )
      ).status,
    ).toBe(200);
    expect(assignShirtReservation).toHaveBeenCalledWith(config, id, null, '1144135260');
    expect(changePendingShirt).not.toHaveBeenCalled();
    expect(updateSheetShirtSize).not.toHaveBeenCalled();
  });
  it('una reserva ya inscrita responde conflicto', async () => {
    vi.mocked(assignShirtReservation).mockResolvedValue({
      ok: false,
      reason: 'already-registered',
    });
    expect(
      (
        await POST(
          request({ action: 'reservation', id, cedula: '1144135260', previousCedula: null }),
          context,
        )
      ).status,
    ).toBe(409);
  });
});
