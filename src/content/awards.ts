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

/**
 * La 3K no reparte premios: es un recorrido no competitivo, asi que en la
 * seccion de premiacion va una tarjeta que lo explica en vez de una tabla.
 */
export const familyRunCard = {
  distanceId: '3k-infantil',
  theme: 'dark',
  title: 'FAMILIAR E INFANTIL',
  description:
    'Una experiencia diseñada para familias, corredores iniciales y niños, con una perspectiva pedagógica, participativa y no competitiva. Un espacio para disfrutar el movimiento, fortalecer los vínculos y descubrir que correr también es una forma de aprender, compartir y transformar.',
  footer: 'RECORRIDO NO COMPETITIVO',
} as const;

export const awardsSection = {
  title: 'PREMIACIÓN ECONÓMICA',
  subtitle: 'PARA MUJERES Y HOMBRES EN CADA DISTANCIA',
  ctaLabel: 'CORRE POR TU META. ¡INSCRÍBETE AHORA!',
} as const;
