import { submitRegistration } from '@/lib/registration/service';
import { supabaseConfig } from '@/lib/supabase/config';

/** Guarda una inscripcion. Recibe el formulario en JSON, con la ruta del comprobante ya subido. */
export async function POST(request: Request): Promise<Response> {
  const config = supabaseConfig();
  if (!config) return Response.json({ ok: false, reason: 'unavailable' }, { status: 503 });

  const payload = await request.json().catch(() => null);
  const result = await submitRegistration(config, payload);
  const status = result.ok
    ? 201
    : result.reason === 'unavailable'
      ? 503
      : result.reason === 'duplicate-cedula'
        ? 409
        : 422;
  return Response.json(result, { status });
}
