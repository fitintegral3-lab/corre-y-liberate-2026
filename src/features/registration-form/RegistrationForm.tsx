'use client';

import { createClient } from '@supabase/supabase-js';
import { CheckCircle2 } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';

import {
  registrationErrors,
  registrationFormCopy,
  terms,
  type RegistrationErrorReason,
} from '@/content';
import { BLOOD_TYPES, SHIRT_SIZES } from '@/domain/registration/schema';
import { formatCop } from '@/lib/format';

import { QrPayment } from './QrPayment';

export interface DistanceOption {
  id: string;
  label: string;
  description: string;
}

interface Quote {
  distanceId: string;
  code: string | null;
  basePrice: number;
  discount: number;
  total: number;
  qrImage: string;
}

interface RegistrationFormProps {
  distances: readonly DistanceOption[];
  supabaseUrl: string;
  supabasePublishableKey: string;
}

const inputClass =
  'w-full rounded-xl border-2 border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-brand-orange focus:outline-none aria-invalid:border-red-500';
const labelClass = 'block text-sm font-semibold text-neutral-800';
const choiceClass =
  'flex cursor-pointer items-center justify-center rounded-xl border-2 border-neutral-200 px-3 py-3 text-sm font-semibold text-neutral-700 transition-colors has-checked:border-brand-orange has-checked:bg-orange-50 has-checked:text-neutral-950 has-focus-visible:outline-3';

function isReason(value: unknown): value is RegistrationErrorReason {
  return typeof value === 'string' && value in registrationErrors;
}

/**
 * Formulario de inscripcion, con los mismos campos que el de cronometraje.
 *
 * Tres llamadas al servidor y ninguna decide nada en el navegador: el precio y
 * el QR los devuelve `/api/inscripcion/precio`, el comprobante se sube con una
 * URL que firma `/api/inscripcion/comprobante`, y `/api/inscripcion` vuelve a
 * validar todo antes de guardar. Solo viaja el codigo ya aplicado, para que
 * nadie pague un monto distinto del QR que vio.
 */
export function RegistrationForm({
  distances,
  supabaseUrl,
  supabasePublishableKey,
}: RegistrationFormProps) {
  const [distanceId, setDistanceId] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState<RegistrationErrorReason | null>(null);
  const [hasIllness, setHasIllness] = useState<'SI' | 'NO' | ''>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<RegistrationErrorReason | null>(null);
  const [sending, setSending] = useState(false);
  const [uploaded, setUploaded] = useState<{ file: File; path: string } | null>(null);
  const [done, setDone] = useState<{ total: number; category: string } | null>(null);

  async function loadQuote(nextDistance: string, code: string | null) {
    setQuoteError(null);
    const params = new URLSearchParams({ distance: nextDistance, code: code ?? '' });
    try {
      const response = await fetch(`/api/inscripcion/precio?${params}`);
      const body = (await response.json()) as
        | {
            ok: true;
            code: string | null;
            basePrice: number;
            discount: number;
            total: number;
            qrImage: string;
          }
        | { ok: false; reason: string };
      if (body.ok) {
        setQuote({
          distanceId: nextDistance,
          code: body.code,
          basePrice: body.basePrice,
          discount: body.discount,
          total: body.total,
          qrImage: body.qrImage,
        });
      } else {
        // Un codigo invalido no borra el precio: se vuelve al precio lleno.
        if (code) await loadQuote(nextDistance, null);
        setQuoteError(isReason(body.reason) ? body.reason : 'unavailable');
      }
    } catch {
      setQuoteError('unavailable');
    }
  }

  function chooseDistance(next: string) {
    setDistanceId(next);
    void loadQuote(next, quote?.code ?? null);
  }

  async function uploadReceipt(file: File): Promise<string> {
    if (uploaded?.file === file) return uploaded.path;
    const signed = await fetch('/api/inscripcion/comprobante', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType: file.type, size: file.size }),
    });
    const body = (await signed.json()) as
      { ok: true; path: string; token: string } | { ok: false; reason: string };
    if (!body.ok) throw new Error(isReason(body.reason) ? body.reason : 'unavailable');

    const supabase = createClient(supabaseUrl, supabasePublishableKey, {
      auth: { persistSession: false },
    });
    const { error } = await supabase.storage
      .from('comprobantes')
      .uploadToSignedUrl(body.path, body.token, file, { contentType: file.type });
    if (error) throw new Error('receipt-invalid');
    setUploaded({ file, path: body.path });
    return body.path;
  }

  async function send(payload: object) {
    const response = await fetch('/api/inscripcion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return (await response.json()) as
      | { ok: true; total: number; category: string }
      | { ok: false; reason: string; fields?: Record<string, string> };
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    const form = new FormData(event.currentTarget);
    const file = form.get('receipt');
    const hasFile = file instanceof File && file.size > 0;
    const fields = {
      email: form.get('email'),
      firstName: form.get('firstName'),
      lastName: form.get('lastName'),
      city: form.get('city'),
      gender: form.get('gender'),
      distanceId: form.get('distanceId'),
      birthDate: form.get('birthDate'),
      shirtSize: form.get('shirtSize'),
      cedula: form.get('cedula'),
      phone: form.get('phone'),
      eps: form.get('eps'),
      bloodType: form.get('bloodType'),
      team: form.get('team'),
      emergencyName: form.get('emergencyName'),
      emergencyPhone: form.get('emergencyPhone'),
      recentCompetition: form.get('recentCompetition'),
      hasIllness: form.get('hasIllness'),
      medicalCondition: form.get('medicalCondition'),
      observation: form.get('observation'),
      referralCode: quote?.code ?? '',
      acceptedTerms: form.get('acceptedTerms') === 'on',
    };

    setSending(true);
    try {
      // Primero se valida todo sin comprobante: el servidor devuelve todos los
      // errores juntos y no guarda nada, porque sin ruta de comprobante el
      // formulario nunca es valido. Recien con el resto en orden se sube el
      // archivo, asi no quedan comprobantes de formularios rechazados.
      const check = await send({ ...fields, receiptPath: '' });
      const otherErrors = !check.ok
        ? Object.keys(check.fields ?? {}).filter((key) => key !== 'receiptPath')
        : [];
      if (!check.ok && (check.reason !== 'invalid' || otherErrors.length > 0 || !hasFile)) {
        setFieldErrors(check.fields ?? {});
        setFormError(isReason(check.reason) ? check.reason : 'unavailable');
        return;
      }

      const receiptPath = await uploadReceipt(file as File);
      const body = await send({ ...fields, receiptPath });
      if (body.ok) {
        setDone({ total: body.total, category: body.category });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setFieldErrors(body.fields ?? {});
        setFormError(isReason(body.reason) ? body.reason : 'unavailable');
      }
    } catch (error) {
      const reason = (error as Error).message;
      setFormError(isReason(reason) ? reason : 'unavailable');
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" aria-hidden="true" />
        <h2 className="mt-4 font-athletic text-3xl text-neutral-950">
          {registrationFormCopy.success.title}
        </h2>
        <p className="mt-2 text-sm font-semibold text-neutral-700">
          {done.category} · {formatCop(done.total)}
        </p>
        <p className="mt-4 text-sm text-neutral-600">{registrationFormCopy.success.body}</p>
      </div>
    );
  }

  const error = (name: string) => fieldErrors[name];

  return (
    <form onSubmit={onSubmit} noValidate className="mx-auto max-w-3xl space-y-8">
      <Section title={registrationFormCopy.sections.race}>
        <Field label="Carrera *" error={error('distanceId')} as="fieldset">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {distances.map((distance) => (
              <label key={distance.id} className={`${choiceClass} flex-col py-4`}>
                <input
                  type="radio"
                  name="distanceId"
                  value={distance.id}
                  checked={distanceId === distance.id}
                  onChange={() => chooseDistance(distance.id)}
                  className="sr-only"
                />
                <span className="font-athletic text-3xl leading-none text-neutral-950">
                  {distance.label}
                </span>
                <span className="mt-1 text-center text-[11px] font-medium text-neutral-500">
                  {distance.description}
                </span>
              </label>
            ))}
          </div>
        </Field>
        <Field label="Género *" error={error('gender')} as="fieldset">
          <div className="grid grid-cols-2 gap-3">
            <label className={choiceClass}>
              <input type="radio" name="gender" value="femenino" className="sr-only" />
              Femenino
            </label>
            <label className={choiceClass}>
              <input type="radio" name="gender" value="masculino" className="sr-only" />
              Masculino
            </label>
          </div>
        </Field>
        <Field label="Talla de camiseta *" error={error('shirtSize')} htmlFor="shirtSize">
          <select
            id="shirtSize"
            name="shirtSize"
            defaultValue=""
            className={inputClass}
            aria-invalid={Boolean(error('shirtSize'))}
          >
            <option value="" disabled>
              Elige una talla
            </option>
            {SHIRT_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Equipo o club" error={error('team')} htmlFor="team">
          <input id="team" name="team" className={inputClass} autoComplete="organization" />
        </Field>
      </Section>

      <Section title={registrationFormCopy.sections.personal}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre/s *" error={error('firstName')} htmlFor="firstName">
            <input
              id="firstName"
              name="firstName"
              className={inputClass}
              autoComplete="given-name"
              aria-invalid={Boolean(error('firstName'))}
            />
          </Field>
          <Field label="Apellido/s *" error={error('lastName')} htmlFor="lastName">
            <input
              id="lastName"
              name="lastName"
              className={inputClass}
              autoComplete="family-name"
              aria-invalid={Boolean(error('lastName'))}
            />
          </Field>
          <Field label="Correo electrónico *" error={error('email')} htmlFor="email">
            <input
              id="email"
              name="email"
              type="email"
              className={inputClass}
              autoComplete="email"
              aria-invalid={Boolean(error('email'))}
            />
          </Field>
          <Field label="Celular *" error={error('phone')} htmlFor="phone">
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              placeholder="3001234567"
              className={inputClass}
              autoComplete="tel-national"
              aria-invalid={Boolean(error('phone'))}
            />
          </Field>
          <Field
            label="Cédula *"
            hint="Una inscripción por cédula"
            error={error('cedula')}
            htmlFor="cedula"
          >
            <input
              id="cedula"
              name="cedula"
              inputMode="numeric"
              className={inputClass}
              aria-invalid={Boolean(error('cedula'))}
            />
          </Field>
          <Field label="Fecha de nacimiento *" error={error('birthDate')} htmlFor="birthDate">
            <input
              id="birthDate"
              name="birthDate"
              type="date"
              className={inputClass}
              autoComplete="bday"
              aria-invalid={Boolean(error('birthDate'))}
            />
          </Field>
          <Field label="Ciudad" error={error('city')} htmlFor="city">
            <input id="city" name="city" className={inputClass} autoComplete="address-level2" />
          </Field>
        </div>
      </Section>

      <Section title={registrationFormCopy.sections.health}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="EPS o seguro de salud *" error={error('eps')} htmlFor="eps">
            <input
              id="eps"
              name="eps"
              className={inputClass}
              aria-invalid={Boolean(error('eps'))}
            />
          </Field>
          <Field label="Grupo sanguíneo (RH) *" error={error('bloodType')} htmlFor="bloodType">
            <select
              id="bloodType"
              name="bloodType"
              defaultValue=""
              className={inputClass}
              aria-invalid={Boolean(error('bloodType'))}
            >
              <option value="" disabled>
                Elige una opción
              </option>
              {BLOOD_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Nombre del contacto de emergencia *"
            error={error('emergencyName')}
            htmlFor="emergencyName"
          >
            <input
              id="emergencyName"
              name="emergencyName"
              className={inputClass}
              aria-invalid={Boolean(error('emergencyName'))}
            />
          </Field>
          <Field
            label="Celular del contacto de emergencia *"
            error={error('emergencyPhone')}
            htmlFor="emergencyPhone"
          >
            <input
              id="emergencyPhone"
              name="emergencyPhone"
              type="tel"
              inputMode="tel"
              className={inputClass}
              aria-invalid={Boolean(error('emergencyPhone'))}
            />
          </Field>
        </div>
        <YesNo
          name="recentCompetition"
          label="¿Participaste en una competencia últimamente? *"
          error={error('recentCompetition')}
        />
        <YesNo
          name="hasIllness"
          label="¿Te encuentras padeciendo alguna enfermedad? *"
          error={error('hasIllness')}
          onChange={(value) => setHasIllness(value)}
        />
        {hasIllness === 'SI' && (
          <Field
            label="¿Cuál? Cuéntanos qué debemos tener en cuenta *"
            error={error('medicalCondition')}
            htmlFor="medicalCondition"
          >
            <input
              id="medicalCondition"
              name="medicalCondition"
              className={inputClass}
              aria-invalid={Boolean(error('medicalCondition'))}
            />
          </Field>
        )}
      </Section>

      <Section title={registrationFormCopy.sections.payment}>
        {!distanceId ? (
          <p className="text-sm text-neutral-600">
            Elige tu carrera arriba para ver el valor y el QR de pago.
          </p>
        ) : (
          <div className="space-y-5">
            <div>
              <label htmlFor="code" className={labelClass}>
                Código de descuento (opcional)
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="code"
                  value={codeInput}
                  onChange={(event) => setCodeInput(event.target.value.toUpperCase())}
                  placeholder="TU CÓDIGO"
                  autoComplete="off"
                  maxLength={20}
                  className={`${inputClass} min-w-0 flex-1 tracking-wider uppercase`}
                />
                <button
                  type="button"
                  onClick={() => void loadQuote(distanceId, codeInput.trim() || null)}
                  disabled={codeInput.trim() === ''}
                  className="cursor-pointer rounded-xl bg-neutral-900 px-5 font-athletic-bold text-sm tracking-wider text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  APLICAR
                </button>
              </div>
              {quoteError && (
                <p role="alert" className="mt-2 text-sm font-semibold text-red-700">
                  {registrationErrors[quoteError]}
                </p>
              )}
            </div>

            {quote && quote.distanceId === distanceId && (
              <QrPayment
                qrImage={quote.qrImage}
                distanceId={quote.distanceId}
                total={quote.total}
                basePrice={quote.basePrice}
                discount={quote.discount}
                code={quote.code}
              />
            )}

            <Field
              label="Comprobante de pago *"
              hint="Foto o PDF, hasta 5 MB"
              error={error('receiptPath')}
              htmlFor="receipt"
            >
              <input
                id="receipt"
                name="receipt"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="block w-full text-sm text-neutral-700 file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-neutral-900 file:px-5 file:py-2.5 file:text-xs file:font-bold file:tracking-wider file:text-white"
              />
            </Field>
          </div>
        )}
      </Section>

      <Section title={registrationFormCopy.sections.terms}>
        <Field label="Observaciones" error={error('observation')} htmlFor="observation">
          <textarea id="observation" name="observation" rows={3} className={inputClass} />
        </Field>
        <p className="rounded-xl bg-neutral-50 p-4 text-xs leading-relaxed text-neutral-600">
          {terms.text}
        </p>
        <label className="flex items-start gap-3 text-sm font-semibold text-neutral-800">
          <input
            type="checkbox"
            name="acceptedTerms"
            className="mt-0.5 h-5 w-5 accent-brand-orange"
          />
          <span>
            {terms.label} *
            {error('acceptedTerms') && (
              <span className="mt-1 block text-xs text-red-700">{error('acceptedTerms')}</span>
            )}
          </span>
        </label>
      </Section>

      {formError && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
        >
          {registrationErrors[formError]}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="w-full cursor-pointer rounded-full bg-brand-orange px-6 py-4 font-athletic-bold text-sm tracking-wider text-white shadow-lg shadow-orange-900/20 transition-colors hover:bg-brand-orange-deep disabled:cursor-wait disabled:opacity-60"
      >
        {sending ? 'ENVIANDO…' : registrationFormCopy.submit}
      </button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="font-athletic-bold text-lg tracking-wider text-neutral-950 uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  error,
  htmlFor,
  as,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  as?: 'fieldset';
  children: ReactNode;
}) {
  const heading =
    as === 'fieldset' ? (
      <legend className={labelClass}>{label}</legend>
    ) : (
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
    );
  const body = (
    <>
      {heading}
      {hint && <p className="text-xs text-neutral-500">{hint}</p>}
      <div className="mt-2">{children}</div>
      {error && <p className="mt-1 text-xs font-semibold text-red-700">{error}</p>}
    </>
  );
  return as === 'fieldset' ? <fieldset>{body}</fieldset> : <div>{body}</div>;
}

function YesNo({
  name,
  label,
  error,
  onChange,
}: {
  name: string;
  label: string;
  error?: string;
  onChange?: (value: 'SI' | 'NO') => void;
}) {
  return (
    <Field label={label} error={error} as="fieldset">
      <div className="grid max-w-xs grid-cols-2 gap-3">
        {(['SI', 'NO'] as const).map((value) => (
          <label key={value} className={choiceClass}>
            <input
              type="radio"
              name={name}
              value={value}
              onChange={() => onChange?.(value)}
              className="sr-only"
            />
            {value === 'SI' ? 'Sí' : 'No'}
          </label>
        ))}
      </div>
    </Field>
  );
}
