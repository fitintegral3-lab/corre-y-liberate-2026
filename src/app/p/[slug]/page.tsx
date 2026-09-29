import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Container } from '@/components/ui';
import { AdminRegistrations } from '@/features/admin/AdminRegistrations';
import { adminAllowed } from '@/lib/admin/auth';
import { listRegistrations, PAYMENT_STATUSES, type PaymentStatus } from '@/lib/admin/registrations';
import { supabaseConfig } from '@/lib/supabase/config';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pagos',
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const FILTERS: Array<PaymentStatus | 'todos'> = [...PAYMENT_STATUSES, 'todos'];

/** Revision de pagos: ver el comprobante y aprobar o rechazar. */
export default async function AdminPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  if (!adminAllowed(slug, (await headers()).get('authorization'))) notFound();

  const config = supabaseConfig();
  if (!config) notFound();

  const raw = (await searchParams).estado;
  const status = FILTERS.includes(raw as PaymentStatus)
    ? (raw as PaymentStatus | 'todos')
    : 'pendiente';
  const registrations = await listRegistrations(config, status);

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10 sm:px-8">
      <Container className="space-y-6">
        <div>
          <p className="font-athletic-bold text-xs tracking-widest text-brand-orange">
            ADMINISTRACIÓN
          </p>
          <h1 className="font-athletic text-4xl text-neutral-950">REVISIÓN DE PAGOS</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Compara el valor del comprobante con el que debía pagar. Al aprobar o rechazar, se
            actualiza la hoja de Drive y el corredor recibe un correo.
          </p>
        </div>

        <nav className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <Link
              key={filter}
              href={`/p/${slug}?estado=${filter}`}
              className={`rounded-full px-4 py-2 text-xs font-bold tracking-wider uppercase ${
                filter === status
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white text-neutral-700 ring-1 ring-neutral-200'
              }`}
            >
              {filter}
            </Link>
          ))}
        </nav>

        <AdminRegistrations slug={slug} registrations={registrations} />
      </Container>
    </main>
  );
}
