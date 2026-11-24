import { render, screen } from '@testing-library/vue';

import FilterPanel from './FilterPanel.vue';
import styles from './FilterPanel.module.scss';

describe('FilterPanel', () => {
  it('renders the filters, the results summary and the actions', () => {
    const { container } = render(FilterPanel, {
      slots: { default: '<input aria-label="busca" />', summary: '<b>41 entradas</b>', actions: '<button>Próxima</button>' },
    });
    expect(screen.getByRole('textbox', { name: 'busca' })).toBeTruthy();
    expect(screen.getByText('41 entradas')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeTruthy();
    expect(container.querySelector('[data-filter-panel]')!.classList.contains(styles.sticky)).toBe(true);
  });

  it('can stay in the flow and omits an empty results line', () => {
    const { container } = render(FilterPanel, { props: { sticky: false }, slots: { default: 'x' } });
    const root = container.querySelector('[data-filter-panel]')!;
    expect(root.classList.contains(styles.sticky)).toBe(false);
    expect(root.children).toHaveLength(1);
  });
});
