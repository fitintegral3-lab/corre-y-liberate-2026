import { Container, CtaLink, DotPattern } from '@/components/ui';
import { distances, event, heroSection } from '@/content';
import { siteConfig } from '@/config/site';
import { formatDayAndShortMonth } from '@/lib/format';

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-[640px] items-center overflow-hidden bg-cover bg-[position:18%_center] sm:bg-[position:25%_center] lg:min-h-[740px] lg:bg-center"
      style={{ backgroundImage: "url('/backgrounds/bg_hero.jpg')" }}
    >
      {/* Contraste para que el texto se lea sobre la fotografia en pantallas chicas. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-black/85 via-black/55 to-black/20 sm:from-black/60 sm:to-transparent lg:hidden"
      />

      <DotPattern fadeToRight className="z-10 opacity-35" />

      <Container className="relative z-20 px-4 py-12 sm:px-10 lg:py-16">
        <div className="max-w-2xl space-y-6 text-white">
          <div>
            <h1 className="font-athletic text-6xl leading-[0.85] text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] sm:text-8xl lg:text-[108px]">
              {heroSection.titleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-4 font-athletic-bold text-base tracking-wider text-white/95 uppercase drop-shadow-md sm:text-xl">
              {event.tagline.lead}{' '}
              <span className="underline decoration-white/50">{event.tagline.highlight}</span>
            </p>
          </div>

          {/* Horarios de salida. El ancla `#distancias` la usa la navegacion. */}
          <div
            id="distancias"
            className="inline-block w-full max-w-lg rounded-2xl border-2 border-white/60 bg-black/40 p-4 shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-white/90 hover:shadow-orange-950/40 sm:p-5"
          >
            <dl className="grid grid-cols-4 divide-x divide-white/40 text-center">
              {distances.map((distance) => (
                <div
                  key={distance.id}
                  className="px-2 transition-transform duration-300 hover:scale-105"
                >
                  <dt className="block font-athletic text-4xl text-white sm:text-6xl">
                    {distance.label}
                  </dt>
                  <dd className="mt-1 block font-athletic-semibold text-xs text-white/90 sm:text-sm">
                    {distance.startTime}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <CtaLink
              href={siteConfig.links.registration}
              className="shadow-xl shadow-black/30 hover:shadow-2xl hover:shadow-white/20"
            >
              {heroSection.ctaLabel} · {formatDayAndShortMonth(event.date)}
            </CtaLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
