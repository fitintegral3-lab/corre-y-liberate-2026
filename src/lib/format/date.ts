/**
 * Fechas en espanol de Colombia.
 *
 * Todo el contenido guarda fechas como `YYYY-MM-DD` (ver `isoDateSchema`), sin
 * hora ni zona: una carrera empieza el 22 de noviembre en Jamundi, no en un
 * instante UTC.
 */

const LOCALE = 'es-CO';

/**
 * Convierte `YYYY-MM-DD` en un `Date` en la zona horaria local.
 *
 * `new Date('2026-11-22')` interpreta la cadena como medianoche **UTC**, asi que
 * al formatearla en America/Bogota (UTC-5) devuelve «21 de noviembre»: un dia
 * menos en toda la pagina. Construyendo la fecha por componentes el valor cae en
 * el dia correcto sea cual sea la zona del servidor que renderiza.
 */
export function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

const longDate = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const dayAndMonth = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long' });
const dayOnly = new Intl.DateTimeFormat(LOCALE, { day: 'numeric' });
const weekday = new Intl.DateTimeFormat(LOCALE, { weekday: 'long' });
const shortMonth = new Intl.DateTimeFormat(LOCALE, { month: 'short' });

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** `2026-11-22` -> `22 de noviembre de 2026`. */
export function formatLongDate(iso: string): string {
  return longDate.format(parseIsoDate(iso));
}

/** `2026-11-22` -> `Domingo`. */
export function formatWeekday(iso: string): string {
  return capitalize(weekday.format(parseIsoDate(iso)));
}

/**
 * `2026-11-22` -> `22 nov`.
 *
 * Se arma a mano porque `Intl` con `month: 'short'` rinde «22 de nov» en
 * espanol, y el diseno pide la forma compacta sin preposicion. Algunas
 * versiones de ICU agregan punto al mes abreviado: se quita.
 */
export function formatDayAndShortMonth(iso: string): string {
  const date = parseIsoDate(iso);
  return `${date.getDate()} ${shortMonth.format(date).replace(/\.$/, '')}`;
}

/** `2026-11-22` -> `Domingo 22 de noviembre de 2026`. */
export function formatWeekdayLongDate(iso: string): string {
  return `${formatWeekday(iso)} ${formatLongDate(iso)}`;
}

/**
 * Rango de fechas legible, sin repetir lo que ya se dijo:
 *
 * - meses distintos -> `1 de agosto al 15 de septiembre de 2026`
 * - mismo mes       -> `1 al 21 de noviembre de 2026`
 * - anios distintos -> `1 de diciembre de 2026 al 15 de enero de 2027`
 */
export function formatDateRange(fromIso: string, toIso: string): string {
  const from = parseIsoDate(fromIso);
  const to = parseIsoDate(toIso);

  if (from.getFullYear() !== to.getFullYear()) {
    return `${longDate.format(from)} al ${longDate.format(to)}`;
  }

  if (from.getMonth() === to.getMonth()) {
    return `${dayOnly.format(from)} al ${longDate.format(to)}`;
  }

  return `${dayAndMonth.format(from)} al ${longDate.format(to)}`;
}

/**
 * Zona horaria del evento. Todo lo que dependa de «hoy» —que preventa esta
 * vigente, si las inscripciones siguen abiertas— se resuelve en la hora de
 * Jamundi y no en la del servidor que renderiza, que en produccion es UTC.
 */
export const EVENT_TIME_ZONE = 'America/Bogota';

const isoInEventZone = new Intl.DateTimeFormat('en-CA', {
  timeZone: EVENT_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** `Date` -> `YYYY-MM-DD` en la zona horaria del evento. */
export function toEventIsoDate(instant: Date): string {
  return isoInEventZone.format(instant);
}
