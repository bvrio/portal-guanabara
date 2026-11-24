import { fireEvent, screen } from '@testing-library/vue';

import { renderWithIntl } from '../../../../tests/renderWithIntl';
import { sampleMapSectors } from '../fixtures';
import { mapMessages } from '../Map.messages';

import { defaultMessages } from './BaySectorList.messages';
import BaySectorList from './BaySectorList.vue';

const descriptors = [...Object.values(defaultMessages), ...Object.values(mapMessages)];

describe('BaySectorList', () => {
  it('lists the sectors with entries, the whole bay included, and opens one', async () => {
    const { container, emitted } = renderWithIntl(BaySectorList, {
      locale: 'pt-BR',
      descriptors,
      props: { sectors: sampleMapSectors },
    });

    const rows = screen.getAllByRole('button');
    expect(rows.map((row) => row.getAttribute('aria-label'))).toEqual([
      'Ver as entradas do setor Interior',
      'Ver as entradas do setor Transição',
      'Ver as entradas do setor Baía inteira',
    ]);
    expect(rows[1]).toHaveTextContent('Transição0 iniciativas1 estudo1');
    expect(screen.getByRole('heading', { level: 3, name: 'Baía inteira' })).toBeInTheDocument();
    // Zones on the map get the dashed swatch; the whole bay does not.
    expect(container.querySelectorAll('[data-sector] [data-swatch]')).toHaveLength(3);

    await fireEvent.mouseEnter(rows[0]!);
    await fireEvent.click(rows[2]!);
    expect(emitted('update:highlighted')).toEqual([['interior']]);
    expect(emitted('select')).toEqual([[sampleMapSectors[2]]]);
  });
});
