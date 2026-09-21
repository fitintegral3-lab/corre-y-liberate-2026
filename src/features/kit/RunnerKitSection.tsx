import Image from 'next/image';

import { Container, CtaLink } from '@/components/ui';
import { runnerKitItems, runnerKitSection } from '@/content';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils/cn';

export function RunnerKitSection() {
  return (
    <section
      id="kit"
      className="relative overflow-hidden bg-cover bg-[position:65%_center] text-white lg:bg-center"
      style={{ backgroundImage: "url('/backgrounds/bg_kit.webp')" }}
    >
      <Container className="grid min-h-[520px] grid-cols-1 items-stretch p-4 sm:p-0 lg:grid-cols-12">
        {/* Mitad izquierda vacia a proposito: ahi va la fotografia del fondo. */}
        <div aria-hidden="true" className="lg:col-span-6" />

        <div className="my-4 flex flex-col justify-center space-y-6 rounded-3xl border border-white/10 bg-black/65 p-6 backdrop-blur-sm sm:p-12 lg:col-span-6 lg:my-0 lg:rounded-none lg:border-none lg:bg-transparent lg:p-16 lg:backdrop-blur-none">
          <div>
            <span className="block font-athletic-bold text-sm tracking-widest text-brand-orange sm:text-base">
              {runnerKitSection.eyebrow}
            </span>
            <h2 className="mt-1 font-athletic text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
              {runnerKitSection.titleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
          </div>

          <ul className="grid grid-cols-3 gap-3 pt-2 pb-2 sm:grid-cols-6 sm:gap-0">
            {runnerKitItems.map((item, index) => (
              <li
                key={item.id}
                className={cn(
                  'group/kit flex flex-col items-center px-2 py-2 text-center transition-transform duration-300 hover:scale-110 sm:py-0',
                  index !== 0 && 'sm:border-l-2 sm:border-brand-orange',
                )}
              >
                <div className="relative mb-2 flex h-16 w-16 items-center justify-center transition-transform duration-300 group-hover/kit:-translate-y-1">
                  <Image
                    src={item.icon}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-contain brightness-110 drop-shadow filter"
                  />
                </div>
                <span className="font-athletic-semibold text-xs tracking-wide text-white/95 transition-colors group-hover/kit:text-brand-orange sm:text-sm">
                  {item.label}
                </span>
              </li>
            ))}
          </ul>

          <p className="text-xs font-medium text-neutral-300 italic sm:text-sm">
            {runnerKitSection.note}
          </p>

          <div>
            <CtaLink
              href={siteConfig.links.registration}
              size="md"
              className="shadow-xl hover:shadow-2xl hover:shadow-white/20"
            >
              {runnerKitSection.ctaLabel}
            </CtaLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
