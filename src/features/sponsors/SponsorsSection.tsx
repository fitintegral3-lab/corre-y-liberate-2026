import Image from 'next/image';

import { Container } from '@/components/ui';
import { sponsors, sponsorsSection } from '@/content';

export function SponsorsSection() {
  return (
    <section
      id="patrocinadores"
      className="relative z-20 border-y border-neutral-100 bg-white px-4 py-20 text-center sm:px-8 sm:py-28 lg:py-32"
    >
      <Container className="space-y-12 sm:space-y-16">
        <div>
          <span className="block font-athletic-bold text-xs tracking-widest text-brand-orange sm:text-sm">
            {sponsorsSection.eyebrow}
          </span>
          <h2 className="mt-1 font-athletic text-4xl text-neutral-950 sm:text-6xl">
            {sponsorsSection.title}
          </h2>
        </div>

        <ul className="mx-auto grid max-w-7xl grid-cols-2 items-center justify-items-center gap-8 sm:grid-cols-3 sm:gap-12 lg:grid-cols-4 lg:gap-14">
          {sponsors.map((sponsor) => (
            <li
              key={sponsor.id}
              className="group flex h-40 w-full max-w-[300px] items-center justify-center p-2 transition-transform duration-300 hover:scale-108 sm:h-52 sm:p-4 lg:h-60"
            >
              <Image
                src={sponsor.logo}
                alt={sponsor.name}
                width={480}
                height={320}
                sizes="(min-width: 1024px) 300px, (min-width: 640px) 33vw, 50vw"
                className="max-h-32 w-auto object-contain transition-transform duration-300 group-hover:scale-105 sm:max-h-44 lg:max-h-52"
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
