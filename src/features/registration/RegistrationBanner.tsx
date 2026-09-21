import { CtaLink } from '@/components/ui';
import { presalePhases, registrationBanner } from '@/content';
import { siteConfig } from '@/config/site';
import { currentPresalePhase } from '@/domain/event/selectors';
import { formatLongDate } from '@/lib/format';

/**
 * Banda de inscripciones abiertas.
 *
 * La fecha limite sale de la fase de preventa vigente en vez de estar escrita
 * a mano: cuando cierra una fase, el texto pasa a anunciar la siguiente solo.
 * Si ya no queda ninguna abierta la banda no se renderiza, porque prometer un
 * precio que ya no se puede pagar es peor que no decir nada.
 */
export function RegistrationBanner() {
  const phase = currentPresalePhase(presalePhases);

  if (!phase) return null;

  return (
    <section
      className="relative overflow-hidden bg-cover bg-center px-4 py-16 text-center text-white sm:px-8"
      style={{ backgroundImage: "url('/backgrounds/bg_inscriptions.jpg')" }}
    >
      <div className="relative z-10 mx-auto max-w-4xl space-y-4">
        <h2 className="font-athletic text-4xl text-white drop-shadow sm:text-6xl">
          {registrationBanner.title}
        </h2>
        <p className="mx-auto max-w-2xl font-athletic-semibold text-sm text-neutral-200 sm:text-base lg:text-lg">
          Aprovecha los{' '}
          <span className="font-bold text-brand-orange">
            precios especiales hasta el {formatLongDate(phase.endsOn)}
          </span>{' '}
          y asegura tu lugar en la línea de salida.
        </p>
        <div className="pt-2">
          <CtaLink
            href={siteConfig.links.registration}
            className="py-3.5 shadow-xl shadow-black/30 hover:shadow-2xl hover:shadow-white/20"
          >
            {registrationBanner.ctaLabel}
          </CtaLink>
        </div>
      </div>
    </section>
  );
}
