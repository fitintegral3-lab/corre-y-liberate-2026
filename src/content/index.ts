/**
 * Punto unico de entrada al contenido del evento.
 *
 * Los componentes importan desde `@/content` y no desde cada archivo: asi
 * reorganizar esta carpeta no toca ninguna seccion.
 */
export { awards, awardsSection } from '@/content/awards';
export { runningClubs, runningClubsSection } from '@/content/clubs';
export { distances } from '@/content/distances';
export {
  editionLabel,
  editionName,
  editionSection,
  event,
  eventName,
  eventTitle,
  fullTagline,
  heroSection,
} from '@/content/event';
export { runnerKitItems, runnerKitSection } from '@/content/kit';
export { homeAnchor, navLinks } from '@/content/navigation';
export { presalePhases, pricingSection } from '@/content/pricing';
export {
  registrationBanner,
  registrationChecklist,
  registrationSection,
  registrationSteps,
} from '@/content/registration';
export { purposePillars, purposeSection } from '@/content/purpose';
export { registrationErrors, registrationFormCopy, terms } from '@/content/registration-form';
export type { RegistrationErrorReason } from '@/content/registration-form';
export { sponsors, sponsorsSection } from '@/content/sponsors';
export { venue, venueFullAddress, venueSection } from '@/content/venue';
