import type { StorybookConfig } from '@storybook/vue3-vite';

const config: StorybookConfig = {
  // Shared units carry stories; Journey patterns may add them (e.g. Catalog).
  stories: ['../src/Shared/**/*.stories.ts', '../src/Journeys/**/*.stories.ts'],
  addons: [],
  framework: '@storybook/vue3-vite',
};

export default config;
