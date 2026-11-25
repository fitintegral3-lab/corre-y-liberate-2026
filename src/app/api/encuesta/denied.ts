import type { SurveyAccess } from '@/lib/registration/survey-access';

type Denied = Extract<SurveyAccess, { status: 'invalid' | 'not_found' | 'answered' }>;

const statusFor: Record<Denied['status'], number> = { invalid: 422, not_found: 404, answered: 409 };

/** Respuesta HTTP para quien no puede responder la encuesta. */
export function deniedAccess({ status }: Denied) {
  return Response.json({ ok: false, reason: status }, { status: statusFor[status] });
}
