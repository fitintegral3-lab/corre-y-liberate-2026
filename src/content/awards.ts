import { z } from 'zod';

import { awardSchema } from '@/domain/event/schema';

/**
 * Premiacion economica, por distancia y por rama.
 *
 * Los montos son enteros en pesos: el total de cada tarjeta y la bolsa del
 * evento se calculan en `domain/event/selectors.ts`, no se escriben a mano.
 * Asi no puede pasar que se corrija un premio y el total siga diciendo lo de
 * antes.
 */
export const awards = z
  .array(awardSchema)
  .nonempty()
  .parse([
    {
      distanceId: '5k',
      theme: 'purple',
      places: [
        { position: 1, women: 250_000, men: 250_000 },
        { position: 2, women: 100_000, men: 100_000 },
        { position: 3, women: 50_000, men: 50_000 },
      ],
    },
    {
      distanceId: '7k',
      theme: 'light',
      places: [
        { position: 1, women: 350_000, men: 350_000 },
        { position: 2, women: 150_000, men: 150_000 },
        { position: 3, women: 100_000, men: 100_000 },
      ],
    },
    {
      distanceId: '10k',
      theme: 'dark',
      places: [
        { position: 1, women: 800_000, men: 800_000 },
        { position: 2, women: 450_000, men: 450_000 },
        { position: 3, women: 250_000, men: 250_000 },
      ],
    },
  ]);

export const awardsSection = {
  title: 'PREMIACIÓN ECONÓMICA',
  subtitle: 'POR DISTANCIA Y POR RAMA',
  ctaLabel: 'CORRE POR TU META. ¡INSCRÍBETE AHORA!',
} as const;
