import { after } from 'next/server';
import { z } from 'zod';

import { cedulaSchema, SHIRT_SIZES } from '@/domain/registration/schema';
import { adminAllowed } from '@/lib/admin/auth';
import { assignShirtReservation, changePendingShirt } from '@/lib/admin/shirts';
import { emailConfig } from '@/lib/email/config';
import { tryShirtStockAlerts } from '@/lib/email/shirt-stock';
import { sheetsConfig } from '@/lib/sheets/config';
import { updateSheetShirtSize } from '@/lib/sheets/update-status';
import { supabaseConfig } from '@/lib/supabase/config';

const payloadSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('registration'),
    id: z.uuid(),
    previousSize: z.enum(SHIRT_SIZES),
    shirtSize: z.enum(SHIRT_SIZES),
  }),
  z.object({
    action: z.literal('reservation'),
    id: z.uuid(),
    previousCedula: cedulaSchema.nullable(),
    cedula: cedulaSchema.nullable(),
  }),
]);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  if (!adminAllowed(slug, request.headers.get('authorization')))
    return new Response(null, { status: 404 });
  if (
    request.headers.get('origin') !== new URL(request.url).origin ||
    !request.headers.get('content-type')?.startsWith('application/json')
  )
    return new Response(null, { status: 403 });
  const parsed = payloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false, reason: 'invalid' }, { status: 422 });
  const config = supabaseConfig();
  if (!config) return Response.json({ ok: false, reason: 'unavailable' }, { status: 503 });
  const body = parsed.data;
  try {
    const result =
      body.action === 'registration'
        ? await changePendingShirt(config, body.id, body.previousSize, body.shirtSize)
        : await assignShirtReservation(config, body.id, body.previousCedula, body.cedula);
    if (!result.ok)
      return Response.json(result, { status: result.reason === 'invalid' ? 422 : 409 });
    let sheet: 'updated' | 'missing' | 'error' | 'off' = 'off';
    if (body.action === 'registration') {
      const mail = emailConfig();
      if (mail) after(() => tryShirtStockAlerts(config, mail));
      const sheets = sheetsConfig();
      if (sheets) {
        sheet = await updateSheetShirtSize(sheets, body.id, body.shirtSize)
          .then((found) => (found ? ('updated' as const) : ('missing' as const)))
          .catch((error: unknown) => {
            console.error('[admin camisetas] no se actualizó la hoja', (error as Error).message);
            return 'error' as const;
          });
      }
    }
    return Response.json({ ok: true, sheet });
  } catch (error) {
    console.error('[admin camisetas]', (error as Error).message);
    return Response.json({ ok: false, reason: 'unavailable' }, { status: 503 });
  }
}
