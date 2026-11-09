import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { receiptExists } from '@/lib/gcs/receipts';
import { submitRegistration } from '@/lib/registration/service';
import { findShirtReservation, listShirtStock } from '@/lib/registration/shirt-inventory';
import { supabaseAdmin } from '@/lib/supabase/admin';

vi.mock('@/lib/gcs/receipts', () => ({
  receiptExists: vi.fn(),
  receiptUrl: () => 'https://example.com/receipt',
}));
vi.mock('@/lib/registration/shirt-inventory', () => ({
  findShirtReservation: vi.fn(),
  listShirtStock: vi.fn(),
}));
vi.mock('@/lib/supabase/admin', () => ({ supabaseAdmin: vi.fn() }));

const config = { url: 'https://test.supabase.co', secretKey: 'test-only' };
const receipts = {
  bucket: 'test',
  account: { clientEmail: 'test@example.com', privateKey: 'test' },
};
const now = new Date('2026-10-20T12:00:00Z');
const valid = {
  email: 'ana@example.com',
  firstName: 'Ana',
  lastName: 'Pérez',
  gender: 'femenino',
  distanceId: '5k',
  birthDate: '1990-05-10',
  shirtSize: 'Small (S)',
  cedula: '1144135260',
  phone: '3001234567',
  eps: 'Sura',
  bloodType: 'A+',
  emergencyName: 'Luis',
  emergencyPhone: '3107654321',
  recentCompetition: 'NO',
  hasIllness: 'NO',
  acceptedTerms: true,
  receiptPath: 'pendientes/0b0f8c9e-1d2a-4c3b-9e8f-7a6b5c4d3e2f.jpg',
};
const single = vi.fn();
const insert = vi.fn();
const eq = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(findShirtReservation).mockResolvedValue(null);
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.mocked(listShirtStock).mockResolvedValue([
    { gender: 'femenino', shirtSize: 'Small (S)', total: 34, reserved: 33, available: 1 },
  ]);
  vi.mocked(receiptExists).mockResolvedValue(true);
  single.mockResolvedValue({ data: { id: 'new-id', created_at: now.toISOString() }, error: null });
  insert.mockReturnValue({ select: () => ({ single }) });
  eq.mockReturnValueOnce({ eq }).mockResolvedValue({ count: 0, error: null });
  vi.mocked(supabaseAdmin).mockReturnValue({
    from: () => ({ insert, select: () => ({ eq }) }),
  } as unknown as ReturnType<typeof supabaseAdmin>);
});
afterEach(() => vi.restoreAllMocks());

describe('reserva de camiseta al inscribirse', () => {
  it.each([
    ['5k', 100_000, 90_000],
    ['10k', 130_000, 120_000],
  ])(
    'guarda %s sin camiseta con código al precio recalculado por el servidor',
    async (distanceId, basePrice, total) => {
      const result = await submitRegistration(
        config,
        receipts,
        { ...valid, distanceId, includesShirt: false, referralCode: 'valecorre', total: 1 },
        now,
      );
      expect(result).toMatchObject({
        ok: true,
        total,
        record: { shirtSize: 'Sin camiseta', referralCode: 'VALECORRE', basePrice, total },
      });
      expect(insert).toHaveBeenCalledWith(
        expect.objectContaining({
          shirt_size: 'Sin camiseta',
          referral_code: 'VALECORRE',
          base_price: basePrice,
          total,
        }),
      );
      expect(listShirtStock).not.toHaveBeenCalled();
    },
  );
  it('una reserva por cédula permite inscribirse sin exigir stock público', async () => {
    vi.mocked(findShirtReservation).mockResolvedValue({
      gender: 'femenino',
      shirtSize: 'Small (S)',
    });
    vi.mocked(listShirtStock).mockResolvedValue([]);
    expect(await submitRegistration(config, receipts, valid, now)).toMatchObject({ ok: true });
    expect(findShirtReservation).toHaveBeenCalledWith(config, '1144135260');
    expect(listShirtStock).not.toHaveBeenCalled();
    expect(insert).toHaveBeenCalledWith(
      expect.not.objectContaining({ shirt_reservation_id: expect.anything() }),
    );
  });

  it('la reserva no permite elegir una talla diferente agotada', async () => {
    vi.mocked(findShirtReservation).mockResolvedValue({
      gender: 'femenino',
      shirtSize: 'Medium (M)',
    });
    vi.mocked(listShirtStock).mockResolvedValue([]);
    expect(await submitRegistration(config, receipts, valid, now)).toMatchObject({
      ok: false,
      reason: 'shirt-sold-out',
    });
  });
  it('una talla agotada falla antes de comprobar el archivo o guardar', async () => {
    vi.mocked(listShirtStock).mockResolvedValue([]);
    expect(await submitRegistration(config, receipts, valid, now)).toMatchObject({
      ok: false,
      reason: 'shirt-sold-out',
      fields: { shirtSize: expect.any(String) },
    });
    expect(receiptExists).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it('la validación sin comprobante también avisa de agotamiento antes de subir', async () => {
    vi.mocked(listShirtStock).mockResolvedValue([]);
    expect(
      await submitRegistration(config, receipts, { ...valid, receiptPath: '' }, now),
    ).toMatchObject({ ok: false, reason: 'shirt-sold-out' });
    expect(insert).not.toHaveBeenCalled();
  });

  it('sin camiseta no consulta ni consume inventario', async () => {
    expect(
      await submitRegistration(config, receipts, { ...valid, includesShirt: false }, now),
    ).toMatchObject({ ok: true });
    expect(listShirtStock).not.toHaveBeenCalled();
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ shirt_size: 'Sin camiseta' }));
  });

  it('si se agota después de la consulta devuelve el error del trigger', async () => {
    single.mockResolvedValue({ data: null, error: { code: 'P0001', message: 'shirt-sold-out' } });
    expect(await submitRegistration(config, receipts, valid, now)).toMatchObject({
      ok: false,
      reason: 'shirt-sold-out',
    });
  });

  it('si falla la consulta no permite guardar con camiseta', async () => {
    vi.mocked(listShirtStock).mockRejectedValue(new Error('offline'));
    expect(await submitRegistration(config, receipts, valid, now)).toEqual({
      ok: false,
      reason: 'unavailable',
    });
    expect(insert).not.toHaveBeenCalled();
  });
});
