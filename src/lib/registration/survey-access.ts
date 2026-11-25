import { event } from '@/content';
import { cedulaSchema, mobileSchema } from '@/domain/registration/schema';
import { supabaseAdmin } from '@/lib/supabase/admin';

import type { SurveyRespondent } from '@/features/experience-survey/sheet-row';
import type { SupabaseConfig } from '@/lib/supabase/config';

export type SurveyAccess =
  | { status: 'eligible'; registrationId: string }
  /** Esta misma respuesta ya quedó guardada: un reintento del envío. */
  | { status: 'saved' }
  | { status: 'answered' }
  | { status: 'not_found' }
  | { status: 'invalid' };

/**
 * Busca, por cédula o por celular, una inscripción de esta edición que aún no
 * haya respondido la encuesta. Un mismo celular puede tener varias
 * inscripciones (una familia): cada respuesta ocupa la siguiente pendiente.
 * Las inscripciones rechazadas no dan acceso.
 */
export async function surveyAccess(
  config: SupabaseConfig,
  identifier: string,
  submissionId?: string,
): Promise<SurveyAccess> {
  const filters: string[] = [];
  const cedula = cedulaSchema.safeParse(identifier);
  const phone = mobileSchema('El celular').safeParse(identifier);
  // Los dos esquemas dejan solo letras y dígitos, así que no pueden romper el filtro.
  if (cedula.success) filters.push(`cedula.eq.${cedula.data}`);
  if (phone.success) filters.push(`phone.eq.${phone.data}`);
  if (filters.length === 0) return { status: 'invalid' };

  const db = supabaseAdmin(config);
  const registrations = await db
    .from('registrations')
    .select('id')
    .eq('edition', event.edition)
    .neq('payment_status', 'rechazado')
    .or(filters.join(','))
    .order('created_at');
  if (registrations.error) throw new Error(`inscripciones: ${registrations.error.code}`);

  const ids = (registrations.data as { id: string }[]).map(({ id }) => id);
  if (ids.length === 0) return { status: 'not_found' };

  const responses = await db
    .from('experience_survey_responses')
    .select('registration_id, submission_id')
    .in('registration_id', ids);
  if (responses.error) throw new Error(`respuestas: ${responses.error.code}`);

  const answered = responses.data as { registration_id: string; submission_id: string }[];
  if (submissionId && answered.some((row) => row.submission_id === submissionId)) {
    return { status: 'saved' };
  }
  const taken = new Set(answered.map((row) => row.registration_id));
  const pending = ids.find((id) => !taken.has(id));
  return pending ? { status: 'eligible', registrationId: pending } : { status: 'answered' };
}

/** Datos de la inscripción que acompañan la respuesta en la hoja. */
export async function surveyRespondent(
  config: SupabaseConfig,
  registrationId: string,
): Promise<SurveyRespondent> {
  const { data, error } = await supabaseAdmin(config)
    .from('registrations')
    .select('first_name, last_name, cedula, phone, email, distance_id, category')
    .eq('id', registrationId)
    .single<SurveyRespondent>();
  if (error) throw new Error(`inscripción: ${error.code}`);
  return data;
}
