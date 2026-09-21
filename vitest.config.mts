import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // El dominio y los formateadores son codigo puro: no necesitan DOM.
    // Cuando entren pruebas de componentes, se agrega un proyecto con jsdom.
    environment: 'node',
    include: ['src/**/*.test.ts'],
    reporters: ['default'],
  },
});
