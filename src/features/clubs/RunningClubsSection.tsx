import { Container, LogoMarquee } from '@/components/ui';
import { runningClubs, runningClubsSection } from '@/content';

export function RunningClubsSection() {
  return (
    <section
      id="clubes"
      className="relative z-20 border-b border-neutral-100 bg-white py-20 text-center sm:py-28 lg:py-32"
    >
      <Container className="px-4 sm:px-8">
        <span className="block font-athletic-bold text-xs tracking-widest text-brand-orange sm:text-sm">
          {runningClubsSection.eyebrow}
        </span>
        <h2 className="mt-1 font-athletic text-4xl text-neutral-950 sm:text-6xl">
          {runningClubsSection.title}
        </h2>
      </Container>

      <LogoMarquee items={runningClubs} />
    </section>
  );
}
