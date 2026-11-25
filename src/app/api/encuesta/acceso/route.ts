import { deniedAccess } from '@/app/api/encuesta/denied';
import { surveyAccessSchema } from '@/features/experience-survey/schema';
import { surveyAccess } from '@/lib/registration/survey-access';
import { supabaseConfig } from '@/lib/supabase/config';

/** Comprueba la inscripción antes de mostrar las preguntas. No devuelve datos de la persona. */
export async function POST(request: Request) {
  const parsed = surveyAccessSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return deniedAccess({ status: 'invalid' });

  const config = supabaseConfig();
  if (!config) return Response.json({ ok: false }, { status: 503 });

  try {
    const access = await surveyAccess(config, parsed.data.identifier);
    return access.status === 'eligible' || access.status === 'saved'
      ? Response.json({ ok: true })
      : deniedAccess(access);
  } catch (error) {
    console.error('[encuesta] no se pudo comprobar la inscripción:', (error as Error).message);
    return Response.json({ ok: false }, { status: 503 });
  }
}
