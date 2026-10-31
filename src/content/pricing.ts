import { z } from 'zod';

import { presalePhaseSchema } from '@/domain/event/schema';

/**
 * Venta a precio fijo hasta el 20 de noviembre inclusive, en hora de Colombia.
 * Conservamos el id de la fase para los QR y las inscripciones ya guardadas.
 */
export const presalePhases = z
  .array(presalePhaseSchema)
  .nonempty()
  .parse([
    {
      id: 'preventa-2',
      name: 'INSCRIPCIONES',
      tagline: 'Precios vigentes hasta el cierre',
      startsOn: '2026-08-01',
      endsOn: '2026-11-20',
      prices: { '5k': 120_000, '7k': 140_000, '10k': 160_000, '3k-infantil': 90_000 },
    },
  ]);

export const pricingSection = {
  eyebrow: 'INSCRIPCIONES',
  title: '¡ASEGURA TU CUPO!',
  categoriesTitle: 'CATEGORÍAS',
  categoriesHint: 'Con camiseta · Precio por persona, en pesos colombianos',
  ctaLabel: 'ASEGURA TU CUPO AHORA',
  soldOutLabel: 'AGOTADO',
} as const;
