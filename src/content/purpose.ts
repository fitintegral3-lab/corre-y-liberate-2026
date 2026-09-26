import { z } from 'zod';

import { purposePillarSchema } from '@/domain/event/schema';

/** Los tres pilares del proposito social de la carrera. */
export const purposePillars = z
  .array(purposePillarSchema)
  .nonempty()
  .parse([
    { order: 1, title: 'PROTEGE', description: 'Cuida tu cuerpo, tu mente y tu bienestar.' },
    {
      order: 2,
      title: 'INSPIRA',
      description: 'Tu decisión de empezar puede motivar a alguien más.',
    },
    {
      order: 3,
      title: 'TRANSFORMA',
      description: 'Haz que cada paso genere algo positivo más allá de ti.',
    },
  ]);

export const purposeSection = {
  titleLines: ['CORREMOS POR ALGO', 'QUE VA MÁS ALLÁ', 'DE LA META.'],
  intro:
    'Corre y Libérate conecta deporte, bienestar y propósito en una experiencia para moverte, superarte y generar un impacto positivo.',
} as const;
