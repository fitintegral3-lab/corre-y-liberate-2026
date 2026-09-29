'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { formatCop } from '@/lib/format';

import type { AdminRegistration, PaymentStatus } from '@/lib/admin/registrations';

interface Props {
  slug: string;
  registrations: AdminRegistration[];
}

const STATUS_STYLE: Record<PaymentStatus, string> = {
  pendiente: 'bg-amber-100 text-amber-800',
  aprobado: 'bg-green-100 text-green-800',
  rechazado: 'bg-red-100 text-red-800',
};

const SHEET_NOTE = {
  updated: 'Hoja actualizada.',
  missing: 'No está en la hoja (inscripción anterior a la copia a Drive).',
  error: 'No se pudo actualizar la hoja: revísala a mano.',
  off: '',
} as const;

/** Lista de inscripciones con su comprobante y los botones para aprobar o rechazar. */
export function AdminRegistrations({ slug, registrations }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  async function decide(registration: AdminRegistration, status: PaymentStatus) {
    const verb =
      status === 'aprobado'
        ? 'APROBAR'
        : status === 'rechazado'
          ? 'RECHAZAR'
          : 'devolver a pendiente';
    const name = `${registration.firstName} ${registration.lastName}`;
    if (!window.confirm(`¿${verb} el pago de ${name} por ${formatCop(registration.total)}?`))
      return;

    setBusy(registration.id);
    try {
      // Con el origen explicito: si la pagina se abrio con usuario y contrasena
      // en la direccion (usuario:clave@sitio), una ruta relativa hereda esas
      // credenciales y el navegador se niega a hacer la peticion.
      const response = await fetch(`${window.location.origin}/p/${slug}/pago`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: registration.id, status }),
      });
      const body = (await response.json().catch(() => ({ ok: false }))) as
        { ok: true; sheet: keyof typeof SHEET_NOTE } | { ok: false };
      setNotes((current) => ({
        ...current,
        [registration.id]: body.ok
          ? `Listo: ${status}. ${SHEET_NOTE[body.sheet]}`
          : 'No se pudo guardar. Intenta de nuevo.',
      }));
      if (body.ok) router.refresh();
    } finally {
      setBusy(null);
    }
  }

  if (registrations.length === 0) {
    return (
      <p className="rounded-2xl bg-white p-8 text-center text-neutral-600 shadow-sm">
        No hay inscripciones aquí.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {registrations.map((registration) => {
        const receipt = `/p/${slug}/comprobante?path=${encodeURIComponent(registration.receiptPath)}`;
        const isPdf = registration.receiptPath.endsWith('.pdf');
        return (
          <li
            key={registration.id}
            className="grid gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:grid-cols-[200px_1fr]"
          >
            <a href={receipt} target="_blank" rel="noopener noreferrer" className="block">
              {isPdf ? (
                <span className="flex h-40 items-center justify-center rounded-xl bg-neutral-100 text-sm font-semibold text-neutral-600">
                  Ver PDF
                </span>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- ruta protegida por credenciales: next/image no puede optimizarla
                <img
                  src={receipt}
                  alt={`Comprobante de ${registration.firstName}`}
                  className="h-40 w-full rounded-xl bg-neutral-100 object-contain"
                  loading="lazy"
                />
              )}
            </a>

            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-athletic-bold text-lg text-neutral-950">
                  {registration.firstName} {registration.lastName}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${STATUS_STYLE[registration.paymentStatus]}`}
                >
                  {registration.paymentStatus}
                </span>
              </div>
              <p className="text-neutral-700">
                {registration.category} · Cédula {registration.cedula} · {registration.phone} ·{' '}
                {registration.email}
              </p>
              <p className="text-base">
                Debe pagar <strong>{formatCop(registration.total)}</strong>
                {registration.referralCode && (
                  <span className="text-neutral-500">
                    {' '}
                    (precio {formatCop(registration.basePrice)}, código {registration.referralCode})
                  </span>
                )}
              </p>
              <p className="text-xs text-neutral-500">
                Inscrito el{' '}
                {new Date(registration.createdAt).toLocaleString('es-CO', {
                  timeZone: 'America/Bogota',
                })}
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {registration.paymentStatus !== 'aprobado' && (
                  <button
                    type="button"
                    disabled={busy === registration.id}
                    onClick={() => void decide(registration, 'aprobado')}
                    className="cursor-pointer rounded-full bg-green-600 px-5 py-2 text-xs font-bold tracking-wider text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    APROBAR
                  </button>
                )}
                {registration.paymentStatus !== 'rechazado' && (
                  <button
                    type="button"
                    disabled={busy === registration.id}
                    onClick={() => void decide(registration, 'rechazado')}
                    className="cursor-pointer rounded-full bg-red-600 px-5 py-2 text-xs font-bold tracking-wider text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    RECHAZAR
                  </button>
                )}
                {registration.paymentStatus !== 'pendiente' && (
                  <button
                    type="button"
                    disabled={busy === registration.id}
                    onClick={() => void decide(registration, 'pendiente')}
                    className="cursor-pointer rounded-full px-5 py-2 text-xs font-bold tracking-wider text-neutral-700 ring-1 ring-neutral-300 hover:bg-neutral-100 disabled:opacity-50"
                  >
                    DEVOLVER A PENDIENTE
                  </button>
                )}
              </div>
              {notes[registration.id] && (
                <p className="text-xs font-semibold text-neutral-700">{notes[registration.id]}</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
