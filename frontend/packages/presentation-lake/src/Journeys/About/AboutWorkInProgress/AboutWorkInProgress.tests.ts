import { renderWithIntl } from '../../../../tests/renderWithIntl';

import { defaultMessages } from './AboutWorkInProgress.messages';
import AboutWorkInProgress from './AboutWorkInProgress.vue';

describe('AboutWorkInProgress', () => {
  it('says the content is on its way, and what is coming', () => {
    const { container } = renderWithIntl(AboutWorkInProgress, {
      descriptors: Object.values(defaultMessages),
      slots: { default: 'Fotos e textos chegam em breve.' },
    });
    expect(container.querySelector('[data-work-in-progress]')).toHaveTextContent('Em construçãoFotos e textos chegam em breve.');
  });
});
