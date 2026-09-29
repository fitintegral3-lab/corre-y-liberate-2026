import { supabaseAdmin } from '@/lib/supabase/admin';

import type { SupabaseConfig } from '@/lib/supabase/config';

export const PAYMENT_STATUSES = ['pendiente', 'aprobado', 'rechazado'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export interface AdminRegistration {
  id: string;
  createdAt: string;
  paymentStatus: PaymentStatus;
  firstName: string;
  lastName: string;
  cedula: string;
  email: string;
  phone: string;
  category: string;
  referralCode: string | null;
  basePrice: number;
  total: number;
  receiptPath: string;
}

/** Inscripciones para revisar, las mas nuevas primero. Unas 400 caben en una sola consulta. */
export async function listRegistrations(
  config: SupabaseConfig,
  status: PaymentStatus | 'todos',
): Promise<AdminRegistration[]> {
  let query = supabaseAdmin(config)
    .from('registrations')
    .select(
      'id, created_at, payment_status, first_name, last_name, cedula, email, phone, category, referral_code, base_price, total, receipt_path',
    )
    .order('created_at', { ascending: false })
    .limit(1000);
  if (status !== 'todos') query = query.eq('payment_status', status);

  const { data, error } = await query;
  if (error) throw new Error(`No se pudieron leer las inscripciones: ${error.message}`);
  return (data ?? []).map((row) => ({
    id: row.id as string,
    createdAt: row.created_at as string,
    paymentStatus: row.payment_status as PaymentStatus,
    firstName: row.first_name as string,
    lastName: row.last_name as string,
    cedula: row.cedula as string,
    email: row.email as string,
    phone: row.phone as string,
    category: row.category as string,
    referralCode: (row.referral_code as string | null) ?? null,
    basePrice: row.base_price as number,
    total: row.total as number,
    receiptPath: row.receipt_path as string,
  }));
}

/** Cambia el estado del pago. El webhook de Supabase manda el correo al corredor. */
export async function setPaymentStatus(
  config: SupabaseConfig,
  id: string,
  status: PaymentStatus,
): Promise<void> {
  const { error } = await supabaseAdmin(config)
    .from('registrations')
    .update({ payment_status: status })
    .eq('id', id);
  if (error) throw new Error(`No se pudo cambiar el estado de ${id}: ${error.message}`);
}
