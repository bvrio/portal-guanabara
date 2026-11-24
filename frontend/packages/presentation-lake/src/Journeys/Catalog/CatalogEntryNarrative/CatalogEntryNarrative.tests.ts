import { renderWithIntl } from '../../../../tests/renderWithIntl';

import { defaultMessages } from './CatalogEntryNarrative.messages';
import CatalogEntryNarrative from './CatalogEntryNarrative.vue';

const descriptors = Object.values(defaultMessages);
const narrative = {
  resultsSummary: 'Foram registrados de 160 a 1.000 itens/kg.',
  dataAvailability: 'Dados no artigo.',
  detailNotes: [{ label: 'Método', text: 'Amostragem com draga.' }],
};

describe('CatalogEntryNarrative', () => {
  it('shows the results as a callout in the colour of the entry kind', () => {
    const study = renderWithIntl(CatalogEntryNarrative, {
      locale: 'pt-BR',
      descriptors,
      props: { ...narrative, part: 'results', kind: 'study' },
    });
    const callout = study.container.querySelector('[data-section="results"]');
    expect(callout?.getAttribute('data-kind')).toBe('study');
    expect(callout?.textContent).toContain('160 a 1.000');
    // The notes are not part of the callout.
    expect(study.container.querySelector('[data-section="notes"]')).toBeNull();
  });

  it('keeps the mapping notes behind one closed disclosure', () => {
    const notes = renderWithIntl(CatalogEntryNarrative, {
      locale: 'pt-BR',
      descriptors,
      props: { ...narrative, part: 'notes' },
    });
    const details = notes.container.querySelector('details[data-section="notes"]') as HTMLDetailsElement | null;
    expect(details?.open).toBe(false);
    expect(details?.querySelector('summary')?.textContent).toContain('Ver detalhes do mapeamento');
    expect(details?.textContent).toContain('Amostragem com draga.');
    expect(notes.container.querySelector('[data-section="results"]')).toBeNull();
  });
});
