import { screen } from '@testing-library/vue';

import { renderWithIntl } from '../../../../tests/renderWithIntl';
import { defaultMessages } from '../SiteHeader/SiteHeader.messages';

import SiteFooter from './SiteFooter.vue';

describe('SiteFooter', () => {
  it('renders the brand link and the App text', () => {
    renderWithIntl(SiteFooter, {
      props: { homeHref: '/' },
      slots: { default: 'Dados do mapeamento' },
      descriptors: [defaultMessages.brand],
    });

    expect(screen.getByRole('contentinfo')).toHaveTextContent('Dados do mapeamento');
    expect(screen.getByRole('link', { name: defaultMessages.brand.defaultMessage })).toHaveAttribute('href', '/');
  });
});
