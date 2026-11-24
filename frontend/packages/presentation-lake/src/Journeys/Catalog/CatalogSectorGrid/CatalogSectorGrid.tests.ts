import { fireEvent, screen } from '@testing-library/vue';

import { sectorVocabulary } from '../../../../tests/fixtures/catalog';
import { renderWithIntl } from '../../../../tests/renderWithIntl';

import { defaultMessages } from './CatalogSectorGrid.messages';
import CatalogSectorGrid from './CatalogSectorGrid.vue';

describe('CatalogSectorGrid', () => {
  it('keeps the bay order, links each sector and shows its map', () => {
    const items = [...sectorVocabulary].reverse().map((sector) => ({ ...sector, href: `/catalog/list?sector=${sector.code}` }));
    const { container } = renderWithIntl(CatalogSectorGrid, {
      locale: 'pt-BR',
      descriptors: Object.values(defaultMessages),
      props: { items, unknownCount: 2 },
    });

    expect([...container.querySelectorAll('[data-sector]')].map((tile) => tile.getAttribute('data-sector'))).toEqual([
      'interior',
      'transicao',
      'entrada',
      'baia-inteira',
      'fora-da-baia',
    ]);
    expect(screen.getByRole('link', { name: /Interior/ })).toHaveAttribute('href', '/catalog/list?sector=interior');
    expect(container.querySelector('[data-sector="entrada"] [data-icon="sector-entrance"]')).not.toBeNull();
    expect(screen.getByText('1 entrada')).toBeInTheDocument();
    expect(screen.getByTestId('sector-unknown')).toHaveTextContent('2 entradas sem setor confirmado');
  });

  it('emits select from buttons when selectable', async () => {
    const { emitted } = renderWithIntl(CatalogSectorGrid, {
      locale: 'pt-BR',
      descriptors: Object.values(defaultMessages),
      props: { items: sectorVocabulary, selectable: true },
    });

    expect(screen.queryByRole('link')).toBeNull();
    await fireEvent.click(screen.getByRole('button', { name: /Entrada/ }));
    expect(emitted('select')).toEqual([[sectorVocabulary[2]]]);
  });
});
