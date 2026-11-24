import { render, screen } from '@testing-library/vue';

import CatalogTag from './CatalogTag.vue';

describe('CatalogTag', () => {
  it('links a keyword with its icon', () => {
    const { container } = render(CatalogTag, {
      props: { dimension: 'keyword', item: { code: 'manguezal', label: 'Manguezal', href: '/catalog/list?keyword=manguezal' } },
    });

    expect(screen.getByRole('link', { name: 'Manguezal' })).toHaveAttribute('href', '/catalog/list?keyword=manguezal');
    expect(container.querySelector('[data-icon="topic-mangrove"]')).not.toBeNull();
  });

  it('shows a sector as a small map, without a link when there is no href', () => {
    const { container } = render(CatalogTag, { props: { dimension: 'sector', item: { code: 'entrada', label: 'Entrada' } } });

    expect(screen.queryByRole('link')).toBeNull();
    expect(container.querySelector('[data-icon="sector-entrance"]')).not.toBeNull();
  });
});
