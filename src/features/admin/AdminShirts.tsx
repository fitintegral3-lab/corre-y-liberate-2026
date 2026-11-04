'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { SHIRT_SIZES } from '@/domain/registration/schema';

import type { AdminRegistration } from '@/lib/admin/registrations';
import type { ShirtReservationSlot } from '@/lib/admin/shirts';
import type { ShirtStock } from '@/lib/registration/shirt-inventory';

const inputClass =
  'rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 disabled:bg-neutral-100 disabled:text-neutral-500';
const buttonClass =
  'cursor-pointer rounded-full bg-neutral-900 px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40';
const reasons: Record<string, string> = {
  'shirt-sold-out': 'No quedan camisetas de esa talla. No se guardó el cambio.',
  'already-registered':
    'Esa persona ya está inscrita o esta reserva ya fue utilizada. No se puede reasignar.',
  'duplicate-cedula': 'Esta cédula ya tiene otra reserva. Revisa las filas antes de asignarla.',
  conflict:
    'Otro administrador cambió este registro o su pago ya no está pendiente. Se actualizó el panel; revisa antes de intentar de nuevo.',
  invalid: 'Revisa la cédula y la talla.',
};

async function save(
  slug: string,
  payload: object,
): Promise<{ ok: boolean; reason?: string; sheet?: string }> {
  const response = await fetch(`${window.location.origin}/p/${slug}/camisetas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json();
}

export function AdminPendingShirt({
  slug,
  registration,
  stock,
}: {
  slug: string;
  registration: AdminRegistration;
  stock: ShirtStock[];
}) {
  const router = useRouter();
  const [size, setSize] = useState(registration.shirtSize);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setNote('');
    try {
      const result = await save(slug, {
        action: 'registration',
        id: registration.id,
        previousSize: registration.shirtSize,
        shirtSize: size,
      });
      setNote(
        result.ok
          ? `Talla guardada.${result.sheet === 'error' ? ' No se pudo actualizar la hoja: revísala a mano.' : result.sheet === 'missing' ? ' La inscripción no está en la hoja.' : result.sheet === 'updated' ? ' Hoja actualizada.' : ''}`
          : (reasons[result.reason ?? ''] ?? 'No se pudo guardar. Intenta de nuevo.'),
      );
      if (result.ok || result.reason === 'conflict') router.refresh();
    } catch {
      setNote('No se pudo guardar. Revisa tu conexión e intenta de nuevo.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-2 rounded-xl bg-neutral-50 p-3">
      <label htmlFor={`shirt-${registration.id}`} className="block font-semibold">
        Cambiar talla antes de aprobar
      </label>
      <div className="flex flex-wrap gap-2">
        <select
          id={`shirt-${registration.id}`}
          className={inputClass}
          value={size}
          onChange={(event) => setSize(event.target.value)}
          disabled={busy}
        >
          {SHIRT_SIZES.map((item) => {
            const available =
              stock.find((row) => row.gender === registration.gender && row.shirtSize === item)
                ?.available ?? 0;
            return (
              <option
                key={item}
                value={item}
                disabled={item !== registration.shirtSize && available === 0}
              >
                {item}
                {item === registration.shirtSize
                  ? ' · Actual'
                  : available === 0
                    ? ' · Agotada'
                    : ` · ${available} disponibles`}
              </option>
            );
          })}
        </select>
        <button
          className={buttonClass}
          type="submit"
          disabled={busy || size === registration.shirtSize}
        >
          {busy ? 'GUARDANDO…' : 'GUARDAR TALLA'}
        </button>
      </div>
      <p className="text-xs text-neutral-600">
        El cambio devuelve la talla anterior y reserva la nueva. Si usaba una reserva externa,
        elegir otra talla consume stock disponible.
      </p>
      {note && (
        <p role="status" className="text-sm font-semibold">
          {note}
        </p>
      )}
    </form>
  );
}

function ReservationRow({
  slug,
  slot,
  index,
}: {
  slug: string;
  slot: ShirtReservationSlot;
  index: number;
}) {
  const router = useRouter();
  const [cedula, setCedula] = useState(slot.cedula ?? '');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  async function assign(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setNote('');
    try {
      const result = await save(slug, {
        action: 'reservation',
        id: slot.id,
        previousCedula: slot.cedula,
        cedula: cedula.trim() || null,
      });
      setNote(
        result.ok
          ? cedula.trim()
            ? 'Reserva asignada. Esta persona ya puede inscribirse con esta camiseta.'
            : 'Asignación retirada. La camiseta sigue reservada.'
          : (reasons[result.reason ?? ''] ?? 'No se pudo guardar. Intenta de nuevo.'),
      );
      if (result.ok || result.reason === 'conflict') router.refresh();
    } catch {
      setNote('No se pudo guardar. Revisa tu conexión e intenta de nuevo.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <li className="rounded-xl border border-neutral-200 p-4">
      <form onSubmit={assign} className="space-y-3">
        <p className="font-semibold">
          <span className="capitalize">{slot.gender}</span> · {slot.shirtSize} · Reserva {index + 1}
        </p>
        <label htmlFor={`reservation-${slot.id}`} className="block text-sm font-medium">
          Cédula de la persona
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            id={`reservation-${slot.id}`}
            className={`${inputClass} min-w-0 flex-1`}
            inputMode="numeric"
            autoComplete="off"
            maxLength={30}
            value={cedula}
            disabled={busy || slot.registered}
            onChange={(event) => setCedula(event.target.value)}
          />
          <button
            type="submit"
            className={buttonClass}
            disabled={busy || slot.registered || cedula === (slot.cedula ?? '')}
          >
            {slot.registered
              ? 'YA INSCRITA'
              : busy
                ? 'GUARDANDO…'
                : cedula.trim() || !slot.cedula
                  ? 'ASIGNAR CÉDULA'
                  : 'RETIRAR CÉDULA'}
          </button>
        </div>
        {note && (
          <p role="status" className="text-sm font-semibold">
            {note}
          </p>
        )}
      </form>
    </li>
  );
}

export function AdminShirtReservations({
  slug,
  slots,
}: {
  slug: string;
  slots: ShirtReservationSlot[];
}) {
  return (
    <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="font-athletic text-2xl">ASIGNAR CAMISETAS RESERVADAS</h2>
      <p className="text-sm text-neutral-600">
        Elige una fila del género y talla reservados y escribe la cédula de la persona que aún no se
        ha inscrito. Cuando se inscriba con esa camiseta, usará su reserva sin descontar otra vez
        los disponibles. La distribución de las 20 reservas se conserva.
      </p>
      <ul className="grid gap-3 lg:grid-cols-2">
        {[...slots]
          .sort(
            (a, b) =>
              a.gender.localeCompare(b.gender) ||
              SHIRT_SIZES.indexOf(a.shirtSize) - SHIRT_SIZES.indexOf(b.shirtSize) ||
              a.id.localeCompare(b.id),
          )
          .map((slot, index) => (
            <ReservationRow
              key={`${slot.id}:${slot.cedula}:${slot.registered}`}
              slug={slug}
              slot={slot}
              index={index}
            />
          ))}
      </ul>
    </section>
  );
}
