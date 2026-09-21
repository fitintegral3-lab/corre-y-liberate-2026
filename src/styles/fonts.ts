import { Barlow } from 'next/font/google';
import localFont from 'next/font/local';

/**
 * Tipografias del sitio, servidas desde el propio dominio.
 *
 * Antes se cargaban con un `<link>` a fonts.googleapis.com: dos conexiones
 * extra antes de poder pintar texto, un salto de layout mientras llegaban y
 * una peticion del visitante a un tercero. `next/font` las descarga en build,
 * las hostea con el sitio y calcula las metricas de la fuente de respaldo para
 * que el intercambio no mueva nada en pantalla.
 *
 * Solo se pide la italica: las tres clases `.font-athletic*` fuerzan
 * `font-style: italic`, asi que los archivos normales se descargarian para no
 * usarse nunca.
 */
export const displayFont = Barlow({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  style: ['italic'],
  display: 'swap',
  variable: '--font-barlow',
});

/**
 * `next/font/local` resuelve `src` contra este archivo, no contra el alias
 * `@/`: la ruta relativa es obligatoria.
 */
export const bodyFont = localFont({
  src: '../assets/fonts/MyriadPro-Regular.otf',
  display: 'swap',
  variable: '--font-myriad',
});
