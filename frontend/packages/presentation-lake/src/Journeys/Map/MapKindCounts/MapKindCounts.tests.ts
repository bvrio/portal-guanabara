import { renderWithIntl } from '../../../../tests/renderWithIntl';
import { mapMessages } from '../Map.messages';

import MapKindCounts from './MapKindCounts.vue';

describe('MapKindCounts', () => {
  it('stacks initiatives over studies, each with its kind', () => {
    const { container } = renderWithIntl(MapKindCounts, {
      locale: 'pt-BR',
      descriptors: Object.values(mapMessages),
      props: { projects: 12, studies: 0 },
    });
    const lines = [...container.querySelectorAll('[data-kind]')];
    expect(lines.map((line) => line.getAttribute('data-kind'))).toEqual(['project', 'study']);
    expect(lines.map((line) => line.textContent?.trim())).toEqual(['12 iniciativas', '0 estudos']);
  });
});
