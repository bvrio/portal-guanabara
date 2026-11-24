import { renderWithIntl } from '../../../../tests/renderWithIntl';
import { catalogLabelMessages } from '../Catalog.messages';

import { defaultMessages } from './CatalogEntryFacts.messages';
import CatalogEntryFacts from './CatalogEntryFacts.vue';

const descriptors = [...catalogLabelMessages, ...Object.values(defaultMessages)];

const facts = {
  start: { date: '2021-12-01', precision: 'month' as const },
  end: null,
  ongoing: true,
  periodicity: ['continuous' as const],
  mechanisms: [{ code: 'limpeza', label: 'Limpeza' }],
  siteTypes: [{ code: 'manguezal', label: 'Manguezal' }],
  keywords: [{ code: 'macrolixo', label: 'Macrolixo' }],
  indicators: ['Massa (t)'],
  places: [{ type: 'municipality' as const, names: ['Rio de Janeiro'] }],
  sectors: [{ code: 'interior', label: 'Interior' }],
};

describe('CatalogEntryFacts', () => {
  it('splits the facts into where and what, without repeating the period', () => {
    const where = renderWithIntl(CatalogEntryFacts, { locale: 'pt-BR', descriptors, props: { ...facts, group: 'where' } });
    expect(where.container.querySelector('[data-place-type="sector"]')).not.toBeNull();
    expect(where.container.querySelector('[data-place-type="municipality"]')).toHaveTextContent('Rio de Janeiro');
    expect(where.container.textContent).not.toContain('Limpeza');
    expect(where.container.textContent).not.toContain(defaultMessages.period.defaultMessage as string);

    const what = renderWithIntl(CatalogEntryFacts, { locale: 'pt-BR', descriptors, props: { ...facts, group: 'what' } });
    expect(what.container.textContent).toContain('Limpeza');
    expect(what.container.querySelector('[data-mechanism-icon="glyph"] svg')).not.toBeNull();
    expect(what.container.querySelector('[data-place-type]')).toBeNull();
  });
});
