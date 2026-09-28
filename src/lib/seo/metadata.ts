import { distances, editionName, event, eventName, venue } from '@/content';
import { siteConfig } from '@/config/site';
import { isProduction } from '@/lib/env';
import { formatWeekdayLongDate } from '@/lib/format';

import type { Metadata } from 'next';

/**
 * Metadatos del sitio, derivados del contenido.
 *
 * Antes la fecha, la ciudad y las distancias estaban escritas a mano en el
 * `layout` ademas de en la pagina: corregir la fecha obligaba a acordarse de
 * los dos lugares. Aca se arma una sola vez desde `src/content/`.
 */

const distanceList = [...distances]
  .sort((a, b) => b.kilometers - a.kilometers)
  .map((distance) => distance.fullLabel);

/** `10K, 7K, 5K y 3K`. */
function humanJoin(values: readonly string[]): string {
  if (values.length <= 1) return values[0] ?? '';
  return `${values.slice(0, -1).join(', ')} y ${values[values.length - 1]}`;
}

export const siteTitle = `${eventName} — ${editionName} Oficial | ${event.organizer.name} ${venue.city}`;

export const siteDescription = [
  `Carrera deportiva y social en ${venue.city}, ${venue.region}.`,
  `${formatWeekdayLongDate(event.date)}.`,
  `Distancias ${humanJoin(distanceList)}.`,
  '¡Asegura tu cupo al mejor precio!',
].join(' ');

export function buildSiteMetadata(): Metadata {
  return {
    // Con `metadataBase` puesto, toda ruta relativa de Open Graph se vuelve
    // absoluta sola. Sin el, Next avisa y los previews quedan sin imagen.
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteTitle,
      template: `%s | ${eventName}`,
    },
    description: siteDescription,
    applicationName: siteConfig.name,
    authors: [{ name: event.organizer.name }],
    creator: event.organizer.name,
    publisher: event.organizer.name,
    keywords: [
      event.name,
      `Carrera ${venue.city}`,
      event.organizer.name,
      `Maratón ${venue.city} ${event.year}`,
      `Carrera 10K ${venue.region}`,
      'Carrera con causa social',
      venue.name,
    ],
    alternates: { canonical: '/' },
    icons: {
      icon: '/logos/logo_nav.png',
      shortcut: '/logos/logo_nav.png',
      apple: '/logos/logo_nav.png',
    },
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      url: siteConfig.url,
      title: `${eventName} — ${editionName} Oficial`,
      description: `${event.claim}. Inscríbete ya para la carrera atlética de ${venue.city}.`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${eventName} — ${editionName}`,
      description: `${event.claim}. ${formatWeekdayLongDate(event.date)} en ${venue.city}.`,
    },
    // Las previews de `development` no deben aparecer en Google compitiendo
    // con el sitio real por las mismas busquedas.
    robots: isProduction
      ? { index: true, follow: true }
      : { index: false, follow: false, nocache: true },
  };
}
