import { currentPresalePhase, priceFor } from '@/domain/event/selectors';

import type { Distance, DistanceId, PresalePhase } from '@/domain/event/schema';
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
  | {
      ok: false;
      reason:
        | 'registration-closed'
        | 'sold-out'
        | 'unknown-code'
        | 'no-payment-qr'
        | 'shirt-option-unavailable'
        | 'no-shirt-discount';
    };

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
 *
 * Una distancia agotada no se cobra aunque tenga precio y QR: el formulario la
 * deshabilita, pero quien arme la peticion a mano tiene que chocar aca.
 */
export function priceRegistration(input: {
  distanceId: DistanceId;
  code: string | null;
  includesShirt?: boolean;
  withoutShirtQrs?: Readonly<Partial<Record<DistanceId, PaymentQr>>>;
  distances: readonly Pick<Distance, 'id' | 'soldOut'>[];
  phases: readonly PresalePhase[];
  codes: readonly DiscountCode[];
  qrsByPhase: Readonly<Record<string, PhaseQrs>>;
  now?: Date;
}): PriceResult {
  const phase = currentPresalePhase(input.phases, input.now);
  if (!phase) return { ok: false, reason: 'registration-closed' };

  const distance = input.distances.find((candidate) => candidate.id === input.distanceId);
  if (distance?.soldOut) return { ok: false, reason: 'sold-out' };

  if (input.includesShirt === false) {
    const qr = input.withoutShirtQrs?.[input.distanceId];
    if (!qr) return { ok: false, reason: 'shirt-option-unavailable' };
    if (input.code !== null) return { ok: false, reason: 'no-shirt-discount' };
    return {
      ok: true,
      price: { phase, basePrice: qr.amount, code: null, total: qr.amount, discount: 0, qr },
    };
  }

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
