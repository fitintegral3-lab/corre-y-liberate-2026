import nodemailer from 'nodemailer';

import type { EmailConfig } from '@/lib/email/config';
import type { EmailMessage } from '@/lib/email/templates';

/**
 * Envia un correo por el SMTP de Gmail (smtp.gmail.com:465 con TLS, el mismo
 * ajuste que trae nodemailer para Gmail). Lanza si Gmail lo rechaza: quien lo
 * llama decide si lo registra y sigue.
 */
export async function sendEmail(
  config: EmailConfig,
  to: string,
  message: EmailMessage,
): Promise<void> {
  const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: config.user, pass: config.appPassword },
  });
  await transport.sendMail({
    from: { name: config.fromName, address: config.user },
    to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
}
