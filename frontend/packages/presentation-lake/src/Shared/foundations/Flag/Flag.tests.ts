import { render } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';

import Flag from './Flag.vue';

describe('Flag', () => {
  it('draws the country asked for, decorative and 20:14', () => {
    const { container } = render(Flag, { props: { country: 'br', size: 30 } });
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('data-flag', 'br');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('width', '30');
    expect(svg).toHaveAttribute('height', '21');
  });

  it('has a flag for each language of the site', () => {
    for (const country of ['br', 'gb', 'es', 'fr'] as const) {
      const { container, unmount } = render(Flag, { props: { country } });
      expect(container.querySelector(`[data-flag="${country}"] g`)?.children.length).toBeGreaterThan(1);
      unmount();
    }
  });
});
