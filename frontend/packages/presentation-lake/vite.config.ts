import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// Used by Storybook (and extended by Vitest) to compile Vue SFCs.
export default defineConfig({
  plugins: [vue()],
});
