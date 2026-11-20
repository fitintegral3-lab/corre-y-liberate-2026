'use client';

import { Map as MapIcon, X } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';

import { cn } from '@/lib/utils/cn';

interface RouteButtonProps {
  label: string;
  routeImage: string;
  routeVideo?: string;
  className?: string;
}

/**
 * Boton «VER RUTA» que abre el mapa y, cuando esta disponible, el video.
 *
 * El afiche se monta recien al abrir: cada distancia lleva su propio boton en
 * varias secciones, y ninguno descarga su imagen hasta que alguien lo toca.
 */
export function RouteButton({ label, routeImage, routeVideo, className }: RouteButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setShowVideo(false);
          setOpen(true);
          dialogRef.current?.showModal();
        }}
        aria-haspopup="dialog"
        aria-label={`Ver ruta ${label}`}
        className={cn(
          'inline-flex cursor-pointer items-center justify-center gap-1 rounded-full bg-brand-orange px-2 py-1 sm:px-2.5 font-athletic-bold text-[10px] tracking-wider whitespace-nowrap text-white shadow-md transition-colors hover:bg-brand-orange-bright sm:text-xs',
          className,
        )}
      >
        <MapIcon className="hidden h-3 w-3 shrink-0 sm:block" aria-hidden="true" />
        VER RUTA
      </button>

      <dialog
        ref={dialogRef}
        aria-label={`Ruta ${label}`}
        onClose={() => setOpen(false)}
        // Un clic en el propio <dialog> y no en su contenido es un clic en el fondo.
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        className="m-auto max-h-[92vh] w-fit max-w-[calc(100%-2rem)] overflow-visible bg-transparent p-0 backdrop:bg-black/85 backdrop:backdrop-blur-sm"
      >
        {open && (
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            {routeVideo && (
              <div className="flex h-14 items-center gap-2 bg-neutral-950 px-3 pr-14 text-sm font-semibold text-white">
                <button
                  type="button"
                  aria-pressed={!showVideo}
                  className="cursor-pointer rounded-full px-3 py-1.5 hover:bg-neutral-700 aria-pressed:bg-white aria-pressed:text-neutral-950"
                  onClick={() => setShowVideo(false)}
                >
                  Mapa
                </button>
                <button
                  type="button"
                  aria-pressed={showVideo}
                  className="cursor-pointer rounded-full px-3 py-1.5 hover:bg-neutral-700 aria-pressed:bg-white aria-pressed:text-neutral-950"
                  onClick={() => setShowVideo(true)}
                >
                  Video
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Cerrar"
              className="absolute top-2 right-2 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-neutral-700"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <div
              className={cn(
                'aspect-[4/5] bg-neutral-950',
                routeVideo
                  ? 'w-[min(36rem,calc(100vw-2rem),calc((92dvh-3.5rem)*0.8))]'
                  : 'w-[min(36rem,calc(100vw-2rem),calc(92dvh*0.8))]',
              )}
            >
              {showVideo && routeVideo ? (
                <video
                  aria-label={`Video de la ruta ${label}`}
                  className="h-full w-full object-contain"
                  controls
                  muted
                  playsInline
                  preload="metadata"
                  src={routeVideo}
                />
              ) : (
                <Image
                  src={routeImage}
                  alt={`Mapa de la ruta ${label}`}
                  width={1080}
                  height={1350}
                  sizes="(min-width: 640px) 36rem, 100vw"
                  loading="eager"
                  className="h-full w-full object-contain"
                />
              )}
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
