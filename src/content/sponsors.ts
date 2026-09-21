import { z } from 'zod';

import { sponsorSchema } from '@/domain/event/schema';

/**
 * Patrocinadores y apoyos.
 *
 * `tier` distingue el apoyo institucional (alcaldia, instituto de deporte) del
 * comercial. Hoy el diseno los muestra en la misma grilla; cuando haya que
 * separarlos, el dato ya esta y no hay que volver a preguntar quien es quien.
 */
export const sponsors = z
  .array(sponsorSchema)
  .nonempty()
  .parse([
    {
      id: 'alcaldia-jamundi',
      name: 'Alcaldía de Jamundí',
      logo: '/sponsors/alcaldia_jamundi.png',
      tier: 'institucional',
    },
    {
      id: 'imdere',
      name: 'IMDERE Jamundí',
      logo: '/sponsors/imdere.png',
      tier: 'institucional',
    },
    {
      id: 'alma',
      name: 'Alma Casa de Encuentros',
      logo: '/sponsors/alma.png',
      tier: 'oficial',
    },
    {
      id: 'electrolife',
      name: 'Electrolife',
      logo: '/sponsors/electrolife.png',
      tier: 'oficial',
    },
    {
      id: 'patrocinador-5',
      name: 'Patrocinador Oficial',
      logo: '/sponsors/patrocinador_5.png',
      tier: 'oficial',
    },
    {
      id: 'patrocinador-6',
      name: 'Patrocinador Oficial',
      logo: '/sponsors/patrocinador_6.png',
      tier: 'oficial',
    },
    {
      id: 'patrocinador-7',
      name: 'Patrocinador Oficial',
      logo: '/sponsors/patrocinador_7.png',
      tier: 'oficial',
    },
    {
      id: 'patrocinador-8',
      name: 'Patrocinador Oficial',
      logo: '/sponsors/patrocinador_8.png',
      tier: 'oficial',
    },
  ]);

export const sponsorsSection = {
  eyebrow: 'ALIADOS Y APOYOS OFICIALES',
  title: 'PATROCINADORES',
} as const;
