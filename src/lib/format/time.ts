/**
 * Horas de reloj tal como se anuncian («6:20 am», «5:00 A.M.») convertidas al
 * formato que entienden las maquinas.
 *
 * La pagina muestra la hora como la escribio quien organiza; los datos
 * estructurados y el `<time datetime>` necesitan 24 horas con zona. Convertir
 * aca evita guardar la misma hora dos veces en el contenido, que es la forma
 * mas comun de que una de las dos quede vieja.
 */

/** Colombia no aplica horario de verano: el desfase es fijo todo el anio. */
export const COLOMBIA_UTC_OFFSET = '-05:00';

const CLOCK = /^(\d{1,2}):([0-5]\d) ?(a\.?m\.?|p\.?m\.?)$/i;

/** `6:20 am` -> `06:20`; `5:00 A.M.` -> `05:00`; `12:30 pm` -> `12:30`. */
export function to24Hour(clock: string): string {
  const match = CLOCK.exec(clock.trim());

  if (!match) {
    throw new Error(`Hora invalida: "${clock}". Formato esperado: "6:20 am".`);
  }

  const [, rawHours, minutes, meridiem] = match;
  const isPm = meridiem.toLowerCase().startsWith('p');
  const hours = Number(rawHours) % 12;

  return `${String(isPm ? hours + 12 : hours).padStart(2, '0')}:${minutes}`;
}

/** `2026-11-22` + `5:00 A.M.` -> `2026-11-22T05:00:00-05:00`. */
export function toIsoDateTime(
  isoDate: string,
  clock: string,
  utcOffset: string = COLOMBIA_UTC_OFFSET,
): string {
  return `${isoDate}T${to24Hour(clock)}:00${utcOffset}`;
}
