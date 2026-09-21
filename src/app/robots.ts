import { siteConfig } from '@/config/site';
import { isProduction } from '@/lib/env';

import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Las previews de `development` comparten contenido con produccion. Dejarlas
  // indexar las pondria a competir con el sitio real por las mismas busquedas.
  if (!isProduction) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: new URL('/sitemap.xml', siteConfig.url).toString(),
  };
}
