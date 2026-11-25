import { describe, expect, it } from 'vitest';

import { buildSiteMetadata } from '@/lib/seo/metadata';

describe('metadatos entre ediciones', () => {
  const metadata = buildSiteMetadata();
  const descriptions = [
    metadata.description,
    metadata.openGraph?.description,
    metadata.twitter?.description,
  ].map(String);

  it('las vistas previas anuncian los preparativos de 2027', () => {
    for (const text of descriptions) expect(text).toContain('Corre y Libérate 2027');
  });

  it('ya no invitan a inscribirse a la carrera que pasó', () => {
    for (const text of descriptions) {
      expect(text).not.toMatch(/inscr[ií]bete|asegura tu cupo/i);
    }
  });
});
