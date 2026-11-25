import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { InstagramIcon } from '@/components/ui/icons/SocialIcons';
import { siteConfig } from '@/config/site';
import { event, supportPage } from '@/content';
import { SupportLinks } from '@/features/support/SupportLinks';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Súmate',
  description: 'Patrocina, dona o sé aliado de Corre y Libérate. Escríbenos por WhatsApp y súmate.',
};

export default function SumatePage() {
  return (
    <main className="min-h-screen bg-ink px-4 py-8 text-white sm:py-12">
      <div className="mx-auto max-w-md">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 font-athletic-bold text-sm text-neutral-300 hover:text-white"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Ir a la web
        </Link>

        <header className="mt-4 mb-8 text-center">
          <Image
            src="/logos/corre-y-liberate-white.png"
            alt="Corre y Libérate"
            width={96}
            height={92}
            className="mx-auto"
            priority
          />
          <h1 className="mt-4 font-athletic text-4xl leading-tight">{supportPage.title}</h1>
          <p className="mt-2 text-neutral-300">{supportPage.intro}</p>
        </header>

        <SupportLinks whatsappUrl={siteConfig.links.whatsapp} />

        <footer className="mt-10 space-y-3 text-center text-sm text-neutral-400">
          <a
            href={siteConfig.links.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 font-semibold text-neutral-200 hover:text-white"
          >
            <InstagramIcon className="h-5 w-5 fill-current" />
            @correyliberate
          </a>
          <p>{event.claim}.</p>
        </footer>
      </div>
    </main>
  );
}
