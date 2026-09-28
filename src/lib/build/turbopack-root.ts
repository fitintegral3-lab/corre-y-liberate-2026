import fs from 'node:fs';
import path from 'node:path';

/**
 * Carpeta mas profunda que contiene a las dos rutas. Ambas deben ser absolutas
 * y ya resueltas (`realpath`): comparar `/var` contra `/private/var` daria una
 * raiz de mas.
 */
export function commonAncestor(a: string, b: string): string {
  let candidate = a;
  while (b !== candidate && !b.startsWith(candidate.endsWith(path.sep) ? candidate : candidate + path.sep)) {
    const parent = path.dirname(candidate);
    if (parent === candidate) break;
    candidate = parent;
  }
  return candidate;
}

/**
 * Raiz para Turbopack cuando `node_modules` es un enlace; `undefined` si no lo es.
 *
 * Turbopack no resuelve nada fuera de su raiz, y un `node_modules` enlazado que
 * apunta afuera lo hace entrar en panico ("Symlink ... points out of the
 * filesystem root"). Es lo que pasa en la copia que el guard de commit arma en
 * el temporal del sistema: enlaza `node_modules` al proyecto real, y ahi no hay
 * ningun lockfile arriba con el que Next pueda deducir una raiz mas amplia.
 * La documentacion de Next 16 pide para los enlaces justo esto: una raiz que
 * contenga al proyecto y a lo enlazado.
 *
 * Con `node_modules` normal devuelve `undefined` y Next sigue detectando la raiz
 * solo, asi que el build de siempre no cambia.
 */
export function turbopackRootFor(projectDir: string): string | undefined {
  const modules = path.join(projectDir, 'node_modules');
  if (!fs.lstatSync(modules, { throwIfNoEntry: false })?.isSymbolicLink()) return undefined;
  return commonAncestor(fs.realpathSync(projectDir), fs.realpathSync(modules));
}
