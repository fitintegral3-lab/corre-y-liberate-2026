import { event } from '@/content';
import { cedulaSchema, SHIRT_SIZES } from '@/domain/registration/schema';
import { supabaseAdmin } from '@/lib/supabase/admin';

import type { ShirtReservation } from '@/lib/registration/shirt-inventory';
import type { SupabaseConfig } from '@/lib/supabase/config';

export interface ShirtReservationSlot extends ShirtReservation {
  id: string;
  cedula: string | null;
  registered: boolean;
  assigned: boolean;
}

export type ShirtChangeResult =
  | { ok: true }
  | {
      ok: false;
      reason: 'invalid' | 'conflict' | 'shirt-sold-out' | 'already-registered' | 'duplicate-cedula';
    };

export async function listShirtReservations(
  config: SupabaseConfig,
): Promise<ShirtReservationSlot[]> {
  const db = supabaseAdmin(config);
  const [slots, registrations] = await Promise.all([
    db
      .from('shirt_reservations')
      .select('id, gender, shirt_size, cedula')
      .eq('edition', event.edition)
      .order('gender')
      .order('shirt_size')
      .order('id'),
    db
      .from('registrations')
      .select('shirt_reservation_id')
      .eq('edition', event.edition)
      .not('shirt_reservation_id', 'is', null),
  ]);
  if (slots.error || registrations.error) throw new Error('No se pudieron consultar las reservas');
  const used = new Set((registrations.data ?? []).map((row) => row.shirt_reservation_id));
  return (slots.data ?? []).map((row) => ({
    id: row.id as string,
    gender: row.gender as ShirtReservation['gender'],
    shirtSize: row.shirt_size as ShirtReservation['shirtSize'],
    cedula: (row.cedula as string | null) ?? null,
    assigned: Boolean(row.cedula),
    registered: used.has(row.id),
  }));
}

/** El estado y talla anterior forman parte del UPDATE para detectar cambios simultáneos. */
export async function changePendingShirt(
  config: SupabaseConfig,
  id: string,
  previousSize: string,
  shirtSize: string,
): Promise<ShirtChangeResult> {
  if (
    !SHIRT_SIZES.includes(previousSize as (typeof SHIRT_SIZES)[number]) ||
    !SHIRT_SIZES.includes(shirtSize as (typeof SHIRT_SIZES)[number])
  )
    return { ok: false, reason: 'invalid' };
  const { data, error } = await supabaseAdmin(config)
    .from('registrations')
    .update({ shirt_size: shirtSize })
    .eq('edition', event.edition)
    .eq('id', id)
    .eq('payment_status', 'pendiente')
    .eq('shirt_size', previousSize)
    .select('id')
    .maybeSingle();
  if (error?.code === 'P0001' && error.message === 'shirt-sold-out')
    return { ok: false, reason: 'shirt-sold-out' };
  if (error) throw new Error(`No se pudo cambiar la talla: ${error.message}`);
  return data ? { ok: true } : { ok: false, reason: 'conflict' };
}

/** Solo se asignan las filas ya reservadas; no se crean reservas ni se cambia su distribución. */
export async function assignShirtReservation(
  config: SupabaseConfig,
  id: string,
  previousCedula: string | null,
  rawCedula: string | null,
): Promise<ShirtChangeResult> {
  const parsed = rawCedula === null ? null : cedulaSchema.safeParse(rawCedula);
  if (parsed && !parsed.success) return { ok: false, reason: 'invalid' };
  const cedula = parsed?.success ? parsed.data : null;
  let query = supabaseAdmin(config)
    .from('shirt_reservations')
    .update({ cedula })
    .eq('edition', event.edition)
    .eq('id', id);
  query = previousCedula === null ? query.is('cedula', null) : query.eq('cedula', previousCedula);
  const { data, error } = await query.select('id').maybeSingle();
  if (error?.code === '23505') return { ok: false, reason: 'duplicate-cedula' };
  if (error?.code === 'P0001' && error.message === 'shirt-reservation-already-registered')
    return { ok: false, reason: 'already-registered' };
  if (error) throw new Error(`No se pudo asignar la reserva: ${error.message}`);
  return data ? { ok: true } : { ok: false, reason: 'conflict' };
}
