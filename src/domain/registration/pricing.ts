import { currentPresalePhase, priceFor } from '@/domain/event/selectors';

import type { DistanceId, PresalePhase } from '@/domain/event/schema';
import type { DiscountCode, PaymentQr, PhaseQrs } from '@/domain/registration/payment';

export interface RegistrationPrice {
  phase: PresalePhase;
  basePrice: number;
  /** Codigo aplicado, ya normalizado; `null` sin codigo. */
  code: string | null;
  total: number;
  discount: number;
  /** QR que corresponde pagar: el de precio lleno o el de descuento. */
  qr: PaymentQr;
}

export type PriceResult =
  | { ok: true; price: RegistrationPrice }
  | { ok: false; reason: 'registration-closed' | 'unknown-code' | 'no-payment-qr' };

/**
 * Lo que tiene que pagar una inscripcion y con que QR.
 *
 * El pago es por QR de monto fijo, asi que el total no se calcula con un
 * porcentaje: es el monto del QR que toca. Sin QR para la fase vigente no hay
 * forma de cobrar el precio correcto, y la inscripcion se frena en vez de
 * mostrar un QR con el monto de otra preventa.
 *
 * Un codigo que no existe no se ignora: quien lo escribio espera el descuento
 * y pagaria el precio lleno sin enterarse.
 */
export function priceRegistration(input: {
  distanceId: DistanceId;
  code: string | null;
  phases: readonly PresalePhase[];
  codes: readonly DiscountCode[];
  qrsByPhase: Readonly<Record<string, PhaseQrs>>;
  now?: Date;
}): PriceResult {
  const phase = currentPresalePhase(input.phases, input.now);
  if (!phase) return { ok: false, reason: 'registration-closed' };

  const qrs = input.qrsByPhase[phase.id]?.[input.distanceId];
  if (!qrs) return { ok: false, reason: 'no-payment-qr' };

  const basePrice = priceFor(phase, input.distanceId);
  if (input.code === null) {
    return {
      ok: true,
      price: {
        phase,
        basePrice,
        code: null,
        total: qrs.normal.amount,
        discount: basePrice - qrs.normal.amount,
        qr: qrs.normal,
      },
    };
  }

  const found = input.codes.find((candidate) => candidate.code === input.code);
  if (!found) return { ok: false, reason: 'unknown-code' };

  return {
    ok: true,
    price: {
      phase,
      basePrice,
      code: found.code,
      total: qrs.discount.amount,
      discount: basePrice - qrs.discount.amount,
      qr: qrs.discount,
    },
  };
}
