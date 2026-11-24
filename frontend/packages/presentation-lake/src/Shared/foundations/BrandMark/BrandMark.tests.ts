import { render } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';

import BrandMark from './BrandMark.vue';

describe('BrandMark', () => {
  it('is decorative by default', () => {
    const { container } = render(BrandMark);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('width')).toBe('32');
  });

  it('becomes an image with an accessible name when labelled', () => {
    const { getByRole } = render(BrandMark, { props: { label: 'Portal Guanabara', size: 200 } });
    expect(getByRole('img', { name: 'Portal Guanabara' }).getAttribute('height')).toBe('200');
  });

  it('draws the G holding the water and two fish, one per kind', () => {
    const { container } = render(BrandMark, { props: { size: 240 } });
    expect([...container.querySelectorAll('[data-brand-fish]')].map((node) => node.getAttribute('data-brand-fish'))).toEqual([
      'act',
      'study',
    ]);
    expect(container.querySelector('clipPath')?.id).toMatch(/^brand-water-/);
  });

  it('draws the contour under the G, ring and bar', () => {
    const { container } = render(BrandMark);
    const paths = [...container.querySelectorAll('svg > path')];
    expect(paths).toHaveLength(4);
    expect(paths.slice(0, 2).every((path) => path.hasAttribute('data-brand-outline'))).toBe(true);
    expect(paths.slice(2).some((path) => path.hasAttribute('data-brand-outline'))).toBe(false);
  });
});
