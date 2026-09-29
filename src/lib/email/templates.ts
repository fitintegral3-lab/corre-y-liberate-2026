import { event, eventName, venue, venueFullAddress } from '@/content';
import { siteConfig } from '@/config/site';
import { formatCop, formatWeekdayLongDate } from '@/lib/format';

/**
 * Los tres correos de la inscripcion. Funciones puras: reciben los datos y
 * devuelven asunto, texto plano y HTML, asi se prueban sin enviar nada.
 *
 * Todo lo que escribio el corredor pasa por `escape` antes de entrar al HTML:
 * un nombre con `<` no puede meter marcado en un correo que sale firmado por
 * la organizacion.
 */
export interface EmailMessage {
  subject: string;
  text: string;
  html: string;
}

export interface RegistrationEmailData {
  firstName: string;
  category: string;
  total: number;
  referralCode: string | null;
}

export function escape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const eventDate = formatWeekdayLongDate(event.date);

function layout(title: string, paragraphs: string[]): string {
  const body = paragraphs
    .map((p) => `<p style="margin:0 0 14px;line-height:1.5">${p}</p>`)
    .join('');
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#111">
<div style="max-width:560px;margin:0 auto;padding:24px">
<div style="background:#fff;border-radius:16px;padding:28px">
<p style="margin:0 0 6px;color:#cc420d;font-weight:bold;font-size:12px;letter-spacing:2px">${escape(eventName.toUpperCase())}</p>
<h1 style="margin:0 0 18px;font-size:24px">${title}</h1>
${body}
<p style="margin:18px 0 0;font-size:13px;color:#555">¿Dudas? Escríbenos por <a href="${siteConfig.links.whatsapp}" style="color:#cc420d">WhatsApp</a>.</p>
</div></div></body></html>`;
}

function summaryLines(data: RegistrationEmailData): { text: string[]; html: string[] } {
  const code = data.referralCode ? ` (con el código ${data.referralCode})` : '';
  return {
    text: [`Carrera: ${data.category}`, `Valor: ${formatCop(data.total)}${code}`],
    html: [
      `<strong>Carrera:</strong> ${escape(data.category)}<br><strong>Valor:</strong> ${formatCop(data.total)}${escape(code)}`,
    ],
  };
}

const eventLine = `${eventDate} · ${venue.name}, ${venueFullAddress}`;

export function registrationReceivedEmail(data: RegistrationEmailData): EmailMessage {
  const summary = summaryLines(data);
  return {
    subject: `Recibimos tu inscripción · ${eventName}`,
    text: [
      `Hola ${data.firstName},`,
      '',
      `Recibimos tu inscripción a ${eventName}.`,
      ...summary.text,
      '',
      'Estamos revisando tu comprobante de pago. Te escribimos cuando tu inscripción quede confirmada.',
      '',
      `La carrera: ${eventLine}.`,
      `¿Dudas? Escríbenos por WhatsApp: ${siteConfig.links.whatsapp}`,
    ].join('\n'),
    html: layout('¡Recibimos tu inscripción!', [
      `Hola ${escape(data.firstName)},`,
      ...summary.html,
      'Estamos revisando tu comprobante de pago. Te escribimos cuando tu inscripción quede confirmada.',
      `<strong>La carrera:</strong> ${escape(eventLine)}.`,
    ]),
  };
}

export function paymentApprovedEmail(data: RegistrationEmailData): EmailMessage {
  const summary = summaryLines(data);
  return {
    subject: `¡Tu inscripción está confirmada! · ${eventName}`,
    text: [
      `Hola ${data.firstName},`,
      '',
      `Tu pago fue aprobado y tu cupo en ${data.category} quedó asegurado.`,
      ...summary.text,
      '',
      `Nos vemos el ${eventLine}. Las puertas abren a las ${venue.doorsOpenAt}.`,
      `Síguenos en Instagram para la entrega de kits: ${siteConfig.links.instagram}`,
    ].join('\n'),
    html: layout('¡Tu inscripción está confirmada!', [
      `Hola ${escape(data.firstName)},`,
      `Tu pago fue aprobado y tu cupo en <strong>${escape(data.category)}</strong> quedó asegurado.`,
      ...summary.html,
      `Nos vemos el ${escape(eventLine)}. Las puertas abren a las ${escape(venue.doorsOpenAt)}.`,
      `Síguenos en <a href="${siteConfig.links.instagram}" style="color:#cc420d">Instagram</a> para la información de la entrega de kits.`,
    ]),
  };
}

export function paymentRejectedEmail(data: RegistrationEmailData): EmailMessage {
  return {
    subject: `No pudimos validar tu pago · ${eventName}`,
    text: [
      `Hola ${data.firstName},`,
      '',
      `Revisamos tu inscripción a ${data.category} y no pudimos validar el pago de ${formatCop(data.total)} con el comprobante que subiste.`,
      'Escríbenos por WhatsApp con tu comprobante y lo resolvemos:',
      siteConfig.links.whatsapp,
    ].join('\n'),
    html: layout('No pudimos validar tu pago', [
      `Hola ${escape(data.firstName)},`,
      `Revisamos tu inscripción a <strong>${escape(data.category)}</strong> y no pudimos validar el pago de ${formatCop(data.total)} con el comprobante que subiste.`,
      `Escríbenos por <a href="${siteConfig.links.whatsapp}" style="color:#cc420d">WhatsApp</a> con tu comprobante y lo resolvemos.`,
    ]),
  };
}
