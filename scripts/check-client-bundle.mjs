/**
 * Falla si un codigo de descuento aparece en el JavaScript que baja el navegador.
 *
 * Corre despues de `next build`. Los codigos se leen del fuente de
 * `src/lib/registration/payment-config.ts` y no de una lista copiada aca: si
 * se agrega uno, queda cubierto sin tocar este archivo. Existe porque el
 * 2026-09-28 los cuatro codigos aparecieron en `.next/static` por importarse
 * desde un modulo que tambien usaba un componente de cliente, y ninguna
 * prueba lo noto.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const config = fs.readFileSync(path.join(root, 'src/lib/registration/payment-config.ts'), 'utf8');
const codes = [...config.matchAll(/code:\s*'([A-Z0-9]+)'/g)].map((match) => match[1]);
if (codes.length === 0) {
  console.error(
    'check-client-bundle: no se encontro ningun codigo en payment-config.ts; revisar el patron.',
  );
  process.exit(1);
}

const staticDir = path.join(root, '.next', 'static');
if (!fs.existsSync(staticDir)) {
  console.error('check-client-bundle: no hay .next/static; corre `npm run build` antes.');
  process.exit(1);
}

const leaks = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(js|mjs|json|html|txt)$/.test(entry.name)) {
      const text = fs.readFileSync(full, 'utf8');
      for (const code of codes)
        if (text.includes(code)) leaks.push(`${code} en ${path.relative(root, full)}`);
    }
  }
};
walk(staticDir);

if (leaks.length > 0) {
  console.error(
    `check-client-bundle: codigos de descuento en el JavaScript del navegador:\n  ${leaks.join('\n  ')}`,
  );
  process.exit(1);
}
process.stdout.write(`check-client-bundle: ${codes.length} codigos revisados, ninguno llega al navegador.\n`);
