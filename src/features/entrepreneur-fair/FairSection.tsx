import { Container, CtaLink } from '@/components/ui';

export function FairSection() {
  return (
    <section id="feria-empresarial" className="scroll-mt-28 bg-stone-50 px-4 py-8 sm:px-8 sm:py-12">
      <Container>
        <div className="flex flex-col items-start justify-between gap-5 rounded-3xl border border-neutral-200 border-l-4 border-l-brand-orange bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="font-athletic text-3xl text-ink sm:text-4xl">Feria Empresarial</h2>
            <p className="mt-1 text-sm text-neutral-700">
              Completa el formato de caracterización de emprendedoras.
            </p>
          </div>
          <CtaLink
            href="/feria-empresarial"
            variant="brandDeep"
            size="md"
            className="shrink-0 bg-orange-700"
          >
            Diligenciar formulario
          </CtaLink>
        </div>
      </Container>
    </section>
  );
}
