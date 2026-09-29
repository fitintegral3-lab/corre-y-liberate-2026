import { describe, expect, it } from 'vitest';

import fs from 'node:fs';
import path from 'node:path';

import {
  awards,
  discountCodes,
  distances,
  paymentQrsByPhase,
  presalePhases,
  sponsors,
} from '@/content';
import { sponsorSchema } from '@/domain/event/schema';
import { priceFor } from '@/domain/event/selectors';

/**
 * Invariantes del contenido.
 *
 * El esquema de zod valida cada pieza por separado —que un precio sea entero,
 * que una fecha exista—. Esto valida lo que solo se ve mirando todo junto: que
 * las piezas encajen entre si. Es lo que atrapa el error tipico de agregar una
 * distancia y olvidar ponerle precio en una de las tres preventas.
 */
describe('distancias', () => {
  it('no repite ids', () => {
    const ids = distances.map((distance) => distance.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('premiacion', () => {
  it('solo premia distancias que existen', () => {
    const ids = new Set(distances.map((distance) => distance.id));
    for (const award of awards) {
      expect(ids.has(award.distanceId)).toBe(true);
    }
  });

  it('no repite distancia entre tarjetas', () => {
    const ids = awards.map((award) => award.distanceId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('paga mas al primer puesto que al ultimo', () => {
    for (const award of awards) {
      const ordered = [...award.places].sort((a, b) => a.position - b.position);
      const amounts = ordered.map((place) => place.women);
      expect(amounts).toEqual([...amounts].sort((a, b) => b - a));
    }
  });
});

describe('preventas', () => {
  it('le pone precio a todas las distancias en todas las fases', () => {
    for (const phase of presalePhases) {
      for (const distance of distances) {
        expect(Number.isFinite(priceFor(phase, distance.id))).toBe(true);
      }
    }
  });

  it('encadena las ventanas sin huecos ni solapamientos', () => {
    const ordered = [...presalePhases].sort((a, b) => a.startsOn.localeCompare(b.startsOn));

    for (let index = 1; index < ordered.length; index += 1) {
      const previousEnd = new Date(`${ordered[index - 1].endsOn}T00:00:00Z`);
      const currentStart = new Date(`${ordered[index].startsOn}T00:00:00Z`);
      const days = (currentStart.getTime() - previousEnd.getTime()) / 86_400_000;

      expect(days).toBe(1);
    }
  });

  it('nunca baja de precio al avanzar la fase', () => {
    const ordered = [...presalePhases].sort((a, b) => a.startsOn.localeCompare(b.startsOn));

    for (const distance of distances) {
      for (let index = 1; index < ordered.length; index += 1) {
        expect(priceFor(ordered[index], distance.id)).toBeGreaterThanOrEqual(
          priceFor(ordered[index - 1], distance.id),
        );
      }
    }
  });
});

describe('patrocinadores', () => {
  it('no repite ids, que es lo que usa React como key', () => {
    const ids = sponsors.map((sponsor) => sponsor.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('el enlace de instagram solo acepta instagram.com, por https', () => {
    const base = { id: 'x', name: 'X', logo: '/sponsors/x.webp', tier: 'oficial' };
    const accepts = (instagram: string) => sponsorSchema.safeParse({ ...base, instagram }).success;

    expect(accepts('https://www.instagram.com/cerealesjj/')).toBe(true);
    expect(accepts('https://instagram.com/cerealesjj/')).toBe(true);
    expect(accepts('https://www.facebook.com/cerealesjj/')).toBe(false);
    expect(accepts('https://instagram.com.evil.co/cerealesjj/')).toBe(false);
    expect(accepts('http://www.instagram.com/cerealesjj/')).toBe(false);
  });
});

describe('pago por QR', () => {
  it('el QR normal cobra exactamente el precio de su preventa', () => {
    for (const [phaseId, byDistance] of Object.entries(paymentQrsByPhase)) {
      const phase = presalePhases.find((candidate) => candidate.id === phaseId);
      expect(phase, `fase ${phaseId}`).toBeDefined();
      for (const [distanceId, qrs] of Object.entries(byDistance)) {
        expect(qrs.normal.amount, `${phaseId} ${distanceId}`).toBe(
          priceFor(phase!, distanceId as never),
        );
        expect(qrs.discount.amount).toBeLessThan(qrs.normal.amount);
      }
    }
  });

  it('cada imagen de QR existe en public/', () => {
    for (const byDistance of Object.values(paymentQrsByPhase)) {
      for (const qrs of Object.values(byDistance)) {
        for (const { image } of [qrs.normal, qrs.discount]) {
          expect(fs.existsSync(path.join(process.cwd(), 'public', image)), image).toBe(true);
        }
      }
    }
  });

  it('no repite codigos de descuento', () => {
    const codes = discountCodes.map((code) => code.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});
