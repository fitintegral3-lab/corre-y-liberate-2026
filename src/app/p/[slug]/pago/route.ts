import { adminAllowed } from '@/lib/admin/auth';
import { PAYMENT_STATUSES, setPaymentStatus, type PaymentStatus } from '@/lib/admin/registrations';
import { sheetsConfig } from '@/lib/sheets/config';
import { updateSheetStatus } from '@/lib/sheets/update-status';
import { supabaseConfig } from '@/lib/supabase/config';

interface Context {
  params: Promise<{ slug: string }>;
}

/**
 * Aprueba o rechaza un pago: cambia el estado en Supabase (su webhook le
 * escribe al corredor) y en la hoja de Drive. Recibe `{ id, status }`.
 */
export async function POST(request: Request, { params }: Context): Promise<Response> {
  const { slug } = await params;
  if (!adminAllowed(slug, request.headers.get('authorization')))
    return new Response(null, { status: 404 });

  // Solo desde la propia pagina: otro sitio no puede disparar un cambio
  // aprovechando que el navegador ya tiene las credenciales guardadas.
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return new Response(null, { status: 403 });

  const body = (await request.json().catch(() => null)) as {
    id?: unknown;
    status?: unknown;
  } | null;
  const id = typeof body?.id === 'string' ? body.id : '';
  const status = body?.status as PaymentStatus;
  if (!/^[0-9a-f-]{36}$/.test(id) || !PAYMENT_STATUSES.includes(status)) {
    return Response.json({ ok: false, reason: 'invalid' }, { status: 422 });
  }

  const config = supabaseConfig();
  if (!config) return Response.json({ ok: false, reason: 'unavailable' }, { status: 503 });
  try {
    await setPaymentStatus(config, id, status);
  } catch (error) {
    console.error('[admin]', (error as Error).message);
    return Response.json({ ok: false, reason: 'unavailable' }, { status: 503 });
  }

  // La hoja es una copia: si falla, el cambio ya quedo en la base y se avisa.
  const sheets = sheetsConfig();
  let sheet: 'updated' | 'missing' | 'error' | 'off' = 'off';
  if (sheets) {
    sheet = await updateSheetStatus(sheets, id, status)
      .then((found) => (found ? 'updated' : 'missing'))
      .catch((error: unknown) => {
        console.error('[admin] no se actualizo la hoja', id, (error as Error).message);
        return 'error' as const;
      });
  }
  return Response.json({ ok: true, sheet });
}
