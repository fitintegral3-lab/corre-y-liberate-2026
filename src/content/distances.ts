import { z } from 'zod';

import { distanceSchema } from '@/domain/event/schema';

/**
 * Distancias de la carrera, en el orden en que se muestran.
 *
 * El orden del arreglo (3K, 5K, 7K, 10K) es el que se muestra en todo el sitio:
 * se decide aca una vez en vez de reordenar en cada seccion.
 */
export const distances = z
  .array(distanceSchema)
  .nonempty()
  .parse([
    {
      id: '3k-infantil',
      label: '3K',
      fullLabel: '3K',
      kilometers: 3,
      startTime: '6:30 am',
      description: '3 kilómetros · Para todo público',
      routeImage: '/rutas/3k.webp',
    },
    {
      id: '5k',
      label: '5K',
      fullLabel: '5K',
      kilometers: 5,
      startTime: '6:20 am',
      description: '5 kilómetros',
      routeImage: '/rutas/5k.webp',
    },
    {
      id: '7k',
      label: '7K',
      fullLabel: '7K',
      kilometers: 7,
      startTime: '6:10 am',
      description: '7 kilómetros',
      routeImage: '/rutas/7k.webp',
    },
    {
      id: '10k',
      label: '10K',
      fullLabel: '10K',
      kilometers: 10,
      startTime: '6:00 am',
      description: '10 kilómetros',
      routeImage: '/rutas/10k.webp',
    },
  ]);
