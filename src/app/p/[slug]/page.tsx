import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { after } from 'next/server';

import { Container } from '@/components/ui';
import { AdminRegistrations } from '@/features/admin/AdminRegistrations';
import { adminAllowed } from '@/lib/admin/auth';
import { listRegistrations, PAYMENT_STATUSES, type PaymentStatus } from '@/lib/admin/registrations';
import { supabaseConfig } from '@/lib/supabase/config';
import { listShirtStock, shirtReservationSummary } from '@/lib/registration/shirt-inventory';
import { SHIRT_SIZES } from '@/domain/registration/schema';
import { emailConfig } from '@/lib/email/config';
import { tryShirtStockAlerts } from '@/lib/email/shirt-stock';

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
  const stock = await listShirtStock(config);
  const holds = await shirtReservationSummary(config);
  const mail = emailConfig();
  if (mail) after(() => tryShirtStockAlerts(config, mail));

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

        <section className="overflow-x-auto rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-athletic text-2xl">INVENTARIO DE CAMISETAS</h2>
          <p className="mt-2 text-sm text-neutral-600">
            El saldo inicial corresponde a los valores verdes: 100 de mujer y 52 de hombre. Las
            reservas externas se asignan por cédula y se inscriben sin descontar ese saldo.
          </p>
          <table className="mt-4 w-full text-left text-sm">
            <thead>
              <tr>
                <th className="p-2">Género</th>
                <th className="p-2">Talla</th>
                <th className="p-2">Base contable</th>
                <th className="p-2">Inscritas del stock</th>
                <th className="p-2">Disponibles</th>
                <th className="p-2">Reservas externas</th>
              </tr>
            </thead>
            <tbody>
              {['femenino', 'masculino'].flatMap((gender) =>
                SHIRT_SIZES.map((size) => {
                  const item = stock.find((row) => row.gender === gender && row.shirtSize === size);
                  return item ? (
                    <tr key={`${gender}-${size}`} className="border-t border-neutral-100">
                      <td className="p-2 capitalize">{gender}</td>
                      <td className="p-2">{size}</td>
                      <td className="p-2">{item.total}</td>
                      <td className="p-2">{item.reserved}</td>
                      <td
                        className={`p-2 font-semibold ${item.available === 0 ? 'text-red-700' : ''}`}
                      >
                        {item.available === 0 ? 'Agotada' : item.available}
                        {item.reserved > item.total
                          ? ` · Faltan ${item.reserved - item.total}`
                          : ''}
                      </td>
                      <td className="p-2">
                        {
                          holds.filter((hold) => hold.gender === gender && hold.shirtSize === size)
                            .length
                        }{' '}
                        (
                        {
                          holds.filter(
                            (hold) =>
                              hold.gender === gender && hold.shirtSize === size && hold.assigned,
                          ).length
                        }{' '}
                        con cédula)
                      </td>
                    </tr>
                  ) : null;
                }),
              )}
            </tbody>
          </table>
          {holds.some((hold) => !hold.assigned) && (
            <p className="mt-3 text-sm text-amber-800">
              Faltan las cédulas de {holds.filter((hold) => !hold.assigned).length} reservas.
              Asígnalas antes de que esas personas se inscriban para evitar un descuento adicional.
            </p>
          )}
        </section>

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
