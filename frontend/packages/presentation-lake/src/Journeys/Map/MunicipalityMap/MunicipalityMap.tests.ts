import { fireEvent, screen } from '@testing-library/vue';

import { renderWithIntl } from '../../../../tests/renderWithIntl';
import { sampleMapBounds, sampleMapMunicipalities, sampleMapSectors } from '../fixtures';
import { mapMessages } from '../Map.messages';

import { defaultMessages } from './MunicipalityMap.messages';
import MunicipalityMap from './MunicipalityMap.vue';

const descriptors = [...Object.values(defaultMessages), ...Object.values(mapMessages)];

const markers = (container: Element, selector: string) =>
  [...container.querySelectorAll(`${selector} [data-marker]`)].map((marker) => [
    marker.getAttribute('data-marker'),
    marker.textContent,
    Number(marker.querySelector('circle')?.getAttribute('r')),
  ]);

describe('MunicipalityMap', () => {
  it('shades the municipalities green by entries, greys the neighbours and opens one on click or Enter', async () => {
    const { container, emitted } = renderWithIntl(MunicipalityMap, {
      locale: 'pt-BR',
      descriptors,
      props: { bounds: sampleMapBounds, municipalities: sampleMapMunicipalities },
    });

    expect(screen.getByRole('group', { name: defaultMessages.label.defaultMessage })).toBeInTheDocument();
    const rio = screen.getByRole('button', { name: 'Rio de Janeiro: 22 entradas' });
    const niteroi = screen.getByRole('button', { name: 'Niterói: 3 entradas' });
    expect(screen.queryByRole('button', { name: /Magé/ })).toBeNull();
    expect(container.querySelectorAll('path[aria-hidden="true"]')).toHaveLength(1);
    // 12 initiatives is the busiest class; 1 initiative the lightest.
    // Green, not a kind colour (v0.9.5): 22 entries → darkest step, 3 → second.
    expect(rio.getAttribute('style')).toContain('--color-map-place-4');
    expect(niteroi.getAttribute('style')).toContain('--color-map-place-2');

    await fireEvent.click(niteroi);
    await fireEvent.keyDown(rio, { key: 'Enter' });
    // A marker adds its kind (v0.9.6).
    await fireEvent.click(rio.querySelector('[data-marker="study"]')!);
    await fireEvent.click(rio.querySelector('[data-marker="project"]')!);
    expect(emitted('select')).toEqual([
      [sampleMapMunicipalities[1]],
      [sampleMapMunicipalities[0]],
      [sampleMapMunicipalities[0], 'study'],
      [sampleMapMunicipalities[0], 'project'],
    ]);
  });

  it('names each municipality with entries over its markers; a long name gives way to its short one', () => {
    const municipalities = [
      ...sampleMapMunicipalities,
      { code: 'sao-joao-de-meriti', name: 'São João de Meriti', shortName: 'S.J. Meriti', entries: 1, projects: 1, studies: 0, geometry: sampleMapMunicipalities[1]!.geometry },
    ];
    const { container } = renderWithIntl(MunicipalityMap, {
      locale: 'pt-BR',
      descriptors,
      props: { bounds: sampleMapBounds, municipalities },
    });
    const names = [...container.querySelectorAll('[data-municipality-name]')].map((node) => [node.getAttribute('data-municipality-name'), node.textContent?.trim()]);
    // Magé has no entries: grey context, no name.
    expect(names).toEqual([
      ['rio-de-janeiro', 'Rio de Janeiro'],
      ['niteroi', 'Niterói'],
      ['sao-joao-de-meriti', 'S.J. Meriti'],
    ]);
    expect(container.querySelector('[data-municipality-name]')?.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('counts initiatives on the orange badge and studies in a purple circle that grows with them', () => {
    const { container } = renderWithIntl(MunicipalityMap, {
      locale: 'pt-BR',
      descriptors,
      props: { bounds: sampleMapBounds, municipalities: sampleMapMunicipalities },
    });
    const rio = markers(container, '[data-municipality="rio-de-janeiro"]');
    const niteroi = markers(container, '[data-municipality="niteroi"]');
    expect(rio.map(([kind, count]) => [kind, count])).toEqual([
      ['project', '12'],
      ['study', '10'],
    ]);
    expect(niteroi.map(([kind, count]) => [kind, count])).toEqual([
      ['project', '1'],
      ['study', '2'],
    ]);
    // Same badge for initiatives; a bigger circle for more studies.
    expect(rio[0]![2]).toBe(niteroi[0]![2]);
    expect(rio[1]![2]).toBeGreaterThan(niteroi[1]![2] as number);
  });

  it('names the municipality under the pointer and keeps the highlight in the model', async () => {
    const { container, emitted } = renderWithIntl(MunicipalityMap, {
      locale: 'pt-BR',
      descriptors,
      props: { bounds: sampleMapBounds, municipalities: sampleMapMunicipalities },
    });
    const caption = container.querySelector('[data-map-caption]')!;
    expect(caption).toHaveTextContent(defaultMessages.hint.defaultMessage as string);

    await fireEvent.mouseEnter(screen.getByRole('button', { name: 'Niterói: 3 entradas' }));
    expect(emitted('update:highlighted')).toEqual([['niteroi']]);
  });

  it('draws the bay sectors that have a zone, with their name and markers, and opens one', async () => {
    const { container, emitted } = renderWithIntl(MunicipalityMap, {
      locale: 'pt-BR',
      descriptors,
      props: { bounds: sampleMapBounds, municipalities: sampleMapMunicipalities, sectors: sampleMapSectors },
    });

    const interior = screen.getByRole('button', { name: 'Setor Interior: 13 entradas' });
    expect(screen.getByRole('button', { name: 'Setor Transição: 1 entrada' })).toBeInTheDocument();
    // "Baía inteira" is not one area: listed beside the map, not drawn.
    // The whole bay has no zone: it is a pill over the sea, not an svg group (v0.9.9).
    expect(container.querySelector('g[data-sector="baia-inteira"]')).toBeNull();
    expect(container.querySelector('[data-sector-label="interior"]')).toHaveTextContent('Interior');
    expect(markers(container, '[data-sector-label="interior"]').map(([kind, count]) => [kind, count])).toEqual([
      ['project', '8'],
      ['study', '5'],
    ]);
    // No initiatives in Transição: only its purple circle.
    expect(markers(container, '[data-sector-label="transicao"]').map(([kind]) => kind)).toEqual(['study']);

    await fireEvent.focus(interior);
    expect(emitted('update:highlightedSector')).toEqual([['interior']]);
    await fireEvent.keyDown(interior, { key: ' ' });
    expect(emitted('selectSector')).toEqual([[sampleMapSectors[0]]]);
  });

  it('shows the highlighted place and a legend of entries, initiatives, studies and sectors', () => {
    const { container } = renderWithIntl(MunicipalityMap, {
      locale: 'pt-BR',
      descriptors,
      props: {
        bounds: sampleMapBounds,
        municipalities: sampleMapMunicipalities,
        sectors: sampleMapSectors,
        highlighted: 'rio-de-janeiro',
      },
    });
    // The caption (v0.9.9): the place's colour, initiatives over studies, no total.
    const caption = container.querySelector('[data-map-caption]')!;
    // A big number and its word on each line (v0.9.13).
    expect(caption).toHaveTextContent('Rio de Janeiro');
    expect(caption.querySelector('[data-caption-kind="project"]')).toHaveTextContent(/^12\s*iniciativas$/);
    expect(caption.querySelector('[data-caption-kind="study"]')).toHaveTextContent(/^10\s*estudos$/);
    expect(caption.getAttribute('style')).toContain('--caption-fill: var(--color-map-place-4)');
    expect([...caption.querySelectorAll('[data-caption-kind]')].map((line) => line.getAttribute('data-caption-kind'))).toEqual([
      'project',
      'study',
    ]);
    const legend = [...container.querySelectorAll('figcaption li')].map((item) => item.textContent?.trim());
    expect(legend).toEqual(['1–2', '3–5', '6–10', '11–22', '', '1', '10', 'Sem entradas', 'Baía e mar', 'Setores da baía']);
    expect(container.querySelector('figcaption')).toHaveTextContent(/Entradas.*Iniciativas.*Estudos/);
    expect(container.querySelector('[data-legend-projects] circle')).not.toBeNull();
  });

  it('puts the whole bay on a pill over the sea; its markers open their kind', async () => {
    const { container, emitted } = renderWithIntl(MunicipalityMap, {
      locale: 'pt-BR',
      descriptors,
      props: { bounds: sampleMapBounds, municipalities: sampleMapMunicipalities, sectors: sampleMapSectors },
    });
    const whole = container.querySelector('button[data-sector="baia-inteira"]') as HTMLElement;
    expect(whole).toHaveTextContent('Baía inteira35');
    await fireEvent.mouseEnter(whole);
    expect(emitted('update:highlightedSector')).toEqual([['baia-inteira']]);
    await fireEvent.click(whole.querySelector('[data-marker="study"]')!);
    await fireEvent.click(whole);
    expect(emitted('selectSector')).toEqual([[sampleMapSectors[2], 'study'], [sampleMapSectors[2]]]);
  });
});
