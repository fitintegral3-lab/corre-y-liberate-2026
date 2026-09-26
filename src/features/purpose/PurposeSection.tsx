import { Container } from '@/components/ui';
import { purposePillars, purposeSection } from '@/content';

export function PurposeSection() {
  return (
    <section
      className="relative overflow-hidden bg-cover bg-[position:35%_center] text-white lg:bg-center"
      style={{ backgroundImage: "url('/backgrounds/bg_proposito.webp')" }}
    >
      <Container className="grid min-h-[460px] grid-cols-1 items-stretch p-4 sm:p-0 lg:grid-cols-12">
        <div className="my-4 flex flex-col justify-center space-y-6 rounded-3xl border border-white/10 bg-black/70 p-6 backdrop-blur-sm sm:p-12 lg:col-span-6 lg:my-0 lg:rounded-none lg:border-none lg:bg-transparent lg:p-16 lg:backdrop-blur-none">
          <h2 className="font-athletic text-4xl leading-[0.92] text-white sm:text-6xl lg:text-7xl">
            {purposeSection.titleLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="text-sm leading-relaxed font-medium text-neutral-300 italic sm:text-base">
            {purposeSection.intro}
          </p>

          <ol className="space-y-4 pt-2">
            {purposePillars.map((pillar) => (
              <li
                key={pillar.order}
                className="transition-transform duration-300 hover:translate-x-1"
              >
                <strong className="block font-athletic-bold text-xs text-brand-orange">
                  {String(pillar.order).padStart(2, '0')} — {pillar.title}
                </strong>
                <p className="mt-0.5 text-xs text-neutral-200 sm:text-sm">{pillar.description}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Mitad derecha vacia a proposito: ahi va la fotografia del fondo. */}
        <div aria-hidden="true" className="lg:col-span-6" />
      </Container>
    </section>
  );
}
