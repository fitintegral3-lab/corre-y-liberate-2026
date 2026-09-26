import { env } from '@/lib/env';

/**
 * Configuracion del sitio: lo que describe la publicacion, no el evento.
 *
 * El contenido del evento vive en `src/content/`. Aca van la URL canonica, los
 * canales externos y los creditos: cosas que cambian por razones distintas y
 * en momentos distintos.
 */
export const siteConfig = {
  name: 'Corre y Libérate',
  locale: 'es_CO',
  /** URL canonica del despliegue. Alimenta `metadataBase`, sitemap y Open Graph. */
  url: env.NEXT_PUBLIC_SITE_URL,

  links: {
    /** Plataforma externa de inscripciones. Es la conversion del sitio. */
    registration: 'https://cronometrajeinstantaneo.com/inscripciones/corre-y-liberate',
    instagram: 'https://www.instagram.com/correyliberate',
    whatsapp: 'https://wa.me/573001613479',
    /**
     * Pendiente: hoy apunta al inicio de Facebook y no a la pagina del evento.
     * Registrado en `ops/planning/HUMAN_ACTIONS.md` — necesita que la
     * organizacion entregue la URL real.
     */
    facebook: 'https://facebook.com',
  },
} as const;

export type SiteConfig = typeof siteConfig;
