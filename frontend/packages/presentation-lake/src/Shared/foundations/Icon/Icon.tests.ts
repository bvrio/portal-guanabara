import { render, screen } from '@testing-library/vue';

import Icon from './Icon.vue';
import { iconGlyphs, iconGroups, type IconName } from './glyphs';

describe('Icon', () => {
  it('is decorative by default', () => {
    const { container } = render(Icon, { props: { name: 'search' } });
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).not.toHaveAttribute('role');
    expect(svg).toHaveAttribute('width', '24');
  });

  it('exposes an accessible name when labelled', () => {
    render(Icon, { props: { name: 'kind-study', label: 'Estudo', size: 'lg' } });

    const img = screen.getByRole('img', { name: 'Estudo' });
    expect(img).toHaveAttribute('width', '32');
    expect(img).not.toHaveAttribute('aria-hidden');
  });

  it('paints every layer of the glyph', () => {
    const { container } = render(Icon, { props: { name: 'sector-inner' } });
    const glyph = iconGlyphs['sector-inner'];
    const layers =
      (glyph.tint?.length ?? 0) +
      (glyph.accent?.length ?? 0) +
      (glyph.secondary?.length ?? 0) +
      (glyph.detail?.length ?? 0) +
      glyph.line.length;

    expect(container.querySelectorAll('path')).toHaveLength(layers);
  });

  it('keeps every glyph on the 24 grid with drawable paths', () => {
    const names = Object.values(iconGroups).flat() as IconName[];

    expect(names).toHaveLength(Object.keys(iconGlyphs).length);
    for (const name of names) {
      const glyph = iconGlyphs[name];
      const paths = [
        ...(glyph.tint ?? []),
        ...(glyph.accent ?? []),
        ...(glyph.secondary ?? []),
        ...(glyph.detail ?? []),
        ...glyph.line,
        ...(glyph.solid ?? []),
      ];

      expect(glyph.line.length, name).toBeGreaterThan(0);
      for (const d of paths) {
        expect(d, name).toMatch(/^M[-\d.]/);
        expect(d, name).not.toMatch(/NaN|undefined/);
      }
    }
  });

  it('covers the five bay sectors, the kind duo and twenty topics', () => {
    expect(iconGroups.sector).toHaveLength(5);
    expect(iconGroups.kind).toEqual(['kind-project', 'kind-study']);
    expect(iconGroups.topic).toHaveLength(20);
  });
});
