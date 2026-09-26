import { z } from 'zod';

import { distanceSchema } from '@/domain/event/schema';

/**
 * Distancias de la carrera, en el orden en que se muestran.
 *
 * El orden del arreglo es el del diseno (5K, 7K, 10K, 3K) y no el cronologico
 * ni el de kilometraje: es una decision editorial, asi que se respeta tal cual
 * en vez de reordenarla en cada seccion.
 */
export const distances = z
  .array(distanceSchema)
  .nonempty()
  .parse([
    {
      id: '5k',
      label: '5K',
      fullLabel: '5K',
      kilometers: 5,
      startTime: '6:20 am',
      description: '5 kilómetros',
    },
    {
      id: '7k',
      label: '7K',
      fullLabel: '7K',
      kilometers: 7,
      startTime: '6:10 am',
      description: '7 kilómetros',
    },
    {
      id: '10k',
      label: '10K',
      fullLabel: '10K',
      kilometers: 10,
      startTime: '6:00 am',
      description: '10 kilómetros',
    },
    {
      id: '3k-infantil',
      label: '3K',
      fullLabel: '3K INFANTIL',
      kilometers: 3,
      startTime: '6:30 am',
      description: '3 kilómetros · (7 a 12 años)',
    },
  ]);
