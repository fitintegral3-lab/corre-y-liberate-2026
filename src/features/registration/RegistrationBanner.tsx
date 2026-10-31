import { CtaLink } from '@/components/ui';
import { presalePhases, registrationBanner } from '@/content';
import { siteConfig } from '@/config/site';
import { currentPresalePhase } from '@/domain/event/selectors';
import { formatLongDate } from '@/lib/format';

/**
 * Banda de inscripciones abiertas.
 *
 * La fecha limite sale del periodo de venta. Al cerrar las inscripciones,
 * la banda deja de anunciar cupos disponibles.
 */
export function RegistrationBanner() {
  const phase = currentPresalePhase(presalePhases);

  if (!phase) return null;

  return (
    <section
      className="relative overflow-hidden bg-cover bg-center px-4 py-16 text-center text-white sm:px-8"
      style={{ backgroundImage: "url('/backgrounds/bg_inscriptions.webp')" }}
    >
      <div className="relative z-10 mx-auto max-w-4xl space-y-4">
        <h2 className="font-athletic text-4xl text-white drop-shadow sm:text-6xl">
          {registrationBanner.title}
        </h2>
        <p className="mx-auto max-w-2xl font-athletic-semibold text-sm text-neutral-200 sm:text-base lg:text-lg">
          Inscríbete{' '}
          <span className="font-bold text-brand-orange">
            hasta el {formatLongDate(phase.endsOn)}
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
