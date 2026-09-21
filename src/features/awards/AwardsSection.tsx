import { awardCardStyles } from '@/features/awards/theme';
import { Container, CtaLink, DotPattern } from '@/components/ui';
import { awards, awardsSection, distances } from '@/content';
import { siteConfig } from '@/config/site';
import { awardTotals, findDistance } from '@/domain/event/selectors';
import { cn } from '@/lib/utils/cn';
import { formatCop, formatPlaceLabel } from '@/lib/format';

/** Fondo calido y energico: degradado sobre la fotografia de la premiacion. */
const backgroundImage = [
  'radial-gradient(ellipse 85% 75% at 50% 40%,' +
    ' rgba(255, 205, 30, 0.45) 0%,' +
    ' rgba(245, 105, 10, 0.45) 45%,' +
    ' rgba(195, 50, 0, 0.65) 80%,' +
    ' rgba(30, 8, 2, 0.85) 100%)',
  "url('/backgrounds/bg_premiacion.jpg')",
].join(', ');

export function AwardsSection() {
  return (
    <section
      id="premiacion"
      className="relative overflow-hidden bg-cover bg-center px-4 py-20 text-white sm:px-8"
      style={{ backgroundImage }}
    >
      <DotPattern dotColor="rgba(0, 0, 0, 0.7)" className="z-0 opacity-35" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(circle at 50% 38%, rgba(255, 220, 70, 0.3) 0%, rgba(255, 115, 0, 0.2) 50%, transparent 80%)',
        }}
      />

      <Container className="relative z-10 text-center">
        <div className="mb-14">
          <h2 className="font-athletic text-5xl text-white drop-shadow-sm sm:text-7xl lg:text-8xl">
            {awardsSection.title}
          </h2>
          <p className="mt-2 font-athletic-bold text-base tracking-widest text-white/95 sm:text-xl">
            {awardsSection.subtitle}
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 text-left md:grid-cols-3 lg:gap-8">
          {awards.map((award) => {
            const distance = findDistance(distances, award.distanceId);
            const style = awardCardStyles[award.theme];
            const totals = awardTotals(award);

            return (
              <article
                key={award.distanceId}
                style={{ backgroundColor: style.background }}
                className={cn(
                  'flex flex-col justify-between rounded-3xl p-6 shadow-2xl backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(0,0,0,0.5)] hover:ring-2 hover:ring-white/40 sm:p-8',
                  style.text,
                )}
              >
                <div>
                  <div className={cn('border-b-2 pb-3 text-center', style.border)}>
                    <span className="block text-center font-athletic text-6xl sm:text-7xl">
                      {distance.label}
                    </span>
                  </div>

                  <div className="my-6">
                    <table className="w-full border-collapse text-left">
                      <caption className="sr-only">
                        Premiación {distance.fullLabel} por puesto y rama
                      </caption>
                      <thead>
                        <tr
                          className={cn(
                            'border-b-2 font-athletic-bold text-xs tracking-wider opacity-90 sm:text-sm',
                            style.border,
                          )}
                        >
                          <th scope="col" className="py-2.5">
                            PUESTO
                          </th>
                          <th scope="col" className="py-2.5 text-center">
                            MUJERES
                          </th>
                          <th scope="col" className="py-2.5 text-right">
                            HOMBRES
                          </th>
                        </tr>
                      </thead>
                      <tbody
                        className={cn(
                          'divide-y font-athletic-bold text-xs sm:text-sm',
                          style.divider,
                        )}
                      >
                        {award.places.map((place) => (
                          <tr
                            key={place.position}
                            className="transition-colors duration-200 hover:bg-white/10"
                          >
                            <td className="py-3">{formatPlaceLabel(place.position)}</td>
                            <td className="py-3 text-center">{formatCop(place.women)}</td>
                            <td className="py-3 text-right">{formatCop(place.men)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div
                  className={cn(
                    'flex items-center justify-between border-t-2 pt-4 font-athletic text-xl sm:text-2xl',
                    style.border,
                  )}
                >
                  <span>TOTAL</span>
                  <span>
                    {totals.isBalanced
                      ? `${formatCop(totals.women)} / RAMA`
                      : `M ${formatCop(totals.women)} · H ${formatCop(totals.men)}`}
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-14">
          <CtaLink
            href={siteConfig.links.registration}
            className="shadow-2xl shadow-black/40 hover:shadow-orange-400/30"
          >
            {awardsSection.ctaLabel}
          </CtaLink>
        </div>
      </Container>
    </section>
  );
}
