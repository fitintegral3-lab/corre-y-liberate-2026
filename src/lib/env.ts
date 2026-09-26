import { z } from 'zod';

/**
 * Entorno validado.
 *
 * Una variable mal escrita o ausente se nota aca —al arrancar o al construir—
 * y no en produccion como una URL `undefined` dentro de un `<meta>`.
 *
 * Las variables se leen una por una y no con `process.env` completo a
 * proposito: Next reemplaza `process.env.NEXT_PUBLIC_X` por su valor en tiempo
 * de compilacion solo cuando encuentra el acceso escrito literal. Pasar el
 * objeto entero funciona en el servidor y deja `undefined` en el navegador.
 */
const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url('NEXT_PUBLIC_SITE_URL debe ser una URL absoluta'),
  NEXT_PUBLIC_APP_ENV: z.enum(['production', 'preview', 'development']),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || 'development',
});

if (!parsed.success) {
  const detail = parsed.error.issues
    .map((issue) => `  · ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');

  throw new Error(`Variables de entorno invalidas:\n${detail}\n\nRevisa .env.example.`);
}

export const env = parsed.data;

/** Solo produccion se deja indexar; las previews no compiten con el sitio real. */
export const isProduction = env.NEXT_PUBLIC_APP_ENV === 'production';
