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
    ])
      expect(quote('5k', code.toLowerCase(), duringPresale2), code).toMatchObject({
        ok: true,
        price: { code, total: 108_000 },
      });
  });

  it('no repite codigos de descuento', () => {
    const codes = discountCodes.map((code) => code.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});
