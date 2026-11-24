import { render } from '@testing-library/vue';

import Inline from './Inline.vue';
import styles from './Inline.module.scss';

describe('Inline', () => {
  it('maps the spacing scale to a CSS variable', () => {
    const { container } = render(Inline, {
      props: { gap: 2 },
      slots: { default: '<span>A</span><span>B</span>' },
    });

    const root = container.firstElementChild as HTMLElement;

    expect(root.style.getPropertyValue('--inline-gap')).toBe('var(--spacing-2)');
  });

  it('applies wrap and alignment classes', () => {
    const { container } = render(Inline, {
      props: { wrap: true, align: 'end', justify: 'space-between' },
    });

    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass(styles.wrap!);
    expect(root).toHaveClass(styles['align-end']!);
    expect(root).toHaveClass(styles['justify-space-between']!);
  });
});
