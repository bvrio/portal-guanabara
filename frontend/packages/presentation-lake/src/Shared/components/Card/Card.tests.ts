import { render, screen } from '@testing-library/vue';
import { defineComponent, h } from 'vue';

import { Card } from './index';
import { getGridTemplateColumns } from './CardRow.vue';
import styles from './Card.module.scss';

describe('Card', () => {
  it('renders variant and size classes', () => {
    const { container } = render(Card, {
      props: { variant: 'secondary', size: 'lg', fullWidth: true },
      slots: { default: 'Content' },
    });

    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass(styles['variant-secondary']!);
    expect(root).toHaveClass(styles['size-lg']!);
    expect(root).toHaveClass(styles.fullWidth!);
  });

  it('lays out rows with explicit and implicit column definitions', () => {
    const Harness = defineComponent({
      setup: () => () =>
        h(Card, null, () => [
          h(Card.Row, { 'data-testid': 'explicit', columns: [2, 1] }, () => [
            h(Card.Cell, null, () => 'A'),
            h(Card.Cell, null, () => 'B'),
          ]),
          h(Card.Row, { 'data-testid': 'implicit' }, () => [
            h(Card.Cell, null, () => 'A'),
            h(Card.Cell, null, () => 'B'),
            h(Card.Cell, null, () => 'C'),
          ]),
        ]),
    });

    render(Harness);

    expect(screen.getByTestId('explicit').style.gridTemplateColumns).toBe('2fr 1fr');
    // jsdom normalises `minmax(0, 1fr)` to `minmax(0px, 1fr)`.
    expect(screen.getByTestId('implicit').style.gridTemplateColumns).toMatch(/^repeat\(3, /);
  });

  it('falls back safely for invalid fractional columns', () => {
    expect(getGridTemplateColumns([0, -1, 'auto'], 3)).toBe('1fr 1fr auto');
    expect(getGridTemplateColumns(undefined, 0)).toBe('repeat(1, minmax(0, 1fr))');
  });
});
