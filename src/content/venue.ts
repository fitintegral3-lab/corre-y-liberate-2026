import { venueSchema } from '@/domain/event/schema';

/** Sede y punto de partida. */
export const venue = venueSchema.parse({
  name: 'ESTADIO EL CACIQUE',
  address: 'Km 2 Vía Chipaya, Alfaguara',
  city: 'Jamundí',
  region: 'Valle del Cauca',
  country: 'Colombia',
  mapsUrl: 'https://share.google/VDmYIqfv4StJiX6wc',
  mapImage: '/images/assets/mapa_estadio_el_cacique.webp',
  doorsOpenAt: '5:00 A.M.',
  doorsOpenNote:
    'Llega con tiempo, ubica tu corral y disfruta de las experiencias y stands antes de la salida.',
});

/** `Km 2 Vía Chipaya, Alfaguara · Jamundí, Valle del Cauca`. */
export const venueFullAddress = `${venue.address} · ${venue.city}, ${venue.region}`;

export const venueSection = {
  title: 'TODO EMPIEZA EN EL CACIQUE.',
  mapCtaLabel: 'VER CÓMO LLEGAR',
  mapOverlayLabel: 'VER EN GOOGLE MAPS',
  doorsOpenLabel: 'APERTURA DEL EVENTO',
  scheduleLabel: 'HORARIOS DE SALIDA',
} as const;
