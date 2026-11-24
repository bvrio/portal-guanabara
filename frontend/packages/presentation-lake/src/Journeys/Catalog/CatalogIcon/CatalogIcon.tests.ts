import { render, screen } from '@testing-library/vue';

import CatalogIcon from './CatalogIcon.vue';
import { catalogKeywordIcons, catalogSectorIcons } from './catalogIcons';

const glyphOf = (container: Element) => container.querySelector('svg')?.getAttribute('data-icon');
const toneOf = (container: Element) => container.querySelector('[data-tone]')?.getAttribute('data-tone');

describe('CatalogIcon', () => {
  it('draws the duo: a hand for projects, a lens for studies', () => {
    const project = render(CatalogIcon, { props: { kind: 'project' } });
    expect(glyphOf(project.container)).toBe('kind-project');
    expect(toneOf(project.container)).toBe('project');

    const study = render(CatalogIcon, { props: { kind: 'study', label: 'Estudo' } });
    expect(screen.getByRole('img', { name: 'Estudo' })).toHaveAttribute('data-icon', 'kind-study');
    expect(toneOf(study.container)).toBe('study');
  });

  it('maps the five bay sectors and falls back to a map pin', () => {
    expect(Object.keys(catalogSectorIcons)).toEqual([
      'interior',
      'transicao',
      'entrada',
      'baia-inteira',
      'fora-da-baia',
    ]);

    const inner = render(CatalogIcon, { props: { sector: 'interior' } });
    expect(glyphOf(inner.container)).toBe('sector-inner');

    const unknown = render(CatalogIcon, { props: { sector: 'nova-zona' } });
    expect(glyphOf(unknown.container)).toBe('map-pin');
  });

  it('colours keywords by category and keeps unknown keywords neutral', () => {
    const mangrove = render(CatalogIcon, { props: { keyword: 'manguezal' } });
    expect(glyphOf(mangrove.container)).toBe('topic-mangrove');
    expect(toneOf(mangrove.container)).toBe('environment');

    const litter = render(CatalogIcon, { props: { keyword: 'macrolixo' } });
    expect(toneOf(litter.container)).toBe('waste');

    const unknown = render(CatalogIcon, { props: { keyword: 'novo-termo' } });
    expect(glyphOf(unknown.container)).toBe('tag');
    expect(toneOf(unknown.container)).toBe('other');
  });

  it('covers the twenty keywords of the vocabulary across five categories', () => {
    const specs = Object.values(catalogKeywordIcons);

    expect(specs).toHaveLength(20);
    expect(new Set(specs.map((spec) => spec.icon)).size).toBe(20);
    expect(new Set(specs.map((spec) => spec.topic))).toEqual(
      new Set(['waste', 'environment', 'biota', 'physical', 'social']),
    );
  });
});
