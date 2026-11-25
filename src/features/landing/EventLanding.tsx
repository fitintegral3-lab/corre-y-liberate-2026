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
import { FairSection } from '@/features/entrepreneur-fair/FairSection';
import { SurveySection } from '@/features/experience-survey/SurveySection';

/** Landing de la carrera, la que se muestra mientras hay una edición en curso. */
export function EventLanding() {
  return (
    <div className="min-h-screen bg-white font-body text-ink selection:bg-brand-orange selection:text-white">
      <SiteHeader />

      <main>
        <HeroSection />
        <RegistrationBanner />
        <SurveySection />
        <FairSection />
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
    </div>
  );
}
