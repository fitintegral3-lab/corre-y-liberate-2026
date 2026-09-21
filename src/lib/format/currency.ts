/**
 * Pesos colombianos.
 *
 * El contenido guarda montos como enteros (`100000`), no como cadenas
 * (`'$100.000'`): asi se pueden sumar los premios por rama, comparar precios
 * entre preventas y exponerlos en datos estructurados sin volver a parsear.
 * El formato vive aca, en un solo lugar.
 */

const cop = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

/** `100000` -> `$100.000`. */
export function formatCop(amount: number): string {
  return `$${cop.format(amount)}`;
}

/**
 * `100000` -> `100.000 COP`. Para lectores de pantalla y datos estructurados,
 * donde `$` solo es ambiguo entre monedas.
 */
export function formatCopWithCode(amount: number): string {
  return `${cop.format(amount)} COP`;
}
