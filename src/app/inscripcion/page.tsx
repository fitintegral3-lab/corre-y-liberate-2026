import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Container } from '@/components/ui';
import { distances, homeAnchor, registrationErrors, registrationFormCopy } from '@/content';
import { RegistrationForm } from '@/features/registration-form/RegistrationForm';
import { quote } from '@/lib/registration/service';
import { supabaseConfig } from '@/lib/supabase/config';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inscripción',
  description:
    'Inscríbete a Corre y Libérate 2026: elige tu distancia, paga con QR y sube tu comprobante.',
};

/** La preventa vigente y sus QR cambian con el calendario. */
export const revalidate = 3600;

/**
 * Inscripcion propia, con los mismos campos que el formulario de
 * cronometraje. Sin Supabase configurado responde 404: un formulario que no
 * puede guardar es peor que no tenerlo.
 */
export default function InscripcionPage() {
  const config = supabaseConfig();
  if (!config) notFound();

  // Si no se puede cobrar la distancia mas barata, no se puede cobrar ninguna:
  // inscripciones cerradas o sin QR para la preventa vigente.
  const probe = quote(distances[0].id, null);
  const blocked = probe.ok ? null : probe.reason === 'invalid' ? 'unavailable' : probe.reason;

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10 sm:px-8 sm:py-16">
      <Container className="space-y-10">
        <Link
          href={`/${homeAnchor}`}
          className="inline-flex items-center gap-2 font-athletic-bold text-xs tracking-wider text-neutral-600 transition-colors hover:text-brand-orange"
        >
          <ArrowLeft size={16} aria-hidden="true" className="stroke-[3]" />
          VOLVER AL INICIO
        </Link>

        <div className="text-center">
          <span className="block font-athletic-bold text-xs tracking-widest text-brand-orange sm:text-sm">
            {registrationFormCopy.eyebrow}
          </span>
          <h1 className="mt-1 font-athletic text-4xl text-neutral-950 sm:text-6xl">
            {registrationFormCopy.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium text-neutral-600 sm:text-base">
            {registrationFormCopy.intro}
          </p>
        </div>

        {blocked ? (
          <p className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center font-semibold text-neutral-700 shadow-sm">
            {registrationErrors[blocked]}
          </p>
        ) : (
          <RegistrationForm
            // Aca van por kilometros (3K, 5K, 7K, 10K): en un selector el
            // 3K al final se lee raro. El resto del sitio respeta el orden
            // editorial de `distances.ts`.
            distances={[...distances]
              .sort((a, b) => a.kilometers - b.kilometers)
              .map((distance) => ({
                id: distance.id,
                label: distance.label,
                description: distance.description,
              }))}
            supabaseUrl={config.url}
            supabasePublishableKey={config.publishableKey}
          />
        )}
      </Container>
    </main>
  );
}
