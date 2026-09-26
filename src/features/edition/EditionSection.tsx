import Image from 'next/image';

import { CtaLink } from '@/components/ui';
import { editionLabel, editionSection, event } from '@/content';
import { siteConfig } from '@/config/site';

export function EditionSection() {
  return (
    <section className="border-y border-neutral-100 bg-white px-4 py-18 text-center sm:px-8">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="mb-3 flex justify-center">
          <Image
            src={event.organizer.logo}
            alt={event.organizer.name}
            width={85}
            height={85}
            className="h-16 w-auto object-contain transition-transform duration-300 hover:scale-110 sm:h-20"
          />
        </div>
        <h2 className="font-athletic text-5xl text-brand-orange sm:text-6xl">{editionLabel}</h2>
        <p className="mx-auto max-w-2xl text-base leading-relaxed font-bold text-neutral-800 sm:text-xl">
          {editionSection.promise}
        </p>
        <div className="pt-4">
          <CtaLink
            href={siteConfig.links.registration}
            variant="brandDeep"
            className="shadow-lg shadow-orange-900/20 hover:shadow-orange-600/40"
          >
            {editionSection.ctaLabel}
          </CtaLink>
        </div>
      </div>
    </section>
  );
}
