import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import HomePage from '@/app/page';
import { offSeason } from '@/content';

describe('inicio entre ediciones', () => {
  const html = renderToStaticMarkup(createElement(HomePage));

  it('está activo para 2026', () => {
    expect(offSeason.active).toBe(true);
  });

  it('anuncia la preparación de 2027 con resultados, fotos, encuesta y Súmate', () => {
    expect(html).toContain('En preparativos para Corre y Libérate 2027');
    expect(html).toContain(
      'href="https://cronometrajeinstantaneo.com/resultados/corre-y-liberate/categorias?r=1"',
    );
    expect(html).toContain('href="/encuesta"');
    expect(html).toContain('href="/sumate"');
    expect(html).toContain(
      'href="https://drive.google.com/drive/folders/1wAN-aUvih1MPXtcATfC3Z0wTbZcT39Ub"',
    );
  });

  it('ya no muestra la landing de la carrera ni invita a inscribirse', () => {
    expect(html).not.toMatch(/inscr[ií]bete/i);
    expect(html).not.toContain('href="/inscripcion"');
    expect(html).not.toContain('id="feria-empresarial"');
    expect(html).not.toContain('"@type":"SportsEvent"');
  });
});
