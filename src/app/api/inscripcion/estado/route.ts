import { after } from 'next/server';

import { emailConfig } from '@/lib/email/config';
import { sendEmail } from '@/lib/email/send';
import { secretMatches, statusEmailFor } from '@/lib/email/status-change';
import { paymentApprovedEmail, paymentRejectedEmail } from '@/lib/email/templates';

/**
 * Recibe el aviso de Supabase cuando cambia una inscripcion y, si el pago
 * paso a `aprobado` o `rechazado`, le escribe al corredor.
 *
 * Supabase manda el secreto en el encabezado `x-webhook-secret`; sin el
 * secreto correcto la ruta responde 401 y no hace nada, porque cualquiera
 * podria llamarla para mandar correos en nombre de la organizacion.
 */
export async function POST(request: Request): Promise<Response> {
  const expected = process.env.SUPABASE_WEBHOOK_SECRET?.trim() ?? '';
  if (!secretMatches(request.headers.get('x-webhook-secret'), expected)) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const email = statusEmailFor(await request.json().catch(() => null));
  const config = emailConfig();
  if (email && config) {
    // Se responde enseguida y el correo sale despues: el aviso de Supabase
    // tiene un tiempo de espera corto y Gmail puede tardar.
    after(() =>
      sendEmail(
        config,
        email.to,
        email.kind === 'approved'
          ? paymentApprovedEmail(email.data)
          : paymentRejectedEmail(email.data),
      ).catch((error: unknown) => {
        console.error(
          '[correo] no se envio el aviso de pago',
          email.kind,
          (error as Error).message,
        );
      }),
    );
  }
  return Response.json({ ok: true, email: email?.kind ?? null });
}
