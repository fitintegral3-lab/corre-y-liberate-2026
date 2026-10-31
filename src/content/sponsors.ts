import { z } from 'zod';

import { sponsorSchema } from '@/domain/event/schema';

/** Quitar un ID de esta lista vuelve a mostrar el patrocinador. */
const hiddenSponsorIds = new Set(['electrolife']);

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
      id: 'czar',
      name: 'CZAR',
      logo: '/sponsors/czar.webp',
      tier: 'oficial',
      instagram: 'https://www.instagram.com/czarsport/',
    },
    {
      id: 'fundacion-grupo-corazones-amigos',
      name: 'Fundación Grupo Corazones Amigos',
      logo: '/sponsors/fundacion_grupo_corazones_amigos.webp',
      tier: 'oficial',
    },
    {
      id: 'servimed-san-antonio',
      name: 'Servimed San Antonio S.A.S.',
      logo: '/sponsors/servimed_san_antonio.webp',
      tier: 'oficial',
    },
    {
      id: 'constructora-solanillas',
      name: 'Constructora Solanillas',
      logo: '/sponsors/constructora_solanillas.webp',
      tier: 'oficial',
      instagram: 'https://www.instagram.com/constructora_solanillas/',
    },
    {
      id: 'banco-w',
      name: 'Banco W',
      logo: '/sponsors/banco_w.webp',
      tier: 'oficial',
      instagram: 'https://www.instagram.com/bancow.com.co/',
    },
    {
      id: 'royal-enfield-panamericana',
      name: 'Royal Enfield Panamericana',
      logo: '/sponsors/royal_enfield_panamericana.webp',
      tier: 'oficial',
      instagram: 'https://www.instagram.com/panamericanamotors/',
    },
    {
      id: 'panamericana-motors',
      name: 'Panamericana Motors',
      logo: '/sponsors/panamericana_motors.webp',
      tier: 'oficial',
      instagram: 'https://www.instagram.com/panamericanamotors/',
    },
    {
      id: 'hero-panamericana',
      name: 'Hero Panamericana',
      logo: '/sponsors/hero_panamericana.webp',
      tier: 'oficial',
      instagram: 'https://www.instagram.com/panamericanamotors/',
    },
    {
      id: 'arepa-roja',
      name: 'Arepa Roja',
      logo: '/sponsors/arepa_roja.png',
      tier: 'oficial',
      website: 'https://queresto.com/ArepaRojaJamundi',
      instagram: 'https://www.instagram.com/areparoja/',
    },
    {
      id: 'sucol',
      name: 'SUCOL Soluciones Urbanísticas',
      logo: '/sponsors/sucol.png',
      tier: 'oficial',
      website: 'https://sucol.co/',
      instagram: 'https://www.instagram.com/constructorasucol/',
    },
    {
      id: 'cartel-running-club',
      name: 'El Cartel Running Club',
      logo: '/sponsors/cartel_running_club.webp',
      tier: 'oficial',
      website: 'https://cartel-running-club.vercel.app/',
      instagram: 'https://www.instagram.com/elcartelrunningclub/',
    },
  ])
  .filter((sponsor) => !hiddenSponsorIds.has(sponsor.id));

export const sponsorsSection = {
  eyebrow: 'ALIADOS Y APOYOS OFICIALES',
  title: 'PATROCINADORES',
} as const;
