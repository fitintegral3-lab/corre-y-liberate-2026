import { timingSafeEqual } from 'node:crypto';

import type { RegistrationEmailData } from '@/lib/email/templates';

/**
 * Que correo corresponde a un aviso de Supabase (Database Webhook) sobre la
 * tabla `registrations`.
 *
 * Solo un UPDATE en el que `payment_status` cambia de verdad dispara correo:
 * editar otra columna de una fila ya aprobada (el dorsal, una observacion)
 * vuelve a mandar el aviso con el mismo estado, y ahi no se escribe de nuevo
 * al corredor. Formato del aviso: supabase.com/docs/guides/database/webhooks.
 */
export type StatusEmail = {
  kind: 'approved' | 'rejected';
  to: string;
  data: RegistrationEmailData;
};

interface RegistrationRow {
  payment_status?: unknown;
  email?: unknown;
  first_name?: unknown;
  category?: unknown;
  total?: unknown;
  referral_code?: unknown;
}

export function statusEmailFor(payload: unknown): StatusEmail | null {
  const body = payload as {
    type?: unknown;
    table?: unknown;
    record?: RegistrationRow | null;
    old_record?: RegistrationRow | null;
  } | null;
  if (!body || body.type !== 'UPDATE' || body.table !== 'registrations') return null;
  const record = body.record;
  const before = body.old_record;
  if (!record || !before || record.payment_status === before.payment_status) return null;

  const kind =
    record.payment_status === 'aprobado'
      ? 'approved'
      : record.payment_status === 'rechazado'
        ? 'rejected'
        : null;
  if (!kind) return null;
  if (typeof record.email !== 'string' || typeof record.first_name !== 'string') return null;

  return {
    kind,
    to: record.email,
    data: {
      firstName: record.first_name,
      category: typeof record.category === 'string' ? record.category : '',
      total: typeof record.total === 'number' ? record.total : 0,
      referralCode: typeof record.referral_code === 'string' ? record.referral_code : null,
    },
  };
}

/** Compara el secreto del aviso sin filtrar por tiempo cuantos caracteres coinciden. */
export function secretMatches(received: string | null, expected: string): boolean {
  if (!received || !expected) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
