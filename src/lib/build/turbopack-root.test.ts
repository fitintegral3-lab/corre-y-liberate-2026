import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

import { commonAncestor, turbopackRootFor } from '@/lib/build/turbopack-root';

describe('commonAncestor', () => {
  it('sube hasta la carpeta que contiene a las dos rutas', () => {
    expect(commonAncestor('/Users/ana/web/.copia', '/Users/ana/web/node_modules')).toBe(
      '/Users/ana/web',
    );
  });

  it('no confunde un prefijo de nombre con una carpeta que contiene', () => {
    expect(commonAncestor('/Users/ana/web', '/Users/ana/web-vieja/node_modules')).toBe('/Users/ana');
  });

  it('llega a la raiz del disco cuando no comparten nada mas', () => {
    expect(commonAncestor('/private/var/folders/x/ops-verify-1', '/Users/ana/web/node_modules')).toBe(
      '/',
    );
  });

  it('devuelve la propia ruta cuando la otra esta adentro', () => {
    expect(commonAncestor('/Users/ana/web', '/Users/ana/web/node_modules')).toBe('/Users/ana/web');
  });
});

describe('turbopackRootFor', () => {
  // Carpetas propias en el temporal del sistema y no el proyecto: la suite corre
  // tanto en el repositorio como en la copia del guard, donde node_modules es un
  // enlace, y el caso tiene que ser el mismo en los dos.
  const bench = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'turbopack-root-')));

  afterAll(() => {
    const tmp = fs.realpathSync(os.tmpdir());
    if (!bench.startsWith(tmp + path.sep)) {
      throw new Error(`no se borra ${bench}: no cuelga del temporal ${tmp}`);
    }
    fs.rmSync(bench, { recursive: true, force: true });
  });

  it('no toca la raiz cuando node_modules es una carpeta de verdad', () => {
    const project = path.join(bench, 'normal');
    fs.mkdirSync(path.join(project, 'node_modules'), { recursive: true });

    expect(turbopackRootFor(project)).toBeUndefined();
  });

  it('abarca proyecto y destino cuando node_modules es un enlace hacia afuera', () => {
    const real = path.join(bench, 'repo', 'web');
    const copy = path.join(bench, 'copia');
    fs.mkdirSync(path.join(real, 'node_modules'), { recursive: true });
    fs.mkdirSync(copy, { recursive: true });
    fs.symlinkSync(path.join(real, 'node_modules'), path.join(copy, 'node_modules'));

    expect(turbopackRootFor(copy)).toBe(bench);
  });
});
