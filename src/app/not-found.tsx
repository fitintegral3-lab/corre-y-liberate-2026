import Link from 'next/link';

import { homeAnchor } from '@/content';

export const metadata = { title: 'Página no encontrada' };

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ink px-6 text-center text-white">
      <p className="font-athletic-bold text-sm tracking-widest text-brand-orange">ERROR 404</p>
      <h1 className="font-athletic text-5xl sm:text-7xl">ESTA RUTA NO EXISTE</h1>
      <p className="max-w-md text-sm text-neutral-300">
        El enlace que seguiste no lleva a ninguna parte. Volvé a la línea de salida.
      </p>
      <Link
        href={`/${homeAnchor}`}
        className="rounded-full bg-brand-orange px-8 py-3.5 font-athletic-bold text-xs tracking-wider text-white transition-all duration-300 hover:scale-105 hover:bg-brand-orange-bright"
      >
        IR AL INICIO
      </Link>
    </main>
  );
}
