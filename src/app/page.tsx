import { SiteFooter, SiteHeader, WhatsAppFab } from '@/components/layout';
import {
  AwardsSection,
  EditionSection,
  HeroSection,
  PricingSection,
  PurposeSection,
  RegistrationBanner,
  RegistrationStepsSection,
  RunnerKitSection,
  RunningClubsSection,
  SponsorsSection,
  VenueSection,
} from '@/features';
import { buildEventJsonLd, buildOrganizationJsonLd } from '@/lib/seo/json-ld';

/**
 * La pagina se prerenderiza y se revalida cada hora.
 *
 * El contenido es estatico salvo por un dato que depende del calendario: cual
 * preventa esta vigente. Una hora es suficiente para que el cambio de fase se
 * refleje solo, sin redesplegar y sin renderizar en cada visita.
 */
export const revalidate = 3600;

/**
 * Serializa datos estructurados para incrustarlos en el HTML.
 *
 * `</script>` dentro de una cadena cerraria la etiqueta antes de tiempo; se
 * escapa el `<` para que eso no pueda pasar aunque manana el contenido lo
 * incluya.
 */
function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-body text-ink selection:bg-brand-orange selection:text-white">
      <SiteHeader />

      <main>
        <HeroSection />
        <RegistrationBanner />
        <AwardsSection />
        <EditionSection />
        <PricingSection />
        <RegistrationStepsSection />
        <RunnerKitSection />
        <VenueSection />
        <SponsorsSection />
        <RunningClubsSection />
        <PurposeSection />
      </main>

      <SiteFooter />
      <WhatsAppFab />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildEventJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildOrganizationJsonLd()) }}
      />
    </div>
  );
}
