import { render } from '@testing-library/vue';

import CardGrid from './CardGrid.vue';
import styles from './CardGrid.module.scss';

describe('CardGrid', () => {
  it('renders the requested element with its column cap', () => {
    const { container } = render(CardGrid, {
      props: { as: 'ol', maxColumns: 2 },
      slots: { default: '<li>A</li><li>B</li>' },
    });

    const list = container.querySelector('ol');
    expect(list).toHaveClass(styles.root, styles.max2);
    expect(list?.querySelectorAll('li')).toHaveLength(2);
  });
});
