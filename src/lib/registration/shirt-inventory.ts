import { event } from '@/content';
import { supabaseAdmin } from '@/lib/supabase/admin';

import type { GENDERS, SHIRT_SIZES } from '@/domain/registration/schema';
import type { SupabaseConfig } from '@/lib/supabase/config';

export interface ShirtStock {
  gender: (typeof GENDERS)[number];
  shirtSize: (typeof SHIRT_SIZES)[number];
  total: number;
  reserved: number;
  available: number;
}

export type ShirtReservation = Pick<ShirtStock, 'gender' | 'shirtSize'>;

/** Consulta individual; no publica el listado de cédulas ni el ID de la reserva. */
export async function findShirtReservation(
  config: SupabaseConfig,
  cedula: string,
): Promise<ShirtReservation | null> {
  const { data, error } = await supabaseAdmin(config)
    .from('shirt_reservations')
    .select('gender, shirt_size')
    .eq('edition', event.edition)
    .eq('cedula', cedula)
    .maybeSingle();
  if (error) throw new Error(`No se pudo consultar la reserva: ${error.message}`);
  return data
    ? {
        gender: data.gender as ShirtStock['gender'],
        shirtSize: data.shirt_size as ShirtStock['shirtSize'],
      }
    : null;
}

export async function listShirtStock(config: SupabaseConfig): Promise<ShirtStock[]> {
  const { data, error } = await supabaseAdmin(config)
    .from('shirt_inventory')
    .select('gender, shirt_size, total, reserved')
    .eq('edition', event.edition);
  if (error) throw new Error(`No se pudo leer el inventario: ${error.message}`);
  return (data ?? []).map((row) => ({
    gender: row.gender as ShirtStock['gender'],
    shirtSize: row.shirt_size as ShirtStock['shirtSize'],
    total: row.total as number,
    reserved: row.reserved as number,
    available: Math.max(0, (row.total as number) - (row.reserved as number)),
  }));
}
