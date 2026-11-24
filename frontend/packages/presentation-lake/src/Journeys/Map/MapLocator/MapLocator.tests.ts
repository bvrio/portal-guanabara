import { renderWithIntl } from '../../../../tests/renderWithIntl';
import { sampleMapBounds, sampleMapMunicipalities, sampleMapSectors } from '../fixtures';

import MapLocator from './MapLocator.vue';

describe('MapLocator', () => {
  it('fills the given municipalities, tints the given sectors and names itself', () => {
    const { container } = renderWithIntl(MapLocator, {
      props: {
        bounds: sampleMapBounds,
        municipalities: sampleMapMunicipalities,
        sectors: sampleMapSectors,
        highlighted: ['niteroi'],
        highlightedSectors: ['interior', 'baia-inteira'],
        tone: 'study',
        label: 'Mapa: Niterói; setor Interior',
      },
    });
    const svg = container.querySelector('[data-map-locator]')!;
    expect(svg).toHaveAttribute('role', 'img');
    expect(svg).toHaveAttribute('aria-label', 'Mapa: Niterói; setor Interior');
    expect([...svg.querySelectorAll('[data-municipality]')].map((path) => path.getAttribute('data-municipality'))).toEqual(['niteroi']);
    // Only sectors with a zone are drawn ("Baía inteira" has none).
    expect([...svg.querySelectorAll('[data-sector]')].map((path) => path.getAttribute('data-sector'))).toEqual(['interior']);
    expect(svg.getAttribute('class')).toContain('study');
  });

  it("paints the municipalities in the Mapa's green by default", () => {
    const { container } = renderWithIntl(MapLocator, {
      props: {
        bounds: sampleMapBounds,
        municipalities: sampleMapMunicipalities,
        highlighted: ['niteroi'],
        label: 'Mapa: Niterói',
      },
    });
    const svg = container.querySelector('[data-map-locator]')!;
    expect(svg.getAttribute('class')).toContain('place');
    expect(svg.getAttribute('class')).not.toContain('project');
  });
});
