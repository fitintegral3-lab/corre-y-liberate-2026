import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { assignShirtReservation, changePendingShirt } from '@/lib/admin/shirts';
import { supabaseAdmin } from '@/lib/supabase/admin';

vi.mock('@/lib/supabase/admin', () => ({ supabaseAdmin: vi.fn() }));
const config = { url: 'https://test.supabase.co', secretKey: 'test' };
const query = { update: vi.fn(), eq: vi.fn(), is: vi.fn(), select: vi.fn(), maybeSingle: vi.fn() };
beforeEach(() => {
  vi.resetAllMocks();
  for (const key of ['update', 'eq', 'is', 'select'] as const) query[key].mockReturnValue(query);
  query.maybeSingle.mockResolvedValue({ data: { id: 'id' }, error: null });
  vi.mocked(supabaseAdmin).mockReturnValue({ from: () => query } as unknown as ReturnType<
    typeof supabaseAdmin
  >);
});
afterEach(() => vi.restoreAllMocks());

describe('talla de una inscripción pendiente', () => {
  it('solo cambia la talla en la edición, estado y valor anteriores esperados', async () => {
    expect(await changePendingShirt(config, 'id', 'Small (S)', 'Medium (M)')).toEqual({ ok: true });
    expect(query.update).toHaveBeenCalledWith({ shirt_size: 'Medium (M)' });
    expect(query.eq).toHaveBeenCalledWith('edition', 2);
    expect(query.eq).toHaveBeenCalledWith('payment_status', 'pendiente');
    expect(query.eq).toHaveBeenCalledWith('shirt_size', 'Small (S)');
  });
  it('un estado o talla cambiados por otra petición se notifican como conflicto', async () => {
    query.maybeSingle.mockResolvedValue({ data: null, error: null });
    expect(await changePendingShirt(config, 'id', 'Small (S)', 'Medium (M)')).toEqual({
      ok: false,
      reason: 'conflict',
    });
  });
  it('no guarda una talla agotada y conserva el error del trigger', async () => {
    query.maybeSingle.mockResolvedValue({
      data: null,
      error: { code: 'P0001', message: 'shirt-sold-out' },
    });
    expect(await changePendingShirt(config, 'id', 'Small (S)', 'Medium (M)')).toEqual({
      ok: false,
      reason: 'shirt-sold-out',
    });
  });
  it.each([
    ['Sin camiseta', 'Medium (M)'],
    ['Small (S)', 'Sin camiseta'],
    ['Small (S)', 'otra'],
  ])('no permite alterar la opción pagada: %s → %s', async (before, next) => {
    expect(await changePendingShirt(config, 'id', before, next)).toEqual({
      ok: false,
      reason: 'invalid',
    });
    expect(query.update).not.toHaveBeenCalled();
  });
});

describe('reservas externas desde administración', () => {
  it('normaliza la cédula y asigna solo una reserva que siga libre', async () => {
    expect(await assignShirtReservation(config, 'id', null, '1.144.135.260')).toEqual({ ok: true });
    expect(query.update).toHaveBeenCalledWith({ cedula: '1144135260' });
    expect(query.is).toHaveBeenCalledWith('cedula', null);
    expect(query.eq).toHaveBeenCalledWith('edition', 2);
  });
  it('quitar la cédula conserva la fila y verifica su dueño anterior', async () => {
    expect(await assignShirtReservation(config, 'id', '1144135260', null)).toEqual({ ok: true });
    expect(query.update).toHaveBeenCalledWith({ cedula: null });
    expect(query.eq).toHaveBeenCalledWith('cedula', '1144135260');
  });
  it.each([
    ['23505', 'duplicate', 'duplicate-cedula'],
    ['P0001', 'shirt-reservation-already-registered', 'already-registered'],
  ])('explica el bloqueo %s sin cambiar inventario', async (code, message, reason) => {
    query.maybeSingle.mockResolvedValue({ data: null, error: { code, message } });
    expect(await assignShirtReservation(config, 'id', null, '1144135260')).toEqual({
      ok: false,
      reason,
    });
  });
  it('rechaza una cédula inválida antes de escribir', async () => {
    expect(await assignShirtReservation(config, 'id', null, '1')).toEqual({
      ok: false,
      reason: 'invalid',
    });
    expect(query.update).not.toHaveBeenCalled();
  });
  it('detecta la asignación simultánea de una reserva', async () => {
    query.maybeSingle.mockResolvedValue({ data: null, error: null });
    expect(await assignShirtReservation(config, 'id', null, '1144135260')).toEqual({
      ok: false,
      reason: 'conflict',
    });
  });
});
