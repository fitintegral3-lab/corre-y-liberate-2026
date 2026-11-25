import { after } from 'next/server';

import { surveyResponseSchema, toSurveySubmission } from '@/features/experience-survey/schema';
import { SURVEY_HEADERS, toSurveyRow } from '@/features/experience-survey/sheet-row';
import { deniedAccess } from '@/app/api/encuesta/denied';
import {
  surveyAccess,
  surveyRespondent,
  type SurveyAccess,
} from '@/lib/registration/survey-access';
import { appendRowOnce } from '@/lib/sheets/append-once';
import { surveySheetsConfig } from '@/lib/sheets/survey-config';
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

  const { data: inserted, error } = await supabaseAdmin(config)
    .from('experience_survey_responses')
    .insert(toSurveySubmission(parsed.data, access.registrationId))
    .select('created_at')
    .maybeSingle<{ created_at: string }>();

  // Otro envío ocupó la misma inscripción entre la búsqueda y el guardado.
  if (error?.code === '23505') return deniedAccess({ status: 'answered' });
  if (error) {
    console.error('[encuesta] no se guardó la respuesta en Supabase:', error.code);
    return unavailable();
  }

  const { registrationId } = access;
  after(async () => {
    const sheets = await surveySheetsConfig();
    if (!sheets) return;

    try {
      const person = await surveyRespondent(config, registrationId);
      const receivedAt = inserted?.created_at ?? new Date().toISOString();
      await appendRowOnce(sheets, SURVEY_HEADERS, toSurveyRow(parsed.data, person, receivedAt));
    } catch (error) {
      console.error(
        '[encuesta] no se copió la respuesta a Sheets',
        parsed.data.submissionId,
        (error as Error).message,
      );
    }
  });

  return Response.json({ ok: true }, { status: 201 });
}
