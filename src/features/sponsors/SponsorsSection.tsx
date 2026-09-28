import { Container, LogoMarquee } from '@/components/ui';
import { sponsors, sponsorsSection } from '@/content';

export function SponsorsSection() {
  return (
    <section
      id="patrocinadores"
      className="relative z-20 border-y border-neutral-100 bg-white py-20 text-center sm:py-28 lg:py-32"
    >
      <Container className="px-4 sm:px-8">
        <span className="block font-athletic-bold text-xs tracking-widest text-brand-orange sm:text-sm">
          {sponsorsSection.eyebrow}
        </span>
        <h2 className="mt-1 font-athletic text-4xl text-neutral-950 sm:text-6xl">
          {sponsorsSection.title}
        </h2>
      </Container>

      {/* La tira va fuera del Container para cruzar la pantalla entera. */}
      <LogoMarquee items={sponsors} />
    </section>
  );
}
