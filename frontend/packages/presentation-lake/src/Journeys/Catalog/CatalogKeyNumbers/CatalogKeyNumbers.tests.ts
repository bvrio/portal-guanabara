import { fireEvent, screen } from '@testing-library/vue';

import { totals } from '../../../../tests/fixtures/catalog';
import { renderWithIntl } from '../../../../tests/renderWithIntl';

import { defaultMessages } from './CatalogKeyNumbers.messages';
import CatalogKeyNumbers from './CatalogKeyNumbers.vue';

describe('CatalogKeyNumbers', () => {
  it('renders three figures that open something: links or selections', async () => {
    const { container, emitted } = renderWithIntl(CatalogKeyNumbers, {
      descriptors: Object.values(defaultMessages),
      props: { totals, hrefs: { institutions: '/institutions' } },
    });

    expect(screen.getByRole('region', { name: defaultMessages.title.defaultMessage as string })).toBeInTheDocument();
    expect(container.querySelector('[data-stat="entries"]')).toBeNull();
    expect(container.querySelector('[data-stat="active-projects"]')).toHaveTextContent('de 24 iniciativas mapeadas');
    expect(screen.getByRole('link', { name: /Instituições envolvidas/ })).toHaveAttribute('href', '/institutions');

    await fireEvent.click(screen.getByRole('button', { name: /Iniciativas ativas/ }));
    await fireEvent.click(screen.getByRole('button', { name: /Municípios com atuação/ }));
    expect(emitted('select')).toEqual([['activeProjects'], ['municipalities']]);
  });

  it('shows only the tiles asked for', () => {
    const { container } = renderWithIntl(CatalogKeyNumbers, {
      descriptors: Object.values(defaultMessages),
      props: { totals, show: ['institutions', 'municipalities'], hrefs: { institutions: '/institutions', municipalities: '/map' } },
    });
    expect([...container.querySelectorAll('[data-stat]')].map((tile) => tile.getAttribute('data-stat'))).toEqual([
      'institutions',
      'municipalities',
    ]);
    expect(screen.getByRole('link', { name: /Municípios com atuação/ })).toHaveAttribute('href', '/map');
  });
});
