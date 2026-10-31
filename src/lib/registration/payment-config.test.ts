import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { presalePhases } from '@/content';
import { priceFor } from '@/domain/event/selectors';
import { discountCodes, paymentQrsByPhase } from '@/lib/registration/payment-config';
import { quote } from '@/lib/registration/service';

import type { DistanceId } from '@/domain/event/schema';

describe('pago por QR', () => {
  it('el QR normal cobra exactamente el precio de su preventa', () => {
    for (const [phaseId, byDistance] of Object.entries(paymentQrsByPhase)) {
      const phase = presalePhases.find((candidate) => candidate.id === phaseId);
      expect(phase, `fase ${phaseId}`).toBeDefined();
      for (const [distanceId, qrs] of Object.entries(byDistance)) {
        expect(qrs.normal.amount, `${phaseId} ${distanceId}`).toBe(
          priceFor(phase!, distanceId as DistanceId),
        );
        expect(qrs.discount.amount).toBeLessThan(qrs.normal.amount);
      }
    }
  });

  it('los QR normales existen en public/', () => {
    for (const byDistance of Object.values(paymentQrsByPhase)) {
      for (const qrs of Object.values(byDistance)) {
        expect(
          fs.existsSync(path.join(process.cwd(), 'public', qrs.normal.image)),
          qrs.normal.image,
        ).toBe(true);
      }
    }
  });

  it('ningun QR con descuento queda en public/, donde su direccion se adivina', () => {
    const published = fs.readdirSync(path.join(process.cwd(), 'public', 'qr'));
    expect(published.filter((file) => /descuento/i.test(file))).toEqual([]);
    for (const byDistance of Object.values(paymentQrsByPhase)) {
      for (const qrs of Object.values(byDistance)) {
        expect(qrs.discount.image.startsWith('/qr/')).toBe(false);
      }
    }
  });

  it('los codigos que se reparten cobran el QR con descuento', () => {
    const duringPresale2 = new Date('2026-10-15T15:00:00Z');
    for (const code of [
      'SAMIRZABALETA',
      'VALECORRE',
      'STMARMOLEJO',
      'PABLOBOTINA',
      'JDMORALES',
      'COLCRECER',
      'INTEGRALFIT',
      'ROBINSONMARTINEZ',
      'AREPAROJA',
    ])
      expect(quote('5k', code.toLowerCase(), duringPresale2), code).toMatchObject({
        ok: true,
        price: { code, total: 108_000 },
      });
  });

  it.each([
    ['5k', 100_000],
    ['10k', 130_000],
  ] as const)('sin camiseta %s cobra su QR original', (distance, amount) => {
    const result = quote(distance, null, new Date('2026-10-28T15:00:00Z'), false);
    expect(result).toMatchObject({
      ok: true,
      price: {
        basePrice: amount,
        total: amount,
        discount: 0,
        code: null,
        qr: { image: `/qr/${distance}-sin-camiseta.png`, amount },
      },
    });
    if (result.ok)
      expect(fs.existsSync(path.join(process.cwd(), 'public', result.price.qr.image))).toBe(true);
  });

  it('no acumula descuentos sobre los precios sin camiseta', () => {
    expect(quote('5k', 'VALECORRE', new Date('2026-10-28T15:00:00Z'), false)).toEqual({
      ok: false,
      reason: 'no-shirt-discount',
    });
  });

  it('no vende 3K sin camiseta ni reabre una distancia agotada', () => {
    const now = new Date('2026-10-28T15:00:00Z');
    expect(quote('3k-infantil', null, now, false)).toEqual({
      ok: false,
      reason: 'shirt-option-unavailable',
    });
    expect(quote('7k', null, now, false)).toEqual({ ok: false, reason: 'sold-out' });
  });

  it('mantiene los precios sin camiseta durante la inscripción y cierra al finalizar', () => {
    expect(quote('10k', null, new Date('2026-11-05T15:00:00Z'), false)).toMatchObject({
      ok: true,
      price: { total: 130_000 },
    });
    expect(quote('10k', null, new Date('2026-12-01T15:00:00Z'), false)).toEqual({
      ok: false,
      reason: 'registration-closed',
    });
  });

  it('no repite codigos de descuento', () => {
    const codes = discountCodes.map((code) => code.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});
