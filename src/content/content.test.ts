import { describe, expect, it } from 'vitest';

import { awards, distances, presalePhases, sponsors } from '@/content';
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
});
