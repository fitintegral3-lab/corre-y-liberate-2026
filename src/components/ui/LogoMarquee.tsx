'use client';

import { ExternalLink, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';

import { InstagramIcon } from '@/components/ui/icons/SocialIcons';

import type { LinkedLogo } from '@/domain/event';

interface LogoMarqueeProps {
  items: readonly LinkedLogo[];
}

/**
 * Logos por mitad de pista. Con 8 logos de 260px la mitad mide unos 2100px y
 * cubre una pantalla ancha; con menos, al final de la vuelta se veria un hueco
 * antes de que entre la segunda mitad. Por eso una lista corta se repite hasta
 * llegar a este numero.
 */
const MIN_LOGOS_PER_HALF = 8;

/** Segundos que tarda en cruzar cada logo: la velocidad no cambia con el largo de la lista. */
const SECONDS_PER_LOGO = 5;

/**
 * Tira de logos en loop que abre, al tocar un logo, un modal con la pagina
 * oficial y el Instagram de quien lo firma. Un logo sin ninguno de los dos se
 * muestra sin clic.
 */
export function LogoMarquee({ items }: LogoMarqueeProps) {
  const [selected, setSelected] = useState<LinkedLogo | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const repeatsPerHalf = Math.ceil(MIN_LOGOS_PER_HALF / items.length);
  const copies = repeatsPerHalf * 2;
  const duration = `${repeatsPerHalf * items.length * SECONDS_PER_LOGO}s`;

  // `showModal` y no un div con `open`: el navegador ya encierra el foco,
  // cierra con Escape, deja inerte el resto de la pagina y devuelve el foco
  // al logo que lo abrio.
  useEffect(() => {
    if (selected) dialogRef.current?.showModal();
  }, [selected]);

  return (
    <>
      <div className="group mt-12 w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)] sm:mt-16 motion-reduce:[mask-image:none]">
        {/* La lista va repetida en dos mitades iguales y la pista se corre
            -50%: cuando termina, la segunda mitad esta exactamente donde
            arranco la primera y el salto no se ve. Por eso el espacio entre
            logos es padding de cada item y no `gap`, que dejaria una mitad
            mas angosta que la otra.
            Solo la primera copia existe para lectores de pantalla y teclado;
            las demas son decorado. Con movimiento reducido la animacion no
            corre y las copias sobran: ahi la lista se acomoda en filas para
            que ningun logo quede afuera.
            Se frena tambien con el foco adentro: con teclado no hay hover, y
            un logo que se escapa mientras se lo elige no se puede abrir. */}
        <div
          style={{ animationDuration: duration }}
          className="flex w-max animate-marquee group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:animate-none"
        >
          {Array.from({ length: copies }, (_, copy) => {
            const isCopy = copy > 0;
            return (
              <ul
                key={copy}
                aria-hidden={isCopy || undefined}
                className={`flex shrink-0 items-center motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center ${isCopy ? 'motion-reduce:hidden' : ''}`}
              >
                {items.map((item) => {
                  const logo = (
                    <span className="relative block h-22 w-35 sm:h-29 sm:w-45">
                      <Image
                        src={item.logo}
                        alt={isCopy ? '' : item.name}
                        fill
                        sizes="(min-width: 640px) 180px, 140px"
                        className="object-contain transition-transform duration-300 group-hover/logo:scale-105"
                      />
                    </span>
                  );

                  return (
                    <li key={item.id} className="shrink-0 px-6 py-2 sm:px-10">
                      {item.website || item.instagram ? (
                        <button
                          type="button"
                          onClick={() => setSelected(item)}
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
            );
          })}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
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
            <h3 id={titleId} className="mt-4 text-center font-athletic text-2xl text-neutral-950">
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
