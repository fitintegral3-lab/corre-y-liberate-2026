import { randomUUID } from 'node:crypto';

import { distances, event, presalePhases, terms } from '@/content';
import { distanceIdSchema } from '@/domain/event/schema';
import { priceRegistration, type PriceResult } from '@/domain/registration/pricing';
import { categoryFor, cedulaSchema, registrationSchema } from '@/domain/registration/schema';
import { discountCodes, paymentQrsByPhase } from '@/lib/registration/payment-config';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { SheetRegistration } from '@/lib/sheets/registration-row';
import { RECEIPTS_BUCKET, type SupabaseConfig } from '@/lib/supabase/config';

import type { RegistrationErrorReason } from '@/content';

/** Precio y QR para una distancia y un codigo escritos como texto. */
export function quote(
  rawDistance: string | null,
  rawCode: string | null,
  now = new Date(),
): PriceResult | { ok: false; reason: 'invalid' } {
  const distance = distanceIdSchema.safeParse(rawDistance);
  if (!distance.success) return { ok: false, reason: 'invalid' };
  const code = (rawCode ?? '').trim().toUpperCase() || null;
  return priceRegistration({
    distanceId: distance.data,
    code,
    phases: presalePhases,
    codes: discountCodes,
    qrsByPhase: paymentQrsByPhase,
    now,
  });
}

const RECEIPT_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
} as const;
const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;

/**
 * URL firmada para que el navegador suba el comprobante directo a Supabase.
 * El archivo no pasa por el servidor de Next: una foto de celular supera
 * facil el limite de cuerpo de una funcion de Vercel. La ruta la elige el
 * servidor, nunca el navegador.
 */
export async function createReceiptUpload(
  config: SupabaseConfig,
  contentType: string,
  size: number,
): Promise<
  { ok: true; path: string; token: string } | { ok: false; reason: RegistrationErrorReason }
> {
  const extension = RECEIPT_TYPES[contentType as keyof typeof RECEIPT_TYPES];
  if (!extension || !Number.isFinite(size) || size <= 0 || size > MAX_RECEIPT_BYTES) {
    return { ok: false, reason: 'receipt-invalid' };
  }
  const path = `pendientes/${randomUUID()}.${extension}`;
  const { data, error } = await supabaseAdmin(config)
    .storage.from(RECEIPTS_BUCKET)
    .createSignedUploadUrl(path);
  if (error || !data) {
    console.error('[inscripcion] no se pudo firmar la subida:', error?.message);
    return { ok: false, reason: 'unavailable' };
  }
  return { ok: true, path: data.path, token: data.token };
}

/** Si ya hay una inscripcion con esa cedula en esta edicion. */
async function cedulaTaken(config: SupabaseConfig, cedula: string): Promise<boolean> {
  const { count, error } = await supabaseAdmin(config)
    .from('registrations')
    .select('id', { count: 'exact', head: true })
    .eq('edition', event.edition)
    .eq('cedula', cedula);
  // Si la consulta falla no se frena a nadie: la restriccion unica de la tabla
  // lo vuelve a comprobar al guardar.
  return !error && (count ?? 0) > 0;
}

export type SubmitResult =
  | { ok: true; id: string; total: number; category: string; record: SheetRegistration }
  | { ok: false; reason: RegistrationErrorReason; fields?: Record<string, string> };

/**
 * Guarda una inscripcion. Todo se vuelve a validar aca: lo que muestra el
 * formulario es un anticipo, y el precio, la categoria y la cedula unica los
 * decide el servidor.
 */
export async function submitRegistration(
  config: SupabaseConfig,
  payload: unknown,
  now = new Date(),
): Promise<SubmitResult> {
  const parsed = registrationSchema.safeParse(payload);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form');
      fields[key] ??= issue.message;
    }
    // Si lo unico que falta es el comprobante, es la validacion previa a
    // subirlo: se aprovecha para avisar una cedula repetida antes de que la
    // persona suba el archivo, que si no quedaria huerfano en el bucket.
    if (Object.keys(fields).length === 1 && fields.receiptPath) {
      const cedula = cedulaSchema.safeParse((payload as { cedula?: unknown } | null)?.cedula);
      if (cedula.success && (await cedulaTaken(config, cedula.data))) {
        return {
          ok: false,
          reason: 'duplicate-cedula',
          fields: { cedula: 'Esta cédula ya está inscrita' },
        };
      }
    }
    return { ok: false, reason: 'invalid', fields };
  }
  const data = parsed.data;

  const priced = priceRegistration({
    distanceId: data.distanceId,
    code: data.referralCode,
    phases: presalePhases,
    codes: discountCodes,
    qrsByPhase: paymentQrsByPhase,
    now,
  });
  if (!priced.ok) return { ok: false, reason: priced.reason };
  const { price } = priced;

  const supabase = supabaseAdmin(config);
  const receipt = await supabase.storage.from(RECEIPTS_BUCKET).exists(data.receiptPath);
  if (receipt.error || !receipt.data) return { ok: false, reason: 'receipt-missing' };

  const distanceLabel =
    distances.find((distance) => distance.id === data.distanceId)?.label ?? data.distanceId;
  const category = categoryFor(distanceLabel, data.gender);

  const { data: row, error } = await supabase
    .from('registrations')
    .insert({
      edition: event.edition,
      distance_id: data.distanceId,
      category,
      gender: data.gender,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      city: data.city,
      birth_date: data.birthDate,
      cedula: data.cedula,
      phone: data.phone,
      eps: data.eps,
      blood_type: data.bloodType,
      team: data.team,
      shirt_size: data.shirtSize,
      emergency_name: data.emergencyName,
      emergency_phone: data.emergencyPhone,
      recent_competition: data.recentCompetition,
      has_illness: data.hasIllness,
      medical_condition: data.medicalCondition,
      observation: data.observation,
      accepted_terms_at: now.toISOString(),
      terms_version: terms.version,
      phase_id: price.phase.id,
      referral_code: price.code,
      base_price: price.basePrice,
      total: price.total,
      receipt_path: data.receiptPath,
    })
    .select('id, created_at')
    .single();

  if (error) {
    // 23505 es "unique_violation" de Postgres: la cedula ya esta inscrita en
    // esta edicion. Es el unico choque que se le explica a la persona.
    if (error.code === '23505')
      return {
        ok: false,
        reason: 'duplicate-cedula',
        fields: { cedula: 'Esta cédula ya está inscrita' },
      };
    console.error('[inscripcion] no se pudo guardar:', error.code, error.message);
    return { ok: false, reason: 'unavailable' };
  }

  const record: SheetRegistration = {
    id: row.id as string,
    createdAt: row.created_at as string,
    paymentStatus: 'pendiente',
    distanceLabel,
    gender: data.gender,
    category,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    city: data.city,
    shirtSize: data.shirtSize,
    birthDate: data.birthDate,
    cedula: data.cedula,
    phone: data.phone,
    eps: data.eps,
    bloodType: data.bloodType,
    team: data.team,
    emergencyName: data.emergencyName,
    emergencyPhone: data.emergencyPhone,
    recentCompetition: data.recentCompetition,
    hasIllness: data.hasIllness,
    medicalCondition: data.medicalCondition,
    referralCode: price.code,
    basePrice: price.basePrice,
    total: price.total,
    receiptPath: data.receiptPath,
    observation: data.observation,
  };
  return { ok: true, id: record.id, total: price.total, category, record };
}
