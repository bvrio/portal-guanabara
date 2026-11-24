import { render, screen } from '@testing-library/vue';

import EmptyState from './EmptyState.vue';

describe('EmptyState', () => {
  it('renders title, description and actions', () => {
    render(EmptyState, {
      props: { headingLevel: 3 },
      slots: { title: 'Nenhum resultado', default: 'Tente outros filtros.', actions: '<button>Limpar</button>' },
    });

    expect(screen.getByRole('heading', { level: 3, name: 'Nenhum resultado' })).toBeInTheDocument();
    expect(screen.getByText('Tente outros filtros.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Limpar' })).toBeInTheDocument();
  });
});
