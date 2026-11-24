import { fileURLToPath } from 'node:url';

import { defineVitestProject } from '@nuxt/test-utils/config';
import { defineConfig } from 'vitest/config';

/**
 * Two projects:
 *
 * - `unit`  — framework-independent units (Services, lib, page models, server
 *   helpers) in plain Node, with `#imports` stubbed. Colocated `X.tests.ts`.
 * - `nuxt`  — Hooks and Pages inside a real Nuxt runtime (@nuxt/test-utils):
 *   `tests/nuxt/**\/X.nuxt.tests.ts`, endpoints served by the real server
 *   handlers through `registerEndpoint`.
 */
export default defineConfig({
  test: {
    projects: [
      {
        resolve: {
          alias: {
            '~': fileURLToPath(new URL('./src', import.meta.url)),
            '#imports': fileURLToPath(new URL('./tests/stubs/nuxt-imports.ts', import.meta.url)),
          },
        },
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.tests.ts', 'server/**/*.tests.ts'],
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          environment: 'nuxt',
          include: ['tests/nuxt/**/*.nuxt.tests.ts'],
          environmentOptions: {
            nuxt: { domEnvironment: 'happy-dom' },
          },
        },
      }),
    ],
  },
});
