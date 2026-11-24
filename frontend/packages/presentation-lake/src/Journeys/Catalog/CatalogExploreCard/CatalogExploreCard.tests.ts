import { screen } from '@testing-library/vue';

import { renderWithIntl } from '../../../../tests/renderWithIntl';

import CatalogExploreCard from './CatalogExploreCard.vue';

describe('CatalogExploreCard', () => {
  it('links with its tone, icon, title, line and count', () => {
    const { container } = renderWithIntl(CatalogExploreCard, {
      locale: 'pt-BR',
      props: { tone: 'place', href: '/map', count: 8, headingLevel: 3 },
      slots: { title: 'Municípios', line: 'Com atuação em volta da Baía de Guanabara' },
    });
    const card = container.querySelector('[data-explore="place"]')!;
    expect(card).toHaveAttribute('href', '/map');
    expect(card).toHaveTextContent('8');
    expect(card.querySelector('[data-explore-icon] [data-icon="map"]')).not.toBeNull();
    expect(screen.getByRole('heading', { level: 3, name: 'Municípios' })).toBeInTheDocument();
  });

  it('draws the kinds with their own icons', () => {
    const { container } = renderWithIntl(CatalogExploreCard, {
      props: { tone: 'study', href: '/catalog?kind=study', count: 17 },
      slots: { title: 'Estudos' },
    });
    expect(container.querySelector('[data-explore="study"] [data-icon="kind-study"]')).not.toBeNull();
    expect(container.querySelector('[data-explore-icon]')).toBeNull();
  });

  it('draws institutions with the institution icon', () => {
    const { container } = renderWithIntl(CatalogExploreCard, {
      props: { tone: 'institution', href: '/institutions', count: 63 },
      slots: { title: 'Instituições' },
    });
    expect(container.querySelector('[data-explore="institution"] [data-icon="institution"]')).not.toBeNull();
  });
});
