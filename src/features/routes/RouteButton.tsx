'use client';

import { Map as MapIcon, X } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';

import { cn } from '@/lib/utils/cn';

interface RouteButtonProps {
  label: string;
  routeImage: string;
  className?: string;
}

/**
 * Boton «VER RUTA» que abre el afiche con el mapa del recorrido de una distancia.
 *
 * El afiche se monta recien al abrir: cada distancia lleva su propio boton en
 * varias secciones, y ninguno descarga su imagen hasta que alguien lo toca.
 */
export function RouteButton({ label, routeImage, className }: RouteButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
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
          <div className="relative">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Cerrar"
              className="absolute top-2 right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <Image
              src={routeImage}
              alt={`Mapa de la ruta ${label}`}
              width={1600}
              height={2000}
              sizes="(min-width: 640px) 36rem, 100vw"
              // Se monta recien al abrir, asi que diferir la carga no ahorra nada, y
              // dentro del <dialog> la carga diferida a veces no arranca nunca.
              loading="eager"
              // El tope por alto sale del 4:5 del afiche.
              className="h-auto w-[min(36rem,calc(100vw-2rem),calc(92vh*0.8))] rounded-2xl shadow-2xl"
            />
          </div>
        )}
      </dialog>
    </>
  );
}
