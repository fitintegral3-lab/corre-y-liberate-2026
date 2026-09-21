import { eventSchema } from '@/domain/event/schema';

/**
 * Datos del evento.
 *
 * Esta carpeta es la unica fuente de verdad del contenido: cambiar un precio,
 * una hora de salida o agregar un patrocinador se hace aca y no dentro de un
 * componente. Todo se valida contra `src/domain/event/schema.ts` al importarse,
 * asi que un dato mal formado rompe el build con el campo y el motivo.
 */
export const event = eventSchema.parse({
  name: 'Corre y Libérate',
  edition: 2,
  year: 2026,
  date: '2026-11-22',
  tagline: {
    lead: 'CADA KILÓMETRO',
    highlight: 'PROTEGE, INSPIRA Y TRANSFORMA',
  },
  claim: 'Cada kilómetro protege, inspira y transforma',
  organizer: {
    name: 'Integral Fit',
    logo: '/logos/logo_integral.png',
  },
});

/** `CADA KILÓMETRO PROTEGE, INSPIRA Y TRANSFORMA`. */
export const fullTagline = `${event.tagline.lead} ${event.tagline.highlight}`;

/** `Corre y Libérate 2026`. Es el nombre: va asi en `<title>`, Open Graph y JSON-LD. */
export const eventName = `${event.name} ${event.year}`;

/** `CORRE Y LIBÉRATE 2026`. Solo para donde el diseno grita: hero y OG image. */
export const eventTitle = eventName.toUpperCase();

/** `2ª EDICIÓN`. Se deriva del numero de edicion: nadie lo escribe dos veces. */
export const editionLabel = `${event.edition}ª EDICIÓN`;

/** `2ª Edición`, para prosa donde la version en mayusculas gritaria. */
export const editionName = `${event.edition}ª Edición`;

/**
 * Copia de las dos secciones que hablan del evento en si.
 *
 * El resto de las secciones guarda su copia junto a sus datos (`awards.ts`,
 * `pricing.ts`, ...). Estas dos viven aca porque no tienen datos propios: son
 * el titulo del evento y la promesa de esta edicion.
 */
export const heroSection = {
  titleLines: ['CORRE Y', `LIBÉRATE ${event.year}`],
  ctaLabel: 'CORRE CON NOSOTROS',
} as const;

export const editionSection = {
  promise:
    'Volvemos a la línea de salida con más energía, más propósito y una nueva oportunidad para proteger, inspirar y transformar.',
  ctaLabel: 'CORRE POR TU META. ¡INSCRÍBETE AHORA!',
} as const;
