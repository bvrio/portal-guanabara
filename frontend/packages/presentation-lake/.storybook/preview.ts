import { setup, type Preview } from '@storybook/vue3-vite';
import { createIntl } from 'vue-intl';

import '../src/Shared/foundations/styles/index.scss';

setup((app) => {
  // Product copy is pt-BR; default messages render as-is.
  app.use(createIntl({ locale: 'pt-BR', defaultLocale: 'pt-BR', messages: {} }));
});

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },
};

export default preview;
