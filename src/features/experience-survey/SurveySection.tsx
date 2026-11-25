import { Container, CtaLink } from '@/components/ui';

export function SurveySection() {
  return (
    <section id="encuesta" className="scroll-mt-28 bg-stone-50 px-4 pt-8 sm:px-8 sm:pt-12">
      <Container>
        <div className="flex flex-col items-start justify-between gap-5 rounded-3xl border border-neutral-200 border-l-4 border-l-brand-orange bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="font-athletic text-3xl text-ink sm:text-4xl">
              ¿Cómo te fue en la carrera?
            </h2>
            <p className="mt-1 text-sm text-neutral-700">
              Responde la encuesta de experiencia. Son 2 minutos y nos ayudan a mejorar en 2027.
            </p>
          </div>
          <CtaLink
            href="/encuesta"
            variant="brandDeep"
            size="md"
            className="shrink-0 bg-orange-700"
          >
            Responder encuesta
          </CtaLink>
        </div>
      </Container>
    </section>
  );
}
