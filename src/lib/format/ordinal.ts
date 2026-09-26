/**
 * Ordinales de premiacion.
 *
 * El puesto se guarda como numero (`1`) y no como texto (`'1.º LUGAR'`): eso
 * permite ordenar, validar que no haya dos primeros lugares y cambiar el
 * formato sin tocar el contenido.
 */

/** `1` -> `1.º`. */
export function formatOrdinal(position: number): string {
  return `${position}.º`;
}

/** `1` -> `1.º LUGAR`. */
export function formatPlaceLabel(position: number): string {
  return `${formatOrdinal(position)} LUGAR`;
}
