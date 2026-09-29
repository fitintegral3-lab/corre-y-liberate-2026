import { describe, expect, it } from 'vitest';

import { priceRegistration } from '@/domain/registration/pricing';

import type { PresalePhase } from '@/domain/event/schema';
import type { DiscountCode, PhaseQrs } from '@/domain/registration/payment';

const phases: PresalePhase[] = [
  {
    id: 'preventa-2',
    name: 'PREVENTAS 2',
    tagline: 'x',
    startsOn: '2026-09-16',
    endsOn: '2026-10-31',
    prices: { '5k': 120_000, '7k': 140_000, '10k': 160_000, '3k-infantil': 90_000 },
  },
  {
    id: 'preventa-3',
    name: 'PREVENTAS 3',
    tagline: 'x',
    startsOn: '2026-11-01',
    endsOn: '2026-11-21',
    prices: { '5k': 140_000, '7k': 160_000, '10k': 180_000, '3k-infantil': 90_000 },
  },
];

const qr = (image: string, amount: number) => ({ image, amount });
const qrsByPhase: Record<string, PhaseQrs> = {
  'preventa-2': {
    '3k-infantil': { normal: qr('/qr/3k-n.jpeg', 90_000), discount: qr('/qr/3k-d.jpeg', 80_000) },
    '5k': { normal: qr('/qr/5k-n.jpeg', 120_000), discount: qr('/qr/5k-d.jpeg', 108_000) },
    '7k': { normal: qr('/qr/7k-n.jpeg', 140_000), discount: qr('/qr/7k-d.jpeg', 126_000) },
    '10k': { normal: qr('/qr/10k-n.jpeg', 160_000), discount: qr('/qr/10k-d.jpeg', 144_000) },
  },
};
const codes: DiscountCode[] = [{ code: 'VALECORRE', owner: 'Vale' }];

const inPhase2 = new Date('2026-10-15T15:00:00Z');
const price = (distanceId: '3k-infantil' | '5k' | '10k', code: string | null, now = inPhase2) =>
  priceRegistration({ distanceId, code, phases, codes, qrsByPhase, now });

describe('priceRegistration', () => {
  it('sin codigo cobra el QR normal de la preventa vigente', () => {
    expect(price('10k', null)).toMatchObject({
      ok: true,
      price: { total: 160_000, discount: 0, qr: { image: '/qr/10k-n.jpeg' } },
    });
  });

  it('con codigo cobra el QR de descuento y dice cuanto descuenta', () => {
    expect(price('5k', 'VALECORRE')).toMatchObject({
      ok: true,
      price: {
        code: 'VALECORRE',
        basePrice: 120_000,
        discount: 12_000,
        total: 108_000,
        qr: { image: '/qr/5k-d.jpeg' },
      },
    });
  });

  it('en 3K el descuento es el del QR, no un porcentaje', () => {
    expect(price('3k-infantil', 'VALECORRE')).toMatchObject({
      ok: true,
      price: { discount: 10_000, total: 80_000 },
    });
  });

  it('avisa un codigo que no existe en vez de cobrar el precio lleno', () => {
    expect(price('5k', 'NOEXISTE')).toEqual({ ok: false, reason: 'unknown-code' });
  });

  it('sin QR para la preventa vigente no cobra, para no mostrar el monto de otra fase', () => {
    expect(price('5k', null, new Date('2026-11-05T15:00:00Z'))).toEqual({
      ok: false,
      reason: 'no-payment-qr',
    });
  });

  it('con las inscripciones cerradas no cobra', () => {
    expect(price('5k', null, new Date('2026-12-01T15:00:00Z'))).toEqual({
      ok: false,
      reason: 'registration-closed',
    });
  });
});
