import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

import { Container, CtaLink } from '@/components/ui';
import { distances, event, fullTagline, venue, venueFullAddress, venueSection } from '@/content';
import { formatDayAndShortMonth, formatWeekday, formatWeekdayLongDate } from '@/lib/format';

export function VenueSection() {
  return (
    <section
      id="como-llegar"
      className="relative bg-cover bg-center px-4 py-20 sm:px-8"
      style={{ backgroundImage: "url('/backgrounds/bg_ubicacion.webp')" }}
    >
      <Container className="space-y-12">
        <div>
          <span className="block font-athletic-bold text-xs tracking-widest text-brand-orange sm:text-sm">
            {fullTagline}
          </span>
          <h2 className="mt-1 font-athletic text-5xl text-neutral-950 sm:text-7xl">
            {venueSection.title}
          </h2>
          <p className="mt-1 text-sm font-semibold text-neutral-600 italic">
            {formatWeekdayLongDate(event.date)} · {venue.city}, {venue.region}
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
          <div className="space-y-4 rounded-3xl border border-neutral-200 bg-white/95 p-6 shadow-md backdrop-blur-md lg:col-span-6">
            {/* La imagen completa es el enlace: es el gesto que la gente intenta primero. */}
            <a
              href={venue.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Haz clic para ver la ubicación en Google Maps"
              className="group relative block aspect-[16/9] min-h-[220px] w-full cursor-pointer overflow-hidden rounded-2xl border border-neutral-200 shadow-inner"
            >
              <Image
                src={venue.mapImage}
                alt={`Mapa de ${venue.name} — clic para abrir en Google Maps`}
                fill
                // Sin `unoptimized`: la fuente es un WebP sin perdida de 1572 px
                // y next/image entrega el tamanio que cada pantalla necesita.
                // En un telefono son ~30 KB en vez de los 422 KB del PNG que
                // habia antes, que viajaba entero.
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/20">
                <span className="flex translate-y-2 items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 font-athletic-bold text-xs text-neutral-950 opacity-0 shadow-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {venueSection.mapOverlayLabel}
                  <ArrowUpRight size={14} aria-hidden="true" className="stroke-[3]" />
                </span>
              </div>
            </a>

            <div className="flex flex-col justify-between gap-4 pt-2 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-athletic-bold text-2xl text-neutral-950">{venue.name}</h3>
                <address className="text-xs font-medium text-neutral-600 not-italic">
                  {venueFullAddress}
                </address>
              </div>
              <CtaLink
                href={venue.mapsUrl}
                variant="brand"
                size="sm"
                iconSize={14}
                className="shrink-0 shadow-md shadow-orange-600/30 hover:shadow-orange-500/50"
              >
                {venueSection.mapCtaLabel}
              </CtaLink>
            </div>
          </div>

          <div className="space-y-6 rounded-3xl border border-neutral-800 bg-ink/95 p-8 text-white shadow-xl backdrop-blur-md lg:col-span-6">
            <div>
              <span className="block font-athletic-bold text-xs tracking-wider text-brand-orange">
                {formatWeekday(event.date)}
              </span>
              <h3 className="font-athletic text-5xl text-white">
                <time dateTime={event.date}>
                  {formatDayAndShortMonth(event.date)} {event.year}
                </time>
              </h3>
            </div>

            <div className="space-y-1">
              <span className="font-athletic-semibold text-xs tracking-wider text-neutral-400">
                {venueSection.doorsOpenLabel}
              </span>
              <div className="font-athletic text-5xl text-white">{venue.doorsOpenAt}</div>
              <p className="text-xs text-neutral-300">{venue.doorsOpenNote}</p>
            </div>

            <div className="border-t border-neutral-800 pt-2">
              <span className="mb-3 block font-athletic-semibold text-xs tracking-wider text-brand-orange">
                {venueSection.scheduleLabel}
              </span>
              <dl className="grid grid-cols-4 gap-2 text-center">
                {distances.map((distance) => (
                  <div
                    key={distance.id}
                    className="rounded-xl border border-neutral-800 bg-neutral-900 p-2.5 transition-transform duration-300 hover:scale-105 hover:border-neutral-700"
                  >
                    <dt className="block font-athletic text-3xl text-white">{distance.label}</dt>
                    <dd className="text-[11px] font-semibold text-neutral-300">
                      {distance.startTime}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
