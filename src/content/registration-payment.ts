import { z } from 'zod';

import { discountCodeSchema, phaseQrsSchema } from '@/domain/registration/payment';

/**
 * Codigos de descuento. Todos dan el mismo descuento: el del QR "con
 * descuento" de cada distancia. `owner` es quien lo reparte, para poder
 * contar cuantas inscripciones trae cada uno.
 */
export const discountCodes = z.array(discountCodeSchema).parse([
  { code: 'SAMIRZABALETA', owner: 'Samir Zabaleta' },
  { code: 'VALECORRE', owner: 'Vale Corre' },
  { code: 'STMARMOLEJO', owner: 'St Marmolejo' },
  { code: 'PABLOBOTINA', owner: 'Pablo Botina' },
]);

/**
 * QR de pago por fase. Los montos salen de decodificar cada QR (campo 54 del
 * formato EMVCo, moneda 170 = COP) el 2026-09-28; si se cambia una imagen hay
 * que cambiar su monto, y la prueba de contenido compara el precio lleno con
 * el de `pricing.ts`.
 *
 * Solo hay QR para la preventa 2. Cuando empiece la 3 (1 de noviembre) hay que
 * agregar los suyos: sin ellos el formulario no cobra, a proposito.
 */
export const paymentQrsByPhase = z.record(z.string(), phaseQrsSchema).parse({
  'preventa-2': {
    '3k-infantil': {
      normal: { image: '/qr/3k-normal.jpeg', amount: 90_000 },
      discount: { image: '/qr/3k-descuento.jpeg', amount: 80_000 },
    },
    '5k': {
      normal: { image: '/qr/5k-normal.jpeg', amount: 120_000 },
      discount: { image: '/qr/5k-descuento.jpeg', amount: 108_000 },
    },
    '7k': {
      normal: { image: '/qr/7k-normal.jpeg', amount: 140_000 },
      discount: { image: '/qr/7k-descuento.jpeg', amount: 126_000 },
    },
    '10k': {
      normal: { image: '/qr/10k-normal.jpeg', amount: 160_000 },
      discount: { image: '/qr/10k-descuento.jpeg', amount: 144_000 },
    },
  },
});
