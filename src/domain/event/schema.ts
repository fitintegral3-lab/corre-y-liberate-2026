import { z } from 'zod';

/**
 * Esquemas del dominio del evento.
 *
 * Son el contrato de `src/content/`: describen que significa cada dato y en que
 * rango es valido. El contenido se valida al importarse, asi que un precio en
 * negativo, un `2026-13-45` o una ruta de logo mal escrita rompen el build
 * —con el campo y el motivo— en vez de llegar a produccion como un `NaN` o una
 * imagen rota.
 */

/** `YYYY-MM-DD`. Una carrera ocurre en un dia, no en un instante UTC. */
export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'la fecha debe ser ISO `YYYY-MM-DD`')
  .refine(
    (value) => !Number.isNaN(new Date(value).getTime()),
    'la fecha no existe en el calendario',
  );

/** Ruta a un archivo servido desde `public/`. */
export const assetPathSchema = z
  .string()
  .regex(/^\/[\w\-./% ]+\.(png|jpe?g|svg|webp|avif)$/i, 'debe ser una ruta dentro de public/');

/** Ancla interna de navegacion (`#precios`). */
export const anchorSchema = z.string().regex(/^#[a-z0-9-]+$/, 'debe ser un ancla en kebab-case');

/** Monto en pesos colombianos. Entero: en COP nadie cobra centavos. */
export const copAmountSchema = z
  .number()
  .int('los montos en COP se expresan en pesos enteros')
  .nonnegative();

/** Hora de salida tal como se anuncia («6:20 am»). */
export const startTimeSchema = z
  .string()
  .regex(/^([1-9]|1[0-2]):[0-5]\d ?(a\.?m\.?|p\.?m\.?)$/i, 'formato esperado: `6:20 am`');

// ---------------------------------------------------------------------------
// Distancias
// ---------------------------------------------------------------------------

/**
 * Identificador estable de cada distancia. Es la llave que une horarios,
 * premios y precios: si manana entra una 15K, se agrega aca y TypeScript marca
 * cada tabla a la que le falta.
 */
export const distanceIdSchema = z.enum(['5k', '7k', '10k', '3k-infantil']);

export const distanceSchema = z.object({
  id: distanceIdSchema,
  /** Etiqueta corta para el hero y la grilla de horarios: `5K`. */
  label: z.string().min(1),
  /** Etiqueta completa para la tabla de categorias: `3K`. */
  fullLabel: z.string().min(1),
  kilometers: z.number().positive(),
  startTime: startTimeSchema,
  /** Aclaracion bajo la categoria: `3 kilometros · Para todo publico`. */
  description: z.string().min(1),
  /** Afiche con el mapa del recorrido, que se abre desde los horarios de salida. */
  routeImage: assetPathSchema,
});

// ---------------------------------------------------------------------------
// Premiacion
// ---------------------------------------------------------------------------

export const awardPlaceSchema = z.object({
  position: z.number().int().min(1),
  women: copAmountSchema,
  men: copAmountSchema,
});

/**
 * Premiacion de una distancia. `theme` es la unica concesion a la presentacion:
 * nombra cual de las tres tarjetas del diseno le toca, sin que el contenido
 * conozca colores ni clases de CSS (eso vive en `features/awards/theme.ts`).
 */
export const awardSchema = z.object({
  distanceId: distanceIdSchema,
  theme: z.enum(['purple', 'light', 'dark']),
  places: z
    .array(awardPlaceSchema)
    .min(1)
    .refine(
      (places) => new Set(places.map((place) => place.position)).size === places.length,
      'no puede haber dos premios para el mismo puesto',
    ),
});

// ---------------------------------------------------------------------------
// Preventas
// ---------------------------------------------------------------------------

/**
 * Fase de preventa. `prices` es un registro cerrado sobre `distanceIdSchema`:
 * agregar una distancia sin ponerle precio en cada fase no compila.
 */
export const presalePhaseSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    tagline: z.string().min(1),
    startsOn: isoDateSchema,
    endsOn: isoDateSchema,
    prices: z.record(distanceIdSchema, copAmountSchema),
  })
  .refine((phase) => phase.startsOn <= phase.endsOn, {
    message: 'la fase no puede terminar antes de empezar',
    path: ['endsOn'],
  });

// ---------------------------------------------------------------------------
// Kit, sede, patrocinadores y proposito
// ---------------------------------------------------------------------------

export const runnerKitItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  icon: assetPathSchema,
});

export const venueSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  region: z.string().min(1),
  country: z.string().min(1),
  mapsUrl: z.url(),
  mapImage: assetPathSchema,
  doorsOpenAt: z.string().min(1),
  doorsOpenNote: z.string().min(1),
});

/** Logo de la tira de patrocinadores o de clubes, con los enlaces que abre su modal. */
export const linkedLogoSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  logo: assetPathSchema,
  website: z.url({ protocol: /^https$/ }).optional(),
  /** Solo `instagram.com`: el boton del modal dice "Instagram" y no puede llevar a otra parte. */
  instagram: z.url({ protocol: /^https$/, hostname: /^(www\.)?instagram\.com$/ }).optional(),
});

export const sponsorSchema = linkedLogoSchema.extend({
  tier: z.enum(['institucional', 'oficial']),
});

export const runningClubSchema = linkedLogoSchema;

export const purposePillarSchema = z.object({
  order: z.number().int().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

export const registrationStepSchema = z.object({
  order: z.number().int().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

export const navLinkSchema = z.object({
  href: anchorSchema,
  label: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Evento
// ---------------------------------------------------------------------------

export const eventSchema = z.object({
  name: z.string().min(1),
  /** Numero de edicion. `2` rinde «2ª EDICION» sin que nadie lo escriba a mano. */
  edition: z.number().int().min(1),
  year: z.number().int().min(2024),
  date: isoDateSchema,
  /**
   * Lema, partido donde el diseno lo subraya. Se guarda en dos piezas y no
   * como una cadena con markup adentro: el contenido no deberia saber HTML, y
   * partir el texto en el componente con un `split()` se rompe el dia que
   * alguien cambie una coma.
   */
  tagline: z.object({
    lead: z.string().min(1),
    highlight: z.string().min(1),
  }),
  /** El mismo lema en prosa, para `<meta>`, Open Graph y datos estructurados. */
  claim: z.string().min(1),
  organizer: z.object({
    name: z.string().min(1),
    logo: assetPathSchema,
  }),
});

// ---------------------------------------------------------------------------
// Tipos inferidos: el esquema es la fuente, el tipo se deriva de el.
// ---------------------------------------------------------------------------

export type DistanceId = z.infer<typeof distanceIdSchema>;
export type Distance = z.infer<typeof distanceSchema>;
export type AwardPlace = z.infer<typeof awardPlaceSchema>;
export type Award = z.infer<typeof awardSchema>;
export type AwardTheme = Award['theme'];
export type PresalePhase = z.infer<typeof presalePhaseSchema>;
export type RunnerKitItem = z.infer<typeof runnerKitItemSchema>;
export type Venue = z.infer<typeof venueSchema>;
export type LinkedLogo = z.infer<typeof linkedLogoSchema>;
export type Sponsor = z.infer<typeof sponsorSchema>;
export type RunningClub = z.infer<typeof runningClubSchema>;
export type PurposePillar = z.infer<typeof purposePillarSchema>;
export type RegistrationStep = z.infer<typeof registrationStepSchema>;
export type NavLink = z.infer<typeof navLinkSchema>;
export type RaceEvent = z.infer<typeof eventSchema>;
