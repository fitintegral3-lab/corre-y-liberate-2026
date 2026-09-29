import { after } from 'next/server';

import { emailConfig } from '@/lib/email/config';
import { sendEmail } from '@/lib/email/send';
import { registrationReceivedEmail } from '@/lib/email/templates';
import { receiptsConfig } from '@/lib/gcs/receipts';
import { submitRegistration } from '@/lib/registration/service';
import { appendRegistration } from '@/lib/sheets/append';
import { sheetsConfig } from '@/lib/sheets/config';
import { supabaseConfig } from '@/lib/supabase/config';

/** Guarda una inscripcion. Recibe el formulario en JSON, con la ruta del comprobante ya subido. */
export async function POST(request: Request): Promise<Response> {
  const config = supabaseConfig();
  const receipts = receiptsConfig();
  if (!config || !receipts)
    return Response.json({ ok: false, reason: 'unavailable' }, { status: 503 });

  const payload = await request.json().catch(() => null);
  const result = await submitRegistration(config, receipts, payload);

  if (!result.ok) {
    const status =
      result.reason === 'unavailable' ? 503 : result.reason === 'duplicate-cedula' ? 409 : 422;
    return Response.json(result, { status });
  }

  // La copia a Drive corre despues de responder: el corredor no espera a
  // Google, y si Google falla la inscripcion ya quedo en Supabase, que es la
  // fuente de verdad. El error queda en el log con el id para reponerla.
  const sheets = sheetsConfig();
  if (sheets) {
    after(() =>
      appendRegistration(sheets, result.record).catch((error: unknown) => {
        console.error('[sheets] no se copio la inscripcion', result.id, (error as Error).message);
      }),
    );
  }

  // El correo de "recibimos tu inscripcion" sale igual despues de responder:
  // si Gmail falla, la inscripcion ya quedo guardada y el error queda en el log.
  const mail = emailConfig();
  if (mail) {
    const { record } = result;
    after(() =>
      sendEmail(
        mail,
        record.email,
        registrationReceivedEmail({
          firstName: record.firstName,
          category: record.category,
          total: record.total,
          referralCode: record.referralCode,
        }),
      ).catch((error: unknown) => {
        console.error(
          '[correo] no se envio la confirmacion de',
          result.id,
          (error as Error).message,
        );
      }),
    );
  }

  return Response.json(
    { ok: true, id: result.id, total: result.total, category: result.category },
    { status: 201 },
  );
}
