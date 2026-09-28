'use client';

import { ExternalLink, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { InstagramIcon } from '@/components/ui/icons/SocialIcons';

import type { Sponsor } from '@/domain/event';

interface SponsorsMarqueeProps {
  sponsors: readonly Sponsor[];
}

/**
 * Tira de logos en loop que abre, al tocar un logo, un modal con la pagina
 * oficial y el Instagram del patrocinador. Un patrocinador sin ninguno de los
 * dos se muestra sin clic.
 */
export function SponsorsMarquee({ sponsors }: SponsorsMarqueeProps) {
  const [selected, setSelected] = useState<Sponsor | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // `showModal` y no un div con `open`: el navegador ya encierra el foco,
  // cierra con Escape, deja inerte el resto de la pagina y devuelve el foco
  // al logo que lo abrio.
  useEffect(() => {
    if (selected) dialogRef.current?.showModal();
  }, [selected]);

  return (
    <>
      <div className="group mt-12 w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)] sm:mt-16 motion-reduce:[mask-image:none]">
        {/* La lista va dos veces y la pista se corre -50%: cuando termina, la
            segunda copia esta exactamente donde arranco la primera y el salto
            no se ve. Por eso el espacio entre logos es padding de cada item y
            no `gap`, que dejaria una copia mas angosta que la otra.
            Con movimiento reducido la animacion no corre y la copia sobra: ahi
            la lista se acomoda en filas para que ningun logo quede afuera.
            Se frena tambien con el foco adentro: con teclado no hay hover, y
            un logo que se escapa mientras se lo elige no se puede abrir. */}
        <div className="flex w-max animate-marquee group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:animate-none">
          {[false, true].map((isCopy) => (
            <ul
              key={String(isCopy)}
              aria-hidden={isCopy || undefined}
              className={`flex shrink-0 items-center motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center ${isCopy ? 'motion-reduce:hidden' : ''}`}
            >
              {sponsors.map((sponsor) => {
                const logo = (
                  <span className="relative block h-22 w-35 sm:h-29 sm:w-45">
                    <Image
                      src={sponsor.logo}
                      alt={isCopy ? '' : sponsor.name}
                      fill
                      sizes="(min-width: 640px) 180px, 140px"
                      className="object-contain transition-transform duration-300 group-hover/logo:scale-105"
                    />
                  </span>
                );

                return (
                  <li key={sponsor.id} className="shrink-0 px-6 py-2 sm:px-10">
                    {sponsor.website || sponsor.instagram ? (
                      <button
                        type="button"
                        onClick={() => setSelected(sponsor)}
                        tabIndex={isCopy ? -1 : undefined}
                        aria-haspopup="dialog"
                        className="group/logo block cursor-pointer rounded-lg"
                      >
                        {logo}
                      </button>
                    ) : (
                      logo
                    )}
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="sponsor-dialog-title"
        onClose={() => setSelected(null)}
        // Un clic que cae en el propio <dialog> y no en su contenido es un
        // clic en el fondo oscuro: el backdrop no es un elemento aparte.
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-white p-0 text-left text-ink shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        {selected && (
          <div className="relative p-6 sm:p-8">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Cerrar"
              className="absolute top-3 right-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="relative mx-auto h-28 w-48">
              <Image src={selected.logo} alt="" fill sizes="192px" className="object-contain" />
            </div>
            <h3
              id="sponsor-dialog-title"
              className="mt-4 text-center font-athletic text-2xl text-neutral-950"
            >
              {selected.name}
            </h3>

            <div className="mt-6 space-y-3">
              {selected.website && (
                <a
                  href={selected.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full bg-brand-orange px-5 py-3 font-athletic-bold text-sm tracking-wider text-white transition-colors hover:bg-brand-orange-bright"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  PÁGINA OFICIAL
                </a>
              )}
              {selected.instagram && (
                <a
                  href={selected.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full border-2 border-neutral-900 px-5 py-3 font-athletic-bold text-sm tracking-wider text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
                >
                  <InstagramIcon className="h-4 w-4 fill-current" />
                  INSTAGRAM
                </a>
              )}
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
