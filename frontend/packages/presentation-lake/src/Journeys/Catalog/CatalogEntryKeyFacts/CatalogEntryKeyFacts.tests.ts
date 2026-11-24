import { renderWithIntl } from '../../../../tests/renderWithIntl';
import { catalogLabelMessages } from '../Catalog.messages';
import { defaultMessages as periodMessages } from '../CatalogPeriod/CatalogPeriod.messages';

import { defaultMessages } from './CatalogEntryKeyFacts.messages';
import CatalogEntryKeyFacts from './CatalogEntryKeyFacts.vue';

const descriptors = [...catalogLabelMessages, ...Object.values(defaultMessages), ...Object.values(periodMessages)];

describe('CatalogEntryKeyFacts', () => {
  it('says when, where and the ID in one strip, shortening long lists', () => {
    const { container } = renderWithIntl(CatalogEntryKeyFacts, {
      locale: 'pt-BR',
      descriptors,
      props: {
        refId: 1,
        start: { date: '2021-12-01', precision: 'month' },
        end: null,
        ongoing: true,
        municipalities: ['Rio de Janeiro', 'Niterói', 'São Gonçalo', 'Magé', 'Itaboraí'],
        sectors: [{ code: 'interior', label: 'Interior' }],
      },
    });
    const fact = (name: string) => container.querySelector(`[data-fact="${name}"] dd`);
    expect(fact('municipalities')).toHaveTextContent('Rio de Janeiro, Niterói, São Gonçalo e mais 2');
    expect(fact('sectors')).toHaveTextContent('Interior');
    expect(fact('reference')).toHaveTextContent('ID 1');
    expect(container.querySelector('[data-fact="when"] dt')).toHaveTextContent('Período');
  });

  it('shows the publication years of a study instead of its period', () => {
    const { container } = renderWithIntl(CatalogEntryKeyFacts, {
      locale: 'pt-BR',
      descriptors,
      props: { refId: 36, start: null, end: null, ongoing: false, municipalities: [], sectors: [], publicationYears: [2019] },
    });
    expect(container.querySelector('[data-fact="when"] dd')).toHaveTextContent('Publicado em 2019');
    expect(container.querySelector('[data-fact="municipalities"]')).toBeNull();
  });

  it('shows only the parts asked for, one per line when stacked', () => {
    const { container } = renderWithIntl(CatalogEntryKeyFacts, {
      locale: 'pt-BR',
      descriptors,
      props: {
        municipalities: ['São Gonçalo', 'Rio de Janeiro'],
        sectors: [{ code: 'interior', label: 'Interior' }],
        parts: ['municipalities', 'sectors'],
        layout: 'stack',
      },
    });
    expect([...container.querySelectorAll('[data-fact]')].map((node) => node.getAttribute('data-fact'))).toEqual([
      'municipalities',
      'sectors',
    ]);
    expect(container.querySelector('[data-fact="municipalities"] dd')).toHaveTextContent('São Gonçalo e Rio de Janeiro');
  });

  it('puts the facts side by side in a row', () => {
    const { container } = renderWithIntl(CatalogEntryKeyFacts, {
      locale: 'pt-BR',
      descriptors,
      props: {
        municipalities: ['Niterói'],
        sectors: [{ code: 'entrada', label: 'Entrada' }],
        parts: ['municipalities', 'sectors'],
        layout: 'row',
      },
    });
    const list = container.querySelector('[data-key-facts]')!;
    expect(list).toHaveAttribute('data-layout', 'row');
    expect(list.getAttribute('class')).toContain('row');
    expect([...list.querySelectorAll('[data-fact]')].map((node) => node.getAttribute('data-fact'))).toEqual([
      'municipalities',
      'sectors',
    ]);
  });
});
