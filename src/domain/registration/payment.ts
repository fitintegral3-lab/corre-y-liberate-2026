import { z } from 'zod';

import { assetPathSchema, copAmountSchema, distanceIdSchema } from '@/domain/event/schema';

/** Codigo de descuento. Se guarda en mayusculas y se compara igual. */
export const discountCodeSchema = z.object({
  code: z.string().regex(/^[A-Z0-9]{3,20}$/, 'solo mayusculas y digitos, de 3 a 20'),
  /** Quien lo reparte: sirve para contar inscripciones por persona. */
  owner: z.string().min(1),
});

/**
 * QR de pago de monto fijo. El monto va adentro del QR (formato EMVCo), asi
 * que el que se muestra y el que se cobra tienen que ser el mismo: por eso se
 * declara al lado de la imagen y una prueba lo compara con el precio.
 */
const qrSchema = z.object({ image: assetPathSchema, amount: copAmountSchema.positive() });

/** QR de una fase: uno a precio lleno y uno con descuento, por distancia. */
export const phaseQrsSchema = z.record(
  distanceIdSchema,
  z.object({ normal: qrSchema, discount: qrSchema }),
);

export type DiscountCode = z.infer<typeof discountCodeSchema>;
export type PaymentQr = z.infer<typeof qrSchema>;
export type PhaseQrs = z.infer<typeof phaseQrsSchema>;
