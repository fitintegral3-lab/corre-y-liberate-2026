import { ArrowUpRight, Camera, HeartHandshake, MessageSquareHeart, Trophy } from 'lucide-react';
import Image from 'next/image';

import { InstagramIcon, WhatsAppIcon } from '@/components/ui/icons/SocialIcons';
import { siteConfig } from '@/config/site';
import { event, offSeason } from '@/content';

import type { LucideIcon } from 'lucide-react';

const icons: Record<(typeof offSeason.links)[number]['id'], LucideIcon> = {
  resultados: Trophy,
  encuesta: MessageSquareHeart,
  fotos: Camera,
  sumate: HeartHandshake,
};

const isExternal = (href: string) => /^https?:\/\//.test(href);

export function OffSeasonHome() {
  return (
    <main
      className="relative min-h-screen bg-ink bg-cover bg-[position:25%_center] px-4 py-10 text-white sm:py-16 lg:bg-center"
      style={{ backgroundImage: "url('/backgrounds/bg_hero.webp')" }}
    >
      {/* Contraste para que el texto y las tarjetas se lean sobre la fotografía. */}
      <div aria-hidden="true" className="absolute inset-0 bg-black/75" />

      <div className="relative mx-auto max-w-xl">
        <header className="text-center">
          <Image
            src="/logos/corre-y-liberate-white.png"
            alt={event.name}
            width={120}
            height={115}
            className="mx-auto"
            priority
          />
          <p className="mt-6 font-athletic-bold text-sm tracking-wider text-orange-300 uppercase">
            {offSeason.eyebrow}
          </p>
          <h1 className="mt-2 font-athletic text-4xl leading-tight sm:text-6xl">
            {offSeason.title}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-neutral-200">{offSeason.intro}</p>
        </header>

        <ul className="mt-10 space-y-4">
          {offSeason.links.map((link) => {
            const Icon = icons[link.id];
            return (
              <li key={link.id}>
                <a
                  href={link.href}
                  {...(isExternal(link.href) && { target: '_blank', rel: 'noopener noreferrer' })}
                  className="group flex items-center gap-4 rounded-3xl bg-white p-5 text-ink shadow-xl shadow-black/30 transition hover:-translate-y-0.5 hover:shadow-orange-950/40"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-50 text-brand-orange">
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-athletic text-2xl leading-tight">{link.title}</span>
                    <span className="mt-1 block text-sm text-neutral-700">{link.description}</span>
                  </span>
                  <ArrowUpRight
                    size={22}
                    aria-hidden="true"
                    className="shrink-0 text-brand-orange transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
              </li>
            );
          })}
        </ul>

        <footer className="mt-12 space-y-4 text-center text-sm text-neutral-300">
          <div className="flex justify-center gap-3">
            <a
              href={siteConfig.links.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de Corre y Libérate"
              className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white transition hover:bg-brand-orange"
            >
              <InstagramIcon className="h-6 w-6 fill-current" />
            </a>
            <a
              href={siteConfig.links.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp de Corre y Libérate"
              className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white transition hover:bg-brand-orange"
            >
              <WhatsAppIcon className="h-6 w-6 fill-current" />
            </a>
          </div>
          <p>{event.claim}.</p>
        </footer>
      </div>
    </main>
  );
}
