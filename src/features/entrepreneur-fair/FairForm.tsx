'use client';

import { CheckCircle2 } from 'lucide-react';
import { useRef, useState } from 'react';

import { activities, formalizationOptions, householdOptions, operatingTimes } from './schema';

import type { ComponentPropsWithoutRef, FormEvent, ReactNode } from 'react';

const controlClass =
  'mt-2 block w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-base font-normal text-neutral-950';

function TextField({ label, ...input }: { label: string } & ComponentPropsWithoutRef<'input'>) {
  return (
    <label className="block text-sm font-semibold text-neutral-800">
      {label}
      <input className={controlClass} {...input} />
    </label>
  );
}

function Choices({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: readonly string[];
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-neutral-800">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex min-h-11 items-center gap-2 rounded-xl border border-neutral-200 px-3 text-sm has-checked:border-orange-700 has-checked:bg-orange-50"
          >
            <input type="radio" name={name} value={option} required className="accent-orange-700" />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-8">
      <h2 className="font-athletic-bold text-2xl leading-tight text-ink">{title}</h2>
      {children}
    </section>
  );
}

export function FairForm({ contactUrl }: { contactUrl: string }) {
  const submissionId = useRef<string>(null);
  const submitting = useRef(false);
  const [otherActivity, setOtherActivity] = useState(false);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const selectedActivities = formData.getAll('activities');

    if (selectedActivities.length === 0) {
      setError('Elige al menos una actividad económica.');
      form.querySelector<HTMLInputElement>('input[name="activities"]')?.focus();
      return;
    }

    submitting.current = true;
    setPending(true);
    setError('');

    try {
      submissionId.current ??= crypto.randomUUID();
      const response = await fetch('/api/feria-empresarial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...Object.fromEntries(formData),
          activities: selectedActivities,
          submissionId: submissionId.current,
        }),
      });

      if (response.ok) {
        setSent(true);
        window.scrollTo({ top: 0 });
      } else {
        setError(
          response.status === 422
            ? 'Revisa tus respuestas y los campos obligatorios antes de volver a enviar.'
            : 'No pudimos guardar el formulario. Tus respuestas siguen aquí. Intenta de nuevo.',
        );
      }
    } catch {
      setError('No pudimos confirmar el envío. Tus respuestas siguen aquí. Intenta de nuevo.');
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-green-200 bg-green-50 p-6 text-green-950 sm:p-8"
      >
        <CheckCircle2 className="mb-3 h-7 w-7 text-green-800" aria-hidden="true" />
        <h2 className="font-athletic-bold text-2xl">Formulario recibido</h2>
        <p className="mt-2">La organización recibió la información de tu emprendimiento.</p>
      </div>
    );
  }

  return (
    <form method="post" onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-neutral-600">
        Todos los campos son obligatorios, excepto redes sociales, canales del emprendimiento y
        observaciones.
      </p>

      <FormSection title="1. Datos generales de la emprendedora">
        <TextField
          label="Nombres y apellidos"
          name="fullName"
          autoComplete="name"
          maxLength={160}
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Número de identificación"
            name="identification"
            maxLength={32}
            required
          />
          <TextField label="Edad" name="age" type="number" min={1} max={120} required />
          <TextField
            label="Número de contacto"
            name="phone"
            type="tel"
            autoComplete="tel"
            pattern={String.raw`(?:\D*\d){7,}\D*`}
            title="Incluye al menos 7 dígitos."
            maxLength={32}
            required
          />
          <TextField
            label="Correo electrónico"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
          />
        </div>
        <TextField
          label="Barrio o sector de residencia"
          name="neighborhood"
          maxLength={160}
          required
        />
        <Choices label="¿Es cabeza de hogar?" name="headOfHousehold" options={householdOptions} />
      </FormSection>

      <FormSection title="2. Datos generales del emprendimiento">
        <TextField
          label="Nombre del emprendimiento"
          name="businessName"
          autoComplete="organization"
          maxLength={160}
          required
        />
        <label className="block text-sm font-semibold text-neutral-800">
          Producto(s) o servicio(s) que ofrece
          <textarea name="products" rows={3} maxLength={1200} required className={controlClass} />
        </label>
        <fieldset aria-describedby="feria-actividad-ayuda">
          <legend className="text-sm font-semibold text-neutral-800">Actividad económica</legend>
          <p id="feria-actividad-ayuda" className="mt-1 text-sm text-neutral-600">
            Elige una o más opciones.
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {activities.map((activity) => (
              <label
                key={activity}
                className="flex min-h-11 items-center gap-2 rounded-xl border border-neutral-200 px-3 text-sm has-checked:border-orange-700 has-checked:bg-orange-50"
              >
                <input
                  type="checkbox"
                  name="activities"
                  value={activity}
                  className="accent-orange-700"
                  onChange={
                    activity === 'Otro'
                      ? (event) => setOtherActivity(event.target.checked)
                      : undefined
                  }
                />
                {activity}
              </label>
            ))}
          </div>
          {otherActivity && (
            <div className="mt-3">
              <TextField
                label="Especifica la otra actividad"
                name="otherActivity"
                maxLength={160}
                required
              />
            </div>
          )}
        </fieldset>
        <Choices label="Tiempo de funcionamiento" name="operatingTime" options={operatingTimes} />
        <TextField
          label="¿Cuántas personas trabajan en el emprendimiento?"
          name="teamSize"
          type="number"
          min={0}
          max={99999}
          required
        />
        <Choices
          label="¿El emprendimiento está formalizado?"
          name="formalization"
          options={formalizationOptions}
        />
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-neutral-800">
            Redes sociales o canales de contacto del emprendimiento
          </legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField label="Instagram" name="instagram" maxLength={254} />
            <TextField label="Facebook" name="facebook" maxLength={254} />
            <TextField label="WhatsApp" name="whatsapp" type="tel" maxLength={254} />
          </div>
        </fieldset>
      </FormSection>

      <FormSection title="3. Observaciones">
        <label className="block text-sm font-semibold text-neutral-800">
          Observaciones (opcional)
          <textarea name="notes" rows={4} maxLength={1800} className={controlClass} />
        </label>
      </FormSection>

      <div className="space-y-3 px-1">
        <label className="flex items-start gap-3 text-sm text-neutral-800">
          <input type="checkbox" name="consent" required className="mt-1 accent-orange-700" />
          <span>
            Autorizo a Integral Fit a usar estos datos para caracterizar mi emprendimiento y
            contactarme sobre la Feria Empresarial de Corre y Libérate 2026.
          </span>
        </label>
        <p className="pl-6 text-sm text-neutral-600">
          Para consultas sobre tus datos,{' '}
          <a href={contactUrl} className="font-semibold text-orange-800 underline">
            escríbenos por WhatsApp
          </a>
          .
        </p>
      </div>
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-800">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="min-h-12 w-full cursor-pointer rounded-full bg-orange-700 px-7 py-3 font-athletic-bold text-white hover:bg-orange-800 disabled:cursor-wait disabled:opacity-70 sm:w-auto"
      >
        {pending ? 'Enviando…' : 'Enviar formulario'}
      </button>
    </form>
  );
}
