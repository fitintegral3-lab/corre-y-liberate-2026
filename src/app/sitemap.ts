import { siteConfig } from '@/config/site';
import { event } from '@/content';
import { parseIsoDate } from '@/lib/format';
import { receiptsConfig } from '@/lib/gcs/receipts';
import { supabaseConfig } from '@/lib/supabase/config';

import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // La fecha del evento es lo ultimo que le importa a un buscador de estas
  // paginas: mientras no cambie, el contenido tampoco.
  const lastModified = parseIsoDate(event.date);
  const entries: MetadataRoute.Sitemap = [
    { url: siteConfig.url, lastModified, changeFrequency: 'weekly', priority: 1 },
  ];

  // /inscripcion responde 404 sin base de datos o sin bucket de comprobantes:
  // se anuncia con la misma condicion con que la pagina existe.
  if (supabaseConfig() && receiptsConfig()) {
    entries.push({
      url: new URL('/inscripcion', siteConfig.url).toString(),
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    });
  }
  return entries;
}
