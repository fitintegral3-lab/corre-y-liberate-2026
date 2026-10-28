import { awards } from '@/content/awards';
import { distances } from '@/content/distances';

/** Ocultar temporalmente la 7K en la landing, conservando su configuración. */
export const landingDistances = distances.filter((distance) => distance.id !== '7k');

export const landingAwards = awards.filter((award) =>
  landingDistances.some((distance) => distance.id === award.distanceId),
);
