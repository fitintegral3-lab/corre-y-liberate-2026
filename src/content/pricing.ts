import { z } from 'zod';

import { presalePhaseSchema } from '@/domain/event/schema';

/**
 * Fases de preventa.
 *
 * Cada fase declara su ventana de fechas y el precio de cada distancia. El
 * texto «1 de agosto al 15 de septiembre de 2026» y cual fase esta vigente se
 * derivan de aca: las fechas viven una sola vez y se formatean al renderizar.
 */
export const presalePhases = z
  .array(presalePhaseSchema)
  .nonempty()
  .parse([
    {
      id: 'preventa-1',
      name: 'PREVENTAS 1',
      tagline: '¡Aprovecha el mejor precio!',
      startsOn: '2026-08-01',
      endsOn: '2026-09-15',
      prices: { '5k': 100_000, '7k': 120_000, '10k': 140_000, '3k-infantil': 90_000 },
    },
    {
      id: 'preventa-2',
      name: 'PREVENTAS 2',
      tagline: 'Precio intermedio',
      startsOn: '2026-09-16',
      endsOn: '2026-10-31',
      prices: { '5k': 120_000, '7k': 140_000, '10k': 160_000, '3k-infantil': 90_000 },
    },
    {
      id: 'preventa-3',
      name: 'PREVENTAS 3',
      tagline: 'Última oportunidad',
      startsOn: '2026-11-01',
      endsOn: '2026-11-21',
      prices: { '5k': 140_000, '7k': 160_000, '10k': 180_000, '3k-infantil': 90_000 },
    },
  ]);

export const pricingSection = {
  eyebrow: 'PREVENTAS',
  title: '¡ASEGURA TU CUPO AL MEJOR PRECIO!',
  categoriesTitle: 'CATEGORÍAS',
  categoriesHint: 'Precio por persona, en pesos colombianos',
  ctaLabel: 'ASEGURA TU CUPO AHORA',
} as const;

export const registrationBanner = {
  title: '¡LAS INSCRIPCIONES YA ESTÁN ABIERTAS!',
  ctaLabel: 'INSCRÍBETE AHORA',
} as const;
