import {
  awards,
  distances,
  event,
  eventName,
  presalePhases,
  venue,
  venueFullAddress,
} from '@/content';
import { siteConfig } from '@/config/site';
import { currentPresalePhase, priceFor, totalPrizePool } from '@/domain/event/selectors';
import { formatCop, toIsoDateTime } from '@/lib/format';

import { siteDescription } from '@/lib/seo/metadata';

/**
 * Datos estructurados schema.org.
 *
 * Un `SportsEvent` bien descrito es lo que hace que Google muestre la fecha, la
 * sede y el rango de precios directamente en el resultado de busqueda. Se
 * genera desde el mismo contenido que renderiza la pagina, asi que no puede
 * decir una fecha distinta a la que ve quien entra.
 */
export function buildEventJsonLd(now: Date = new Date()) {
  const phase = currentPresalePhase(presalePhases, now);

  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: eventName,
    description: siteDescription,
    sport: 'Running',
    startDate: toIsoDateTime(event.date, venue.doorsOpenAt),
    endDate: toIsoDateTime(event.date, '12:00 pm'),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    url: siteConfig.url,
    image: [new URL('/backgrounds/bg_hero.webp', siteConfig.url).toString()],
    location: {
      '@type': 'Place',
      name: venue.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: venue.address,
        addressLocality: venue.city,
        addressRegion: venue.region,
        addressCountry: 'CO',
      },
    },
    organizer: {
      '@type': 'Organization',
      name: event.organizer.name,
      url: siteConfig.url,
    },
    // Un `Offer` por distancia con el precio de la fase vigente. Cuando ya no
    // queda fase abierta el evento se publica sin ofertas, que es lo correcto:
    // anunciar un precio que ya no se puede pagar es peor que no anunciarlo.
    offers: phase
      ? distances.map((distance) => ({
          '@type': 'Offer',
          name: `${distance.fullLabel} · ${phase.name}`,
          price: priceFor(phase, distance.id),
          priceCurrency: 'COP',
          url: siteConfig.links.registration,
          availability: 'https://schema.org/InStock',
          validFrom: phase.startsOn,
          validThrough: phase.endsOn,
        }))
      : undefined,
    subEvent: distances.map((distance) => ({
      '@type': 'SportsEvent',
      name: `${eventName} · ${distance.fullLabel}`,
      startDate: toIsoDateTime(event.date, distance.startTime),
      location: { '@type': 'Place', name: venue.name, address: venueFullAddress },
    })),
    award: `Bolsa de premios de ${formatCop(totalPrizePool(awards))} en efectivo`,
  };
}

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: event.organizer.name,
    url: siteConfig.url,
    logo: new URL(event.organizer.logo, siteConfig.url).toString(),
    sameAs: [siteConfig.links.instagram, siteConfig.links.facebook],
  };
}
