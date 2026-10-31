import { Container, CtaLink } from '@/components/ui';
import { landingDistances as distances, presalePhases, pricingSection } from '@/content';
import { withoutShirtPrices } from '@/content/without-shirt';
import { siteConfig } from '@/config/site';
import { currentPresalePhase, priceFor } from '@/domain/event/selectors';
import { formatCop, formatLongDate } from '@/lib/format';

const cardBackground = 'rgba(0, 0, 0, 0.69)';

export function PricingSection() {
  const phase = currentPresalePhase(presalePhases);

  return (
    <section
      id="precios"
      className="relative overflow-hidden bg-cover bg-center px-4 py-22 text-white sm:px-8"
      style={{ backgroundImage: "url('/backgrounds/bg_preventas.webp')" }}
    >
      <Container className="relative z-10 text-center">
        <div className="mb-14">
          <h2 className="font-athletic-bold text-2xl tracking-wider text-brand-grey sm:text-3xl">
            {pricingSection.eyebrow}
          </h2>
          <p className="mt-1 font-athletic text-6xl text-white sm:text-8xl lg:text-9xl">
            {pricingSection.title}
          </p>
          <p className="mt-4 text-lg font-semibold text-white/90">
            {phase
              ? `Inscripciones abiertas hasta el ${formatLongDate(phase.endsOn)}`
              : 'Las inscripciones están cerradas.'}
          </p>
          <p className="mt-2 text-sm text-white/70">{pricingSection.categoriesHint}</p>
        </div>

        {phase && (
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
            {distances.map((distance) => (
              <div
                key={distance.id}
                style={{ backgroundColor: cardBackground }}
                className="rounded-2xl border border-white/15 p-6 backdrop-blur-md"
              >
                <h3 className="font-athletic text-5xl text-white">{distance.fullLabel}</h3>
                <p className="mt-2 text-sm text-neutral-300">{distance.description}</p>
                <p className="mt-6 font-athletic text-5xl text-white sm:text-6xl">
                  {distance.soldOut
                    ? pricingSection.soldOutLabel
                    : formatCop(priceFor(phase, distance.id))}
                </p>
              </div>
            ))}
          </div>
        )}

        {phase && (
          <div
            className="mx-auto mt-8 max-w-3xl rounded-2xl border border-white/20 p-6 backdrop-blur-md"
            style={{ backgroundColor: cardBackground }}
          >
            <h3 className="font-athletic-bold text-2xl tracking-wider">
              TAMBIÉN PUEDES CORRER SIN CAMISETA
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {distances
                .filter((distance) => distance.id in withoutShirtPrices)
                .map((distance) => (
                  <p key={distance.id} className="text-lg">
                    {distance.label} sin camiseta:{' '}
                    <strong>
                      {distance.soldOut
                        ? pricingSection.soldOutLabel
                        : formatCop(
                            withoutShirtPrices[distance.id as keyof typeof withoutShirtPrices],
                          )}
                    </strong>
                  </p>
                ))}
            </div>
            <p className="mt-3 text-sm text-white/80">
              Elige con o sin camiseta al inscribirte. Precios sin camiseta no acumulables con
              códigos de descuento.
            </p>
          </div>
        )}

        {phase && (
          <div className="mt-12">
            <CtaLink
              href={siteConfig.links.registration}
              className="shadow-2xl shadow-black/40 hover:shadow-white/30"
            >
              {pricingSection.ctaLabel}
            </CtaLink>
          </div>
        )}
      </Container>
    </section>
  );
}
