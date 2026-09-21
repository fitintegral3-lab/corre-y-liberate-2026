import { Container, CtaLink } from '@/components/ui';
import { distances, presalePhases, pricingSection } from '@/content';
import { siteConfig } from '@/config/site';
import { priceFor } from '@/domain/event/selectors';
import { formatCop, formatDateRange } from '@/lib/format';

/** Fondo negro al 69 %, exacto al diseno original. */
const cardBackground = 'rgba(0, 0, 0, 0.69)';

const cardClasses =
  'flex flex-col justify-between rounded-2xl border border-white/15 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:border-white/35 hover:shadow-2xl hover:shadow-black/70';

export function PricingSection() {
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
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 text-left md:grid-cols-4">
          {/* Columna de categorias: la llave de lectura de las tres siguientes. */}
          <div style={{ backgroundColor: cardBackground }} className={cardClasses}>
            <div>
              <h3 className="border-b border-white/20 pb-3 font-athletic-bold text-2xl text-white">
                {pricingSection.categoriesTitle}
              </h3>
              <div className="divide-y divide-white/15">
                {distances.map((distance) => (
                  <div key={distance.id} className="py-4">
                    <strong className="block font-athletic text-4xl leading-none text-white">
                      {distance.fullLabel}
                    </strong>
                    <span className="mt-1 block text-xs font-medium text-neutral-300">
                      {distance.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {presalePhases.map((phase) => (
            <div key={phase.id} style={{ backgroundColor: cardBackground }} className={cardClasses}>
              <div>
                <div className="border-b border-white/20 pb-3">
                  <h3 className="font-athletic-bold text-2xl leading-none text-white">
                    {phase.name}
                  </h3>
                  <span className="mt-1 block font-athletic-bold text-xs text-brand-orange">
                    {phase.tagline}
                  </span>
                </div>

                <div className="divide-y divide-white/15">
                  {distances.map((distance) => (
                    <div key={distance.id} className="py-4">
                      {/* En movil las cuatro tarjetas se apilan y la columna de
                          categorias queda arriba de todo, asi que un precio
                          suelto no dice a que distancia corresponde. Por eso
                          cada uno lleva su rotulo encima. En escritorio la
                          columna de la izquierda ya lo dice, y ahi el rotulo
                          queda solo para lectores de pantalla, que leen celda
                          por celda y tampoco ven esa columna. */}
                      <span className="mb-1 block font-athletic-bold text-sm tracking-wider text-white/70 md:mb-0 md:sr-only">
                        {distance.fullLabel}
                      </span>
                      <span className="block font-athletic text-4xl leading-none text-white sm:text-5xl">
                        {formatCop(priceFor(phase, distance.id))}
                      </span>
                      {/* Iguala la altura de fila con la columna de categorias,
                          que lleva dos lineas por distancia. En movil sobra: ahi
                          el rotulo ya ocupa esa linea. */}
                      <span
                        aria-hidden="true"
                        className="mt-1 hidden text-[11px] text-transparent select-none md:block"
                      >
                        -
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/15 pt-4 text-xs font-medium text-neutral-300">
                {formatDateRange(phase.startsOn, phase.endsOn)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <CtaLink
            href={siteConfig.links.registration}
            className="shadow-2xl shadow-black/40 hover:shadow-white/30"
          >
            {pricingSection.ctaLabel}
          </CtaLink>
        </div>
      </Container>
    </section>
  );
}
