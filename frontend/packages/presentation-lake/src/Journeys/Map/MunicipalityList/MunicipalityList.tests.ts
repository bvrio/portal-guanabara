import { fireEvent, screen } from '@testing-library/vue';

import { renderWithIntl } from '../../../../tests/renderWithIntl';
import { sampleMapMunicipalities } from '../fixtures';
import { mapMessages } from '../Map.messages';

import { defaultMessages } from './MunicipalityList.messages';
import MunicipalityList from './MunicipalityList.vue';

const descriptors = [...Object.values(defaultMessages), ...Object.values(mapMessages)];

describe('MunicipalityList', () => {
  it('lists the municipalities with entries and opens one', async () => {
    const { emitted } = renderWithIntl(MunicipalityList, {
      locale: 'pt-BR',
      descriptors,
      props: { municipalities: sampleMapMunicipalities },
    });

    const rows = screen.getAllByRole('button');
    expect(rows.map((row) => row.getAttribute('aria-label'))).toEqual([
      'Ver as entradas de Rio de Janeiro',
      'Ver as entradas de Niterói',
    ]);
    // Initiatives over studies (v0.9.5).
    expect(rows[1]).toHaveTextContent('Niterói1 iniciativa2 estudos3');
    expect([...rows[1]!.querySelectorAll('[data-kind]')].map((line) => line.getAttribute('data-kind'))).toEqual(['project', 'study']);
    expect(screen.getByRole('heading', { level: 3, name: 'Rio de Janeiro' })).toBeInTheDocument();

    await fireEvent.focus(rows[1]!);
    await fireEvent.click(rows[1]!);
    expect(emitted('update:highlighted')).toEqual([['niteroi']]);
    expect(emitted('select')).toEqual([[sampleMapMunicipalities[1]]]);
  });

  it('has a horizontal variation: tiles side by side', () => {
    const { container } = renderWithIntl(MunicipalityList, {
      locale: 'pt-BR',
      descriptors,
      props: { municipalities: sampleMapMunicipalities, layout: 'grid' },
    });
    const list = container.querySelector('[data-municipality-list]')!;
    expect(list).toHaveAttribute('data-layout', 'grid');
    expect(list.className).toMatch(/grid/);
    expect(list.querySelectorAll('button[data-municipality]')).toHaveLength(2);
  });
});
