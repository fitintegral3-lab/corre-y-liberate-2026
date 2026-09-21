'use client';

import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { homeAnchor, navLinks } from '@/content';
import { siteConfig } from '@/config/site';
import { Container } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

/**
 * Cabecera pegajosa con navegacion.
 *
 * Es el unico componente cliente de la pagina: lo necesita por el menu movil,
 * que es estado. Todo lo demas se renderiza en el servidor, asi que el
 * JavaScript que descarga el visitante es este archivo y nada mas.
 */
export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const linkClasses =
    'font-athletic-bold tracking-wider text-neutral-800 transition-colors hover:text-brand-orange';

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-100 bg-white/95 shadow-sm backdrop-blur-md transition-all">
      <Container className="flex items-center justify-between px-4 py-3 sm:px-8">
        <a
          href={homeAnchor}
          className="flex items-center transition-transform duration-300 hover:scale-105"
        >
          <Image
            src="/logos/logo_nav.png"
            alt="Corre y Libérate"
            width={260}
            height={70}
            className="h-14 w-auto object-contain sm:h-20"
            priority
          />
        </a>

        <nav aria-label="Navegación principal" className="hidden items-center gap-9 lg:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className={cn(linkClasses, 'text-xs')}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center lg:flex">
          <a
            href={siteConfig.links.registration}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer rounded-full bg-brand-orange px-9 py-3 font-athletic-bold text-xs tracking-wider text-white shadow-lg shadow-orange-900/25 transition-all duration-300 hover:scale-[1.08] hover:bg-brand-orange-bright hover:shadow-xl hover:shadow-orange-500/40 active:scale-95"
          >
            INSCRÍBETE
          </a>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="p-2 text-neutral-900 transition-transform hover:scale-110 hover:text-brand-orange active:scale-90 lg:hidden"
          aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isMenuOpen}
          aria-controls="menu-movil"
        >
          {isMenuOpen ? <X size={30} /> : <Menu size={30} />}
        </button>
      </Container>

      {isMenuOpen && (
        <nav
          id="menu-movil"
          aria-label="Navegación principal"
          className="animate-in fade-in slide-in-from-top-3 flex flex-col gap-4 border-t border-neutral-100 bg-white px-6 py-5 shadow-xl duration-200 lg:hidden"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={cn(linkClasses, 'text-base')}
            >
              {link.label}
            </a>
          ))}
          <a
            href={siteConfig.links.registration}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 cursor-pointer rounded-full bg-brand-orange py-3.5 text-center font-athletic-bold text-xs text-white shadow-md shadow-orange-900/30 transition-all duration-300 hover:scale-[1.04] hover:bg-brand-orange-bright active:scale-95"
          >
            INSCRÍBETE
          </a>
        </nav>
      )}
    </header>
  );
}
