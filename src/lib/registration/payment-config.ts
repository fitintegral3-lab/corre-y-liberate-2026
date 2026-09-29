import { z } from 'zod';

import { discountCodeSchema, phaseQrsSchema } from '@/domain/registration/payment';

import qr10kDiscount from './qr-descuento/10k.webp';
import qr3kDiscount from './qr-descuento/3k.webp';
import qr5kDiscount from './qr-descuento/5k.webp';
import qr7kDiscount from './qr-descuento/7k.webp';

/**
 * Codigos de descuento y QR de pago. SOLO SERVIDOR.
 *
 * No vive en `src/content/` a proposito: ese contenido lo importan componentes
 * de cliente, y con el los codigos terminaban en el JavaScript que baja el
 * navegador (se vio en el build del 2026-09-28). Lo mismo con los QR con
 * descuento: estaban en `public/qr/*-descuento.jpeg`, una direccion que se
 * adivina, y cualquiera podia pagar el monto rebajado sin codigo. Ahora se
 * importan desde aca, Next los publica con un hash del contenido en el nombre
 * y el servidor solo entrega esa direccion a quien escribio un codigo valido.
 *
 * `scripts/check-client-bundle.mjs` revisa despues de cada build que ningun
 * codigo aparezca en `.next/static`.
 */

/**
 * URL publicada de una imagen importada. Next entrega `{ src }`; Vitest, que
 * corre las pruebas con Vite, entrega el texto de la ruta.
 */
const urlOf = (image: { src: string } | string): string =>
  typeof image === 'string' ? image : image.src;

/** Todos dan el mismo descuento: el del QR "con descuento" de cada distancia. */
export const discountCodes = z.array(discountCodeSchema).parse([
  { code: 'SAMIRZABALETA', owner: 'Samir Zabaleta' },
  { code: 'VALECORRE', owner: 'Vale Corre' },
  { code: 'STMARMOLEJO', owner: 'St Marmolejo' },
  { code: 'PABLOBOTINA', owner: 'Pablo Botina' },
  { code: 'JDMORALES', owner: 'Jd Morales' },
]);

/**
 * QR por fase. Los montos salen de decodificar cada QR (campo 54 del formato
 * EMVCo, moneda 170 = COP) el 2026-09-28; si se cambia una imagen hay que
 * cambiar su monto. La prueba de contenido compara el precio lleno con
 * `pricing.ts`.
 *
 * Solo hay QR para la preventa 2. Cuando empiece la 3 (1 de noviembre) hay que
 * agregar los suyos: sin ellos el formulario no cobra, a proposito.
 */
export const paymentQrsByPhase = z.record(z.string(), phaseQrsSchema).parse({
  'preventa-2': {
    '3k-infantil': {
      normal: { image: '/qr/3k-normal.webp', amount: 90_000 },
      discount: { image: urlOf(qr3kDiscount), amount: 80_000 },
    },
    '5k': {
      normal: { image: '/qr/5k-normal.webp', amount: 120_000 },
      discount: { image: urlOf(qr5kDiscount), amount: 108_000 },
    },
    '7k': {
      normal: { image: '/qr/7k-normal.webp', amount: 140_000 },
      discount: { image: urlOf(qr7kDiscount), amount: 126_000 },
    },
    '10k': {
      normal: { image: '/qr/10k-normal.webp', amount: 160_000 },
      discount: { image: urlOf(qr10kDiscount), amount: 144_000 },
    },
  },
});
