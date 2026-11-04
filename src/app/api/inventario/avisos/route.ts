import { emailConfig } from '@/lib/email/config';
import { sendShirtStockAlerts } from '@/lib/email/shirt-stock';
import { secretMatches } from '@/lib/email/status-change';
import { supabaseConfig } from '@/lib/supabase/config';

/** Permite drenar/reintentar la cola, también inmediatamente después de la migración. */
export async function POST(request: Request): Promise<Response> {
  if (
    !secretMatches(
      request.headers.get('x-webhook-secret'),
      process.env.SUPABASE_WEBHOOK_SECRET?.trim() ?? '',
    )
  ) {
    return Response.json({ ok: false }, { status: 401 });
  }
  const db = supabaseConfig();
  const mail = emailConfig();
  if (!db || !mail) return Response.json({ ok: false }, { status: 503 });
  try {
    await sendShirtStockAlerts(db, mail);
    return Response.json({ ok: true });
  } catch (error) {
    console.error('[stock]', (error as Error).message);
    return Response.json({ ok: false }, { status: 503 });
  }
}
