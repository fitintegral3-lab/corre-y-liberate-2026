import { createReceiptUpload } from '@/lib/registration/service';
import { supabaseConfig } from '@/lib/supabase/config';

/** Firma la subida de un comprobante. Recibe `{ contentType, size }` en JSON. */
export async function POST(request: Request): Promise<Response> {
  const config = supabaseConfig();
  if (!config) return Response.json({ ok: false, reason: 'unavailable' }, { status: 503 });

  const body = (await request.json().catch(() => null)) as {
    contentType?: unknown;
    size?: unknown;
  } | null;
  const result = await createReceiptUpload(
    config,
    String(body?.contentType ?? ''),
    Number(body?.size),
  );
  return Response.json(result, { status: result.ok ? 200 : 422 });
}
