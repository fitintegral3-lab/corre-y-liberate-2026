import { z } from 'zod';

import { runnerKitItemSchema } from '@/domain/event/schema';

/** Lo que recibe cada corredor al inscribirse. */
export const runnerKitItems = z
  .array(runnerKitItemSchema)
  .nonempty()
  .parse([
    { id: 'camiseta', label: 'Camiseta', icon: '/icons/icon_camiseta.png' },
    { id: 'medalla', label: 'Medalla', icon: '/icons/icon_medalla.png' },
    { id: 'dorsal', label: 'Dorsal', icon: '/icons/icon_dorsal.png' },
    { id: 'chip', label: 'Chip', icon: '/icons/icon_chip.png' },
    { id: 'tula', label: 'Tula', icon: '/icons/icon_tula.png' },
    { id: 'hidratacion', label: 'Hidratación', icon: '/icons/icon_hidratacion.png' },
  ]);

export const runnerKitSection = {
  eyebrow: 'TODO LISTO PARA TU CARRERA',
  titleLines: ['CORRE Y LIBÉRATE INCLUYE', 'MUCHO MÁS QUE KILÓMETROS.'],
  note: 'Y experiencias adicionales de nuestros aliados durante el evento.',
  ctaLabel: 'INSCRÍBETE Y VIVE LA EXPERIENCIA',
} as const;
