import { fireEvent, screen } from '@testing-library/vue';

import { keywordBuckets } from '../../../../tests/fixtures/catalog';
import { renderWithIntl } from '../../../../tests/renderWithIntl';

import { kindPluralMessages } from '../Catalog.messages';

import { defaultMessages } from './CatalogDistribution.messages';
import CatalogDistribution from './CatalogDistribution.vue';

const descriptors = Object.values(defaultMessages);

describe('CatalogDistribution', () => {
  it('shows the top categories, summarizes the rest and counts unknowns apart', () => {
    renderWithIntl(CatalogDistribution, {
      descriptors,
      props: { items: keywordBuckets, limit: 5, unknownCount: 3 },
      slots: { title: 'Palavras-chave' },
    });

    expect(screen.getByRole('region', { name: 'Palavras-chave' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    expect(screen.getByText('Mais 5 categorias com menos entradas')).toBeInTheDocument();
    expect(screen.getByTestId('distribution-unknown')).toHaveTextContent('3 entradas sem informação confirmada');
  });

  it('splits bars into initiatives and studies, with a legend and the parts in words', () => {
    const { container } = renderWithIntl(CatalogDistribution, {
      descriptors: [...descriptors, ...Object.values(kindPluralMessages)],
      locale: 'pt-BR',
      props: {
        tone: 'kinds',
        items: [
          { id: 'macrolixo', label: 'Macrolixo', value: 28, href: '/catalog?keyword=macrolixo', projects: 20, studies: 8 },
          { id: 'fauna', label: 'Fauna', value: 6, href: '/catalog?keyword=fauna', projects: 6, studies: 0 },
        ],
      },
      slots: { title: 'Palavras-chave' },
    });

    const legend = container.querySelector('[data-distribution-legend]');
    expect(legend).toHaveTextContent('Iniciativas');
    expect(legend).toHaveTextContent('Estudos');
    expect(screen.getByRole('link', { name: /Macrolixo/ })).toHaveTextContent('(20 iniciativas e 8 estudos)');
    expect(screen.getByRole('link', { name: /Fauna/ })).toHaveTextContent('(6 iniciativas)');
    expect(container.querySelectorAll('[data-item="macrolixo"] [aria-hidden="true"] > span')).toHaveLength(2);
  });

  it('paints a chart of one kind in its colour, without a legend', () => {
    const { container } = renderWithIntl(CatalogDistribution, {
      descriptors,
      props: { tone: 'study', items: keywordBuckets.slice(0, 2) },
      slots: { title: 'Estudos por academia' },
    });
    expect(container.querySelector('[data-distribution-legend]')).toBeNull();
    const bar = container.querySelector<HTMLElement>('[aria-hidden="true"][style]');
    expect(bar?.style.getPropertyValue('--bar-color')).toBe('var(--color-kind-study)');
  });

  it('emits the item it was given when a selectable row is chosen', async () => {
    const items = [{ id: 'uff', label: 'UFF', value: 8, projects: 0, studies: 8 }];
    const { emitted } = renderWithIntl(CatalogDistribution, {
      descriptors,
      props: { tone: 'kinds', items, selectable: true },
      slots: { title: 'Academia' },
    });
    await fireEvent.click(screen.getByRole('button', { name: /UFF/ }));
    expect(emitted('select')).toEqual([[items[0]]]);
  });

  it('says when no entry has the information', () => {
    renderWithIntl(CatalogDistribution, { descriptors, props: { items: [] }, slots: { title: 'Setores' } });
    expect(screen.getByText(defaultMessages.empty.defaultMessage as string)).toBeInTheDocument();
  });
});
