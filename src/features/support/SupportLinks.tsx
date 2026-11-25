'use client';

import { Briefcase, HandCoins, HeartHandshake, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { WhatsAppIcon } from '@/components/ui/icons/SocialIcons';
import {
  allyContributions,
  allyMessage,
  supportOptions,
  whatsappLink,
  type AllyContribution,
} from '@/content';

import type { LucideIcon } from 'lucide-react';
import type { RefObject } from 'react';

const icons: Record<(typeof supportOptions)[number]['id'], LucideIcon> = {
  patrocinador: Briefcase,
  donar: HandCoins,
  aliado: HeartHandshake,
};

const buttonClass =
  'flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-orange px-6 py-3 font-athletic-bold text-sm text-white transition hover:bg-brand-orange-deep';

interface Draft {
  title: string;
  message: string;
}

/** Ventana con el mensaje listo para editar antes de abrir WhatsApp. */
function MessageDialog({
  dialog,
  draft,
  whatsappUrl,
  onChange,
}: {
  dialog: RefObject<HTMLDialogElement | null>;
  draft: Draft;
  whatsappUrl: string;
  onChange: (message: string) => void;
}) {
  const empty = draft.message.trim() === '';

  return (
    <dialog
      ref={dialog}
      aria-labelledby="sumate-dialog-title"
      onClick={(event) => {
        // Un clic en el fondo oscuro (fuera de la tarjeta) cierra la ventana.
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl bg-white p-0 text-ink backdrop:bg-black/70"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id="sumate-dialog-title" className="font-athletic text-2xl leading-tight">
            {draft.title}
          </h2>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Cerrar"
            className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full text-neutral-600 hover:bg-neutral-100"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <label className="mt-3 block text-sm font-semibold text-neutral-800">
          Tu mensaje (puedes editarlo)
          <textarea
            value={draft.message}
            onChange={(event) => onChange(event.target.value)}
            rows={5}
            maxLength={1000}
            className="mt-2 block w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-base font-normal text-neutral-950"
          />
        </label>
        <a
          href={empty ? undefined : whatsappLink(whatsappUrl, draft.message.trim())}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={empty}
          onClick={() => dialog.current?.close()}
          className={`${buttonClass} mt-4 aria-disabled:pointer-events-none aria-disabled:opacity-50`}
        >
          <WhatsAppIcon className="h-5 w-5 fill-current" />
          Enviar por WhatsApp
        </a>
      </div>
    </dialog>
  );
}

export function SupportLinks({ whatsappUrl }: { whatsappUrl: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [contributions, setContributions] = useState<AllyContribution[]>([]);
  const [draft, setDraft] = useState<Draft>({ title: '', message: '' });

  function toggle(item: AllyContribution) {
    setContributions((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item],
    );
  }

  function openDraft(title: string, message: string) {
    setDraft({ title, message });
    dialog.current?.showModal();
  }

  return (
    <>
      <ul className="space-y-4">
        {supportOptions.map((option) => {
          const Icon = icons[option.id];
          const isAlly = option.id === 'aliado';

          return (
            <li
              key={option.id}
              id={option.id}
              className="rounded-3xl border border-white/10 bg-white p-5 text-ink shadow-xl shadow-black/20 sm:p-6"
            >
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-50 text-brand-orange">
                  <Icon size={24} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-athletic text-2xl leading-tight">{option.title}</h2>
                  <p className="mt-1 text-sm text-neutral-700">{option.description}</p>
                </div>
              </div>

              {isAlly && (
                <fieldset className="mt-4">
                  <legend className="mb-2 text-sm font-semibold text-neutral-800">
                    ¿Qué puedes aportar? Marca las que quieras (opcional)
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {allyContributions.map((item) => (
                      <label
                        key={item}
                        className="flex min-h-10 cursor-pointer items-center rounded-full border border-neutral-200 px-3.5 text-sm has-checked:border-orange-700 has-checked:bg-orange-50 has-checked:text-orange-900 has-focus-visible:outline-2 has-focus-visible:outline-orange-700"
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={contributions.includes(item)}
                          onChange={() => toggle(item)}
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              <button
                type="button"
                onClick={() =>
                  openDraft(option.title, isAlly ? allyMessage(contributions) : option.message)
                }
                className={`${buttonClass} mt-4`}
              >
                <WhatsAppIcon className="h-5 w-5 fill-current" />
                Escribir por WhatsApp
              </button>
            </li>
          );
        })}
      </ul>

      <MessageDialog
        dialog={dialog}
        draft={draft}
        whatsappUrl={whatsappUrl}
        onChange={(message) => setDraft((current) => ({ ...current, message }))}
      />
    </>
  );
}
