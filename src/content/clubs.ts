import { z } from 'zod';

import { runningClubSchema } from '@/domain/event/schema';

/**
 * Clubes de running que acompanan la carrera.
 *
 * El Cartel tambien figura como patrocinador: aparece en las dos tiras porque
 * cumple los dos papeles, y reusa el mismo logo.
 */
export const runningClubs = z
  .array(runningClubSchema)
  .nonempty()
  .parse([
    {
      id: '7am-running-club',
      name: '7AM Running Club',
      logo: '/clubs/7am_running_club.webp',
      instagram: 'https://www.instagram.com/7amrun_/',
    },
    {
      id: 'pacif1k',
      name: 'Pacif1k',
      logo: '/clubs/pacif1k.webp',
      instagram: 'https://www.instagram.com/pacifikrunnerscali/',
    },
    {
      id: 'byrunners',
      name: 'ByRunners Club',
      logo: '/clubs/byrunners.webp',
      instagram: 'https://www.instagram.com/byrunners3/',
    },
    {
      id: 'neo-team-running',
      name: 'Neo Team Running',
      logo: '/clubs/neo_team_running.webp',
      instagram: 'https://www.instagram.com/neoteam_cali/?hl=es-la',
    },
    {
      id: 'cartel-running-club',
      name: 'El Cartel Running Club',
      logo: '/sponsors/cartel_running_club.webp',
      website: 'https://cartel-running-club.vercel.app/',
      instagram: 'https://www.instagram.com/elcartelrunningclub/',
    },
  ]);

export const runningClubsSection = {
  eyebrow: 'NO CORRES SOLO',
  title: 'CLUBES QUE NOS ACOMPAÑAN',
} as const;
