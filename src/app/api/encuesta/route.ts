import { surveyResponseSchema, toSurveySubmission } from '@/features/experience-survey/schema';
import { deniedAccess } from '@/app/api/encuesta/denied';
import { surveyAccess, type SurveyAccess } from '@/lib/registration/survey-access';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { supabaseConfig } from '@/lib/supabase/config';

const unavailable = () => Response.json({ ok: false }, { status: 503 });

export async function POST(request: Request) {
  const parsed = surveyResponseSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return deniedAccess({ status: 'invalid' });

  const config = supabaseConfig();
  if (!config) return unavailable();

  let access: SurveyAccess;
  try {
    access = await surveyAccess(config, parsed.data.identifier, parsed.data.submissionId);
  } catch (error) {
    console.error('[encuesta] no se pudo comprobar la inscripción:', (error as Error).message);
    return unavailable();
  }
  if (access.status === 'saved') return Response.json({ ok: true });
  if (access.status !== 'eligible') return deniedAccess(access);

  const { error } = await supabaseAdmin(config)
    .from('experience_survey_responses')
    .insert(toSurveySubmission(parsed.data, access.registrationId));

  // Otro envío ocupó la misma inscripción entre la búsqueda y el guardado.
  if (error?.code === '23505') return deniedAccess({ status: 'answered' });
  if (error) {
    console.error('[encuesta] no se guardó la respuesta en Supabase:', error.code);
    return unavailable();
  }
  return Response.json({ ok: true }, { status: 201 });
}
