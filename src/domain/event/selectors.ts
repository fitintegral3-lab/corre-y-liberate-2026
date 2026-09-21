import { toEventIsoDate } from '@/lib/format/date';

import type { Award, Distance, DistanceId, PresalePhase } from '@/domain/event/schema';

/**
 * Derivaciones del dominio: funciones puras sobre el contenido ya validado.
 *
 * Viven separadas de los componentes a proposito. «Cual preventa esta vigente»
 * es una regla del evento, no una decision de maquetado: aca se prueba con
 * `vitest` sin montar React, y la seccion solo la consume.
 */

export interface AwardTotals {
  women: number;
  men: number;
  /** `true` cuando ambas ramas reparten lo mismo, que es el caso del diseno. */
  isBalanced: boolean;
}

/** Suma la bolsa de premios de una distancia, rama por rama. */
export function awardTotals(award: Award): AwardTotals {
  const women = award.places.reduce((total, place) => total + place.women, 0);
  const men = award.places.reduce((total, place) => total + place.men, 0);

  return { women, men, isBalanced: women === men };
}

/** Bolsa total del evento, sumando las dos ramas de todas las distancias. */
export function totalPrizePool(awards: readonly Award[]): number {
  return awards.reduce((total, award) => {
    const { women, men } = awardTotals(award);
    return total + women + men;
  }, 0);
}

/**
 * Precio de una distancia en una fase.
 *
 * `prices` es un registro cerrado sobre `DistanceId`, asi que este acceso no
 * puede fallar en tiempo de ejecucion: si faltara una distancia, el contenido
 * no habria pasado la validacion.
 */
export function priceFor(phase: PresalePhase, distanceId: DistanceId): number {
  return phase.prices[distanceId];
}

/** Busca una distancia por id. Lanza si no existe: seria un error de contenido. */
export function findDistance(distances: readonly Distance[], id: DistanceId): Distance {
  const distance = distances.find((candidate) => candidate.id === id);

  if (!distance) {
    throw new Error(`Distancia desconocida: "${id}". Revisa src/content/distances.ts.`);
  }

  return distance;
}

/**
 * Fase de preventa vigente en una fecha dada.
 *
 * Devuelve `null` cuando ya paso la ultima: es la senial de que las
 * inscripciones se cerraron, y quien lo consuma decide que mostrar. Antes de la
 * primera fase devuelve la primera, para que el sitio publicado con
 * anticipacion anuncie el precio de lanzamiento.
 */
export function currentPresalePhase(
  phases: readonly PresalePhase[],
  now: Date = new Date(),
): PresalePhase | null {
  if (phases.length === 0) return null;

  const today = toEventIsoDate(now);
  const ordered = [...phases].sort((a, b) => a.startsOn.localeCompare(b.startsOn));

  const active = ordered.find((phase) => today >= phase.startsOn && today <= phase.endsOn);
  if (active) return active;

  const upcoming = ordered.find((phase) => today < phase.startsOn);
  return upcoming ?? null;
}

/** Hay alguna fase de preventa abierta o por abrir en esta fecha. */
export function isRegistrationOpen(
  phases: readonly PresalePhase[],
  now: Date = new Date(),
): boolean {
  return currentPresalePhase(phases, now) !== null;
}
