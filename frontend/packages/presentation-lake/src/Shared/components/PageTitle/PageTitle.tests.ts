import { render, screen } from '@testing-library/vue';

import PageTitle from './PageTitle.vue';

describe('PageTitle', () => {
  it('renders its content as a level-one heading', () => {
    render(PageTitle, { slots: { default: 'Test page title' } });

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('supports custom classes through attribute fallthrough', () => {
    const { container } = render(PageTitle, {
      attrs: { class: 'test-class' },
      slots: { default: 'Test page title' },
    });

    expect(container.firstElementChild).toHaveClass('test-class');
  });
});
