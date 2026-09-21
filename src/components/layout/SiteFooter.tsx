import { MessageCircle, Sparkles } from 'lucide-react';
import Image from 'next/image';

import { FacebookIcon, InstagramIcon } from '@/components/ui/icons/SocialIcons';
import { Container } from '@/components/ui';
import { editionName, event, navLinks, venue } from '@/content';
import { siteConfig } from '@/config/site';

const socialLinkClasses =
  'flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-white text-black shadow-md transition-all duration-300 hover:scale-[1.08] hover:bg-brand-orange hover:text-white hover:shadow-lg hover:shadow-orange-600/30';

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-900 bg-black px-4 py-16 text-center text-white sm:px-8">
      <Container className="space-y-10">
        <div className="flex justify-center">
          <Image
            src="/logos/logo_white.png"
            alt={event.name}
            width={320}
            height={100}
            className="h-20 w-auto object-contain transition-transform duration-300 hover:scale-105 sm:h-28"
          />
        </div>

        <div className="mx-auto max-w-4xl border-y border-neutral-800 py-6">
          <nav aria-label="Navegación del pie de página">
            <ul className="flex flex-wrap justify-center gap-8 sm:gap-12">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="font-athletic-bold text-base tracking-wider text-neutral-300 transition-colors hover:text-white sm:text-lg"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center justify-center gap-6">
          <a
            href={siteConfig.links.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className={socialLinkClasses}
          >
            <MessageCircle size={26} aria-hidden="true" />
          </a>
          <a
            href={siteConfig.links.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className={socialLinkClasses}
          >
            <InstagramIcon className="h-7 w-7 fill-current" />
          </a>
          <a
            href={siteConfig.links.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className={socialLinkClasses}
          >
            <FacebookIcon className="h-7 w-7 fill-current" />
          </a>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row sm:gap-4">
          <p className="text-xs font-medium text-neutral-400">
            © {event.year} {event.name} · {editionName} {event.organizer.name} · {venue.city},{' '}
            {venue.region}. Todos los derechos reservados.
          </p>
          <span className="hidden text-neutral-700 sm:inline">|</span>
          <a
            href={siteConfig.credits.developer.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/90 px-4 py-1.5 text-xs text-neutral-300 shadow-md transition-all duration-300 hover:scale-105 hover:border-brand-amber hover:text-white"
            aria-label={`Sitio web de ${siteConfig.credits.developer.name}`}
          >
            <Sparkles
              size={13}
              aria-hidden="true"
              className="text-brand-amber transition-colors duration-300 group-hover:rotate-12 group-hover:text-[#ffaa00]"
            />
            <span className="text-[11px] tracking-wide sm:text-xs">
              Desarrollado por{' '}
              <span className="font-bold text-white transition-colors group-hover:text-[#ffaa00]">
                {siteConfig.credits.developer.name}
              </span>{' '}
              ↗
            </span>
          </a>
        </div>
      </Container>
    </footer>
  );
}
