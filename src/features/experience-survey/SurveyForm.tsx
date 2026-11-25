'use client';

import { CheckCircle2, Star } from 'lucide-react';
import { useRef, useState } from 'react';

import { ratingLabels, ratingQuestions, returnOptions } from './schema';

import type { FormEvent, ReactNode } from 'react';

const optionClass =
  'flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-neutral-200 px-3 text-sm has-checked:border-orange-700 has-checked:bg-orange-50 has-focus-visible:outline-2 has-focus-visible:outline-orange-700';

const textareaClass =
  'mt-2 block w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-base font-normal text-neutral-950';

const cardClass = 'rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7';
const questionClass = 'font-athletic-bold text-lg leading-snug text-ink';

function Question({
  number,
  label,
  children,
}: {
  number: number;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={cardClass}>
      <fieldset>
        <legend className={`${questionClass} mb-3`}>
          {number}. {label}
        </legend>
        {children}
      </fieldset>
    </div>
  );
}

function RatingOptions({ name }: { name: string }) {
  // De Excelente a Muy mala, como venía escrita la encuesta.
  const scale = ratingLabels.map((label, index) => ({ label, value: index + 1 })).reverse();

  return (
    <div className="grid gap-2 sm:grid-cols-5">
      {scale.map(({ label, value }) => (
        <label key={value} className={`${optionClass} sm:flex-col sm:justify-center sm:py-3`}>
          <input
            type="radio"
            name={name}
            value={value}
            required
            className="accent-orange-700 sm:sr-only"
          />
          <span className="flex gap-0.5 text-amber-500" aria-hidden="true">
            {Array.from({ length: value }, (_, star) => (
              <Star key={star} size={14} fill="currentColor" strokeWidth={0} />
            ))}
          </span>
          {label}
        </label>
      ))}
    </div>
  );
}

function OpenQuestion({ number, label, name }: { number: number; label: string; name: string }) {
  return (
    <label className={`${cardClass} block ${questionClass}`}>
      {number}. {label}
      <textarea name={name} rows={3} maxLength={1200} required className={textareaClass} />
    </label>
  );
}

const deniedMessages: Record<number, string> = {
  404: 'No encontramos una inscripción con ese número. Escribe la cédula o el WhatsApp con que te inscribiste.',
  409: 'Esa inscripción ya respondió la encuesta. ¡Gracias por tu opinión!',
};

function AccessStep({ onAccess }: { onAccess: (identifier: string) => void }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const identifier = String(new FormData(event.currentTarget).get('identifier') ?? '').trim();
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/encuesta/acceso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });
      if (response.ok) return onAccess(identifier);
      setError(
        deniedMessages[response.status] ??
          (response.status === 422
            ? 'Revisa el número: la cédula puede ir con o sin puntos, y el WhatsApp con sus 10 dígitos.'
            : 'No pudimos comprobar tu inscripción. Intenta de nuevo.'),
      );
    } catch {
      setError('No pudimos comprobar tu inscripción. Intenta de nuevo.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form method="post" onSubmit={handleSubmit} className={`${cardClass} space-y-4`}>
      <label className={`block ${questionClass}`}>
        Escribe la cédula o el WhatsApp con que te inscribiste
        <input
          name="identifier"
          inputMode="numeric"
          autoComplete="off"
          maxLength={40}
          required
          className={textareaClass}
        />
      </label>
      <p className="text-sm text-neutral-600">
        La cédula puede ir con o sin puntos. La encuesta es para quienes corrieron Corre y Libérate
        2026, y este número solo se usa para comprobar tu inscripción.
      </p>
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
        {pending ? 'Comprobando…' : 'Continuar'}
      </button>
    </form>
  );
}

export function SurveyForm() {
  const [identifier, setIdentifier] = useState<string | null>(null);
  if (identifier === null) return <AccessStep onAccess={setIdentifier} />;
  return <SurveyQuestions identifier={identifier} />;
}

function SurveyQuestions({ identifier }: { identifier: string }) {
  const submissionId = useRef<string>(null);
  const submitting = useRef(false);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;

    submitting.current = true;
    setPending(true);
    setError('');

    try {
      submissionId.current ??= crypto.randomUUID();
      const response = await fetch('/api/encuesta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...Object.fromEntries(new FormData(event.currentTarget)),
          identifier,
          submissionId: submissionId.current,
        }),
      });

      if (response.ok) {
        setSent(true);
        window.scrollTo({ top: 0 });
      } else {
        setError(
          deniedMessages[response.status] ??
            (response.status === 422
              ? 'Revisa tus respuestas antes de volver a enviar.'
              : 'No pudimos guardar la encuesta. Tus respuestas siguen aquí. Intenta de nuevo.'),
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
        <h2 className="font-athletic-bold text-2xl">¡Gracias por responder!</h2>
        <p className="mt-2">Tu opinión nos ayuda a preparar una mejor edición en 2027.</p>
      </div>
    );
  }

  const ratings = ratingQuestions.length;

  return (
    <form method="post" onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-neutral-600">
        Todas las preguntas son obligatorias, excepto la última.
      </p>

      {ratingQuestions.map((question, index) => (
        <Question key={question.name} number={index + 1} label={question.label}>
          <RatingOptions name={question.name} />
        </Question>
      ))}

      <OpenQuestion
        number={ratings + 1}
        label="¿Qué fue lo que MÁS te gustó de Corre y Libérate 2026?"
        name="likedMost"
      />
      <OpenQuestion
        number={ratings + 2}
        label="¿Qué deberíamos MEJORAR para nuestra próxima edición?"
        name="improve"
      />
      <Question number={ratings + 3} label="¿Participarías nuevamente en Corre y Libérate 2027?">
        <div className="flex flex-wrap gap-2">
          {returnOptions.map((option) => (
            <label key={option} className={optionClass}>
              <input
                type="radio"
                name="returnIntent"
                value={option}
                required
                className="accent-orange-700"
              />
              {option}
            </label>
          ))}
        </div>
      </Question>
      <Question
        number={ratings + 4}
        label="Del 0 al 10, ¿qué tan probable es que recomiendes Corre y Libérate a otra persona? (opcional)"
      >
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
          {Array.from({ length: 11 }, (_, score) => (
            <label key={score} className={`${optionClass} justify-center px-0 font-semibold`}>
              <input type="radio" name="recommend" value={score} className="sr-only" />
              {score}
            </label>
          ))}
        </div>
        <p className="mt-2 flex justify-between text-xs text-neutral-600" aria-hidden="true">
          <span>0 · Nada probable</span>
          <span>10 · Muy probable</span>
        </p>
      </Question>

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
        {pending ? 'Enviando…' : 'Enviar encuesta'}
      </button>
    </form>
  );
}
