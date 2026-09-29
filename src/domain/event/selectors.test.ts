import { describe, expect, it } from 'vitest';

import {
  awardTotals,
  currentPresalePhase,
  findDistance,
  isRegistrationOpen,
  priceFor,
  totalPrizePool,
} from '@/domain/event/selectors';

import type { Award, Distance, PresalePhase } from '@/domain/event/schema';

const award: Award = {
  distanceId: '5k',
  theme: 'purple',
  places: [
    { position: 1, women: 250_000, men: 250_000 },
    { position: 2, women: 100_000, men: 100_000 },
    { position: 3, women: 50_000, men: 50_000 },
  ],
};

const unbalanced: Award = {
  distanceId: '7k',
  theme: 'light',
  places: [{ position: 1, women: 100_000, men: 80_000 }],
};

const phase = (id: string, startsOn: string, endsOn: string): PresalePhase => ({
  id,
  name: id.toUpperCase(),
  tagline: 'fase',
  startsOn,
  endsOn,
  prices: { '5k': 100_000, '7k': 120_000, '10k': 140_000, '3k-infantil': 90_000 },
});

const phases = [
  phase('p1', '2026-08-01', '2026-09-15'),
  phase('p2', '2026-09-16', '2026-10-31'),
  phase('p3', '2026-11-01', '2026-11-21'),
];

/** Mediodia en Colombia del dia pedido. */
const noonInBogota = (isoDate: string) => new Date(`${isoDate}T17:00:00Z`);

describe('awardTotals', () => {
  it('suma la bolsa de cada rama', () => {
    expect(awardTotals(award)).toEqual({ women: 400_000, men: 400_000 });
  });

  it('no asume que las dos ramas reparten lo mismo', () => {
    expect(awardTotals(unbalanced)).toEqual({ women: 100_000, men: 80_000 });
  });
});

describe('totalPrizePool', () => {
  it('suma las dos ramas de todas las distancias', () => {
    expect(totalPrizePool([award, unbalanced])).toBe(980_000);
  });
});

describe('priceFor', () => {
  it('devuelve el precio de la distancia en esa fase', () => {
    expect(priceFor(phases[0], '10k')).toBe(140_000);
  });
});

describe('findDistance', () => {
  const distances: Distance[] = [
    {
      id: '5k',
      label: '5K',
      fullLabel: '5K',
      kilometers: 5,
      startTime: '6:20 am',
      description: '5 kilómetros',
      routeImage: '/rutas/5k.webp',
    },
  ];

  it('encuentra la distancia por id', () => {
    expect(findDistance(distances, '5k').label).toBe('5K');
  });

  it('falla fuerte ante un id que no existe, que seria un error de contenido', () => {
    expect(() => findDistance(distances, '10k')).toThrow(/Distancia desconocida/);
  });
});

describe('currentPresalePhase', () => {
  it('devuelve la fase que contiene el dia', () => {
    expect(currentPresalePhase(phases, noonInBogota('2026-09-21'))?.id).toBe('p2');
  });

  it('toma el primer y el ultimo dia de la ventana como parte de la fase', () => {
    expect(currentPresalePhase(phases, noonInBogota('2026-09-16'))?.id).toBe('p2');
    expect(currentPresalePhase(phases, noonInBogota('2026-10-31'))?.id).toBe('p2');
  });

  it('anuncia la primera fase antes de que abra', () => {
    expect(currentPresalePhase(phases, noonInBogota('2026-07-01'))?.id).toBe('p1');
  });

  it('devuelve null cuando ya paso la ultima', () => {
    expect(currentPresalePhase(phases, noonInBogota('2026-11-22'))).toBeNull();
  });

  it('no asume que las fases vienen ordenadas', () => {
    const shuffled = [phases[2], phases[0], phases[1]];
    expect(currentPresalePhase(shuffled, noonInBogota('2026-07-01'))?.id).toBe('p1');
  });
});

describe('isRegistrationOpen', () => {
  it('sigue abierta durante la ultima fase', () => {
    expect(isRegistrationOpen(phases, noonInBogota('2026-11-21'))).toBe(true);
  });

  it('cierra el dia siguiente al fin de la ultima fase', () => {
    expect(isRegistrationOpen(phases, noonInBogota('2026-11-22'))).toBe(false);
  });
});
