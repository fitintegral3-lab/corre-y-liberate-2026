import { z } from 'zod';

import { sponsorSchema } from '@/domain/event/schema';

/**
 * Patrocinadores y apoyos.
 *
 * `tier` distingue el apoyo institucional (alcaldia, instituto de deporte) del
 * comercial. Hoy el diseno los muestra en la misma grilla; cuando haya que
 * separarlos, el dato ya esta y no hay que volver a preguntar quien es quien.
 *
 * Un patrocinador sin `website` ni `instagram` se muestra sin clic. Alma y la
 * Casa de la Mujer quedan asi a proposito: no se encontro una cuenta propia
 * (la Casa de la Mujer publica desde la de la Alcaldia) y enlazar una parecida
 * mandaria a la gente a la marca equivocada.
 */
export const sponsors = z
  .array(sponsorSchema)
  .nonempty()
  .parse([
    {
      id: 'alcaldia-jamundi',
      name: 'Alcaldía de Jamundí',
      logo: '/sponsors/alcaldia_jamundi.webp',
      tier: 'institucional',
      website: 'https://www.jamundi.gov.co/',
      instagram: 'https://www.instagram.com/ajamundivalle/',
    },
    {
      id: 'imdere',
      name: 'IMDERE Jamundí',
      logo: '/sponsors/imdere.webp',
      tier: 'institucional',
      website: 'https://www.imderejamundi.gov.co/',
      instagram: 'https://www.instagram.com/imdere.jamundi/',
    },
    {
      id: 'alma',
      name: 'Alma Casa de Encuentros',
      logo: '/sponsors/alma.webp',
      tier: 'oficial',
    },
    {
      id: 'electrolife',
      name: 'Electrolife',
      logo: '/sponsors/electrolife.webp',
      tier: 'oficial',
      instagram: 'https://www.instagram.com/electrolife.colombia/',
    },
    {
      id: 'ces',
      name: 'CES Fundación Educativa',
      logo: '/sponsors/ces.webp',
      tier: 'oficial',
      instagram: 'https://www.instagram.com/educacionces/',
    },
    {
      id: 'cereales-jj',
      name: 'Cereales JJ',
      logo: '/sponsors/cereales_jj.webp',
      tier: 'oficial',
      instagram: 'https://www.instagram.com/cerealesjj/',
    },
    {
      id: 'casa-de-la-mujer',
      name: 'Casa de la Mujer Jamundí',
      logo: '/sponsors/casa_de_la_mujer.webp',
      tier: 'oficial',
    },
    {
      id: 'cartel-running-club',
      name: 'El Cartel Running Club',
      logo: '/sponsors/cartel_running_club.webp',
      tier: 'oficial',
      website: 'https://cartel-running-club.vercel.app/',
      instagram: 'https://www.instagram.com/elcartelrunningclub/',
    },
  ]);

export const sponsorsSection = {
  eyebrow: 'ALIADOS Y APOYOS OFICIALES',
  title: 'PATROCINADORES',
} as const;
