import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'next-env.d.ts',
    // Instancia de Cauce y wiring del runner: codigo generado desde la dependencia
    // @ingeniomaps/cauce y reescrito por `npm run ops -- automation install`.
    // Lintearlo solo produce ruido sobre archivos que nadie edita a mano.
    'ops/**',
    '.claude/**',
  ]),
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // El `_` como prefijo es la marca explicita de "esto no se usa y es a proposito".
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      // Un console.log olvidado viaja al bundle del cliente; warn/error son intencionales.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../*'],
              message:
                'Usa el alias `@/` en vez de subir dos o mas niveles: mover el archivo no debe romper el import.',
            },
          ],
        },
      ],
    },
  },
]);
