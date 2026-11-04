import { event } from '@/content';
import { ORGANIZATION_EMAIL } from '@/lib/email/notifications';
import { sendEmail } from '@/lib/email/send';
import { escape, type EmailMessage } from '@/lib/email/templates';
import { supabaseAdmin } from '@/lib/supabase/admin';

import type { EmailConfig } from '@/lib/email/config';
import type { SupabaseConfig } from '@/lib/supabase/config';

export function shirtSoldOutEmail(gender: string, size: string): EmailMessage {
  const subject = `Camisetas agotadas: ${gender} · ${size}`;
  const text = `Se agotaron las camisetas de género ${gender}, talla ${size}, en Corre y Libérate (${event.edition}ª edición). Las inscripciones pendientes y aprobadas ya están descontadas del stock. Revisa el inventario antes de reponer existencias.`;
  return { subject, text, html: `<p>${escape(text)}</p>` };
}

/** Los fallos quedan pendientes; una próxima ejecución vuelve a intentarlo. */
export async function sendShirtStockAlerts(
  config: SupabaseConfig,
  mail: EmailConfig,
): Promise<void> {
  const db = supabaseAdmin(config);
  const { data, error } = await db.rpc('claim_shirt_stock_alerts', { p_edition: event.edition });
  if (error) throw new Error(`No se pudieron reclamar los avisos: ${error.message}`);
  const results = await Promise.allSettled(
    (data ?? []).map(
      async (alert: { id: string; claim_token: string; gender: string; shirt_size: string }) => {
        try {
          await sendEmail(
            mail,
            ORGANIZATION_EMAIL,
            shirtSoldOutEmail(alert.gender, alert.shirt_size),
          );
          const { error: saved } = await db
            .from('shirt_stock_alerts')
            .update({ sent_at: new Date().toISOString(), claimed_until: null })
            .eq('id', alert.id)
            .eq('claim_token', alert.claim_token);
          if (saved) throw new Error(saved.message);
        } catch (error) {
          console.error('[stock] no se completó el aviso', alert.id, (error as Error).message);
          // La concesión vence sola incluso si la función termina abruptamente.
          // No se marca enviado hasta que Gmail confirma la entrega a SMTP.
          throw error;
        }
      },
    ),
  );
  if (results.some((result) => result.status === 'rejected')) {
    throw new Error('Quedaron avisos de stock pendientes de envío');
  }
}

export async function tryShirtStockAlerts(
  config: SupabaseConfig,
  mail: EmailConfig,
): Promise<void> {
  await sendShirtStockAlerts(config, mail).catch((error: unknown) => {
    console.error('[stock]', (error as Error).message);
  });
}
