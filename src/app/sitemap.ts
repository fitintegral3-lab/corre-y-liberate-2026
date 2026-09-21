import { siteConfig } from '@/config/site';
import { event } from '@/content';
import { parseIsoDate } from '@/lib/format';

import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url,
      // La fecha del evento es lo ultimo que le importa a un buscador de esta
      // pagina: mientras no cambie, el contenido tampoco.
      lastModified: parseIsoDate(event.date),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
