import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { siteConfig } from '@/config/site';
import { event, eventName } from '@/content';
import { SurveyForm } from '@/features/experience-survey/SurveyForm';
import { supabaseConfig } from '@/lib/supabase/config';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Encuesta de experiencia',
  description: 'Cuéntanos cómo viviste Corre y Libérate 2026 y qué mejorar para 2027.',
};

export const revalidate = 300;

export default function EncuestaPage() {
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
          <p className="text-sm font-athletic-bold text-orange-300">{eventName}</p>
          <h1 className="mt-2 font-athletic text-3xl leading-tight sm:text-5xl">
            Encuesta de experiencia
          </h1>
        </header>
        {available ? (
          <SurveyForm />
        ) : (
          <p className="rounded-2xl bg-white p-6 text-neutral-800">
            La encuesta no está disponible en este momento.{' '}
            <a href={siteConfig.links.whatsapp} className="font-semibold text-orange-800 underline">
              Cuéntanos por WhatsApp
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
