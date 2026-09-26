'use client';

import { useEffect } from 'react';

/**
 * Frontera de error de la pagina.
 *
 * Sin esto, una excepcion en tiempo de ejecucion deja al visitante frente a la
 * pantalla generica de Next. Aca ve un mensaje en el idioma y los colores del
 * evento, y un boton para reintentar sin recargar.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // El `digest` es lo unico que relaciona esta pantalla con el stack trace
    // que quedo en los logs del servidor.
    console.error('[corre-y-liberate] error no controlado', error.digest ?? error.message);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ink px-6 text-center text-white">
      <p className="font-athletic-bold text-sm tracking-widest text-brand-orange">ALGO FALLÓ</p>
      <h1 className="font-athletic text-4xl sm:text-6xl">NO PUDIMOS CARGAR LA PÁGINA</h1>
      <p className="max-w-md text-sm text-neutral-300">
        Reintentá en un momento. Si el problema sigue, escribinos por WhatsApp y te ayudamos con tu
        inscripción.
      </p>
      <button
        type="button"
        onClick={reset}
        className="cursor-pointer rounded-full bg-brand-orange px-8 py-3.5 font-athletic-bold text-xs tracking-wider text-white transition-all duration-300 hover:scale-105 hover:bg-brand-orange-bright"
      >
        REINTENTAR
      </button>
    </main>
  );
}
