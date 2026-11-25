import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { siteConfig } from '@/config/site';
import { entrepreneurFair } from '@/content/entrepreneur-fair';
import { event, eventName } from '@/content';
import { FairForm } from '@/features/entrepreneur-fair/FairForm';
import { supabaseConfig } from '@/lib/supabase/config';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feria Empresarial',
  description:
    'Formato de caracterización de emprendedoras de la Feria Empresarial de Corre y Libérate 2026.',
};

export const revalidate = 300;

export default function FeriaEmpresarialPage() {
  const available = Boolean(supabaseConfig());

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 font-athletic-bold text-sm text-neutral-700 hover:text-orange-800"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Volver al inicio
        </Link>
        <header className="my-6 rounded-3xl border-l-4 border-brand-orange bg-ink px-5 py-7 text-white sm:px-9 sm:py-9">
          <p className="text-sm font-athletic-bold text-orange-300">
            Feria Empresarial · {eventName}
          </p>
          <h1 className="mt-2 font-athletic text-3xl leading-tight sm:text-5xl">
            Formato de caracterización de emprendedoras
          </h1>
        </header>
        {!entrepreneurFair.open ? (
          <p role="status" className="rounded-2xl bg-white p-6 text-neutral-800">
            {entrepreneurFair.closedMessage}
          </p>
        ) : available ? (
          <FairForm contactUrl={siteConfig.links.whatsapp} />
        ) : (
          <p className="rounded-2xl bg-white p-6 text-neutral-800">
            El formulario no está disponible en este momento.{' '}
            <a href={siteConfig.links.whatsapp} className="font-semibold text-orange-800 underline">
              Escríbenos por WhatsApp
            </a>
            .
          </p>
        )}
        <footer className="mt-8 border-t border-neutral-200 pt-4 text-sm text-neutral-600">
          <p className="font-semibold">{eventName}</p>
          <p>{event.claim}.</p>
        </footer>
      </div>
    </main>
  );
}
