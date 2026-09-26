import { Check } from 'lucide-react';

import { Container, CtaLink } from '@/components/ui';
import { registrationChecklist, registrationSection, registrationSteps } from '@/content';
import { siteConfig } from '@/config/site';

/**
 * Que esperar al tocar «Inscríbete».
 *
 * La plataforma de inscripciones es de un tercero, cobra por transferencia y
 * pide 35 campos. Esta seccion no cambia eso —no es nuestra— pero evita la
 * sorpresa: quien llega sabiendo que necesita la cedula, la EPS y el
 * comprobante no abandona a mitad del formulario para ir a buscarlos.
 */
export function RegistrationStepsSection() {
  return (
    <section
      id="como-inscribirte"
      className="border-y border-neutral-100 bg-white px-4 py-20 sm:px-8"
    >
      <Container className="space-y-12">
        <div className="text-center">
          <span className="block font-athletic-bold text-xs tracking-widest text-brand-orange sm:text-sm">
            {registrationSection.eyebrow}
          </span>
          <h2 className="mt-1 font-athletic text-4xl text-neutral-950 sm:text-6xl">
            {registrationSection.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium text-neutral-600 sm:text-base">
            {registrationSection.intro}
          </p>
        </div>

        <ol className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          {registrationSteps.map((step) => (
            <li
              key={step.order}
              className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-orange/40 hover:shadow-lg"
            >
              <span className="block font-athletic text-5xl leading-none text-brand-orange">
                {String(step.order).padStart(2, '0')}
              </span>
              <h3 className="mt-3 font-athletic-bold text-xl text-neutral-950">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{step.description}</p>
            </li>
          ))}
        </ol>

        <div className="mx-auto max-w-3xl rounded-2xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
          <h3 className="font-athletic-bold text-sm tracking-widest text-brand-orange">
            {registrationSection.checklistTitle}
          </h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {registrationChecklist.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-neutral-700">
                <Check
                  size={16}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 stroke-[3] text-brand-orange"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center">
          <CtaLink
            href={siteConfig.links.registration}
            variant="brandDeep"
            className="shadow-lg shadow-orange-900/20 hover:shadow-orange-600/40"
          >
            {registrationSection.ctaLabel}
          </CtaLink>
        </div>
      </Container>
    </section>
  );
}
