import type { NextConfig } from 'next';

import { turbopackRootFor } from './src/lib/build/turbopack-root';

const isDev = process.env.NODE_ENV === 'development';

/** Origen de Supabase, si esta configurado. Sin el, la CSP no abre nada extra. */
const supabaseOrigin = /^https:\/\/[a-z0-9]+\.supabase\.co$/.test(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
)
  ? process.env.NEXT_PUBLIC_SUPABASE_URL
  : null;

/**
 * Politica de seguridad de contenido.
 *
 * `script-src` admite `'unsafe-inline'` porque el App Router inyecta el bootstrap
 * y el payload de Flight como scripts inline sin nonce. La CSP sigue sirviendo:
 * corta la carga de scripts de terceros, fija `frame-ancestors` y `form-action`, y
 * deja el sitio sin superficie para inyeccion de recursos externos. El paso a
 * nonces exige un `proxy.ts` que los emita por request; esta anotado en
 * docs/ARCHITECTURE.md como deuda consciente, no como olvido.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  // El comprobante se sube desde el navegador directo a Supabase Storage.
  `connect-src 'self'${supabaseOrigin ? ` ${supabaseOrigin}` : ''}${isDev ? ' ws: http://localhost:*' : ''}`,
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // La cabecera `X-Powered-By` solo le dice a un atacante que stack corre.
  poweredByHeader: false,

  images: {
    // AVIF primero: los logos de patrocinadores y los iconos del kit son PNG
    // pesados y es donde mas bytes se ahorran.
    formats: ['image/avif', 'image/webp'],
    // Todo lo que renderiza el sitio es local (`public/`); no hay origen remoto
    // habilitado a proposito. Agregar uno es una decision explicita.
    remotePatterns: [],
  },

  // `typedRoutes` convierte un href roto en error de compilacion en vez de 404.
  typedRoutes: true,

  // `next build` corre desde la carpeta del proyecto. El porque, en turbopack-root.ts.
  turbopack: { root: turbopackRootFor(process.cwd()) },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
