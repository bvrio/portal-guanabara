import { fireEvent, screen } from '@testing-library/vue';

import { renderWithIntl } from '../../../../tests/renderWithIntl';

import Button from './Button.vue';
import { defaultMessages } from './Button.messages';

describe('Button', () => {
  it('renders its slot content and responds to clicks', async () => {
    const onClick = vi.fn();

    renderWithIntl(Button, {
      attrs: { onClick },
      slots: { default: 'Test action' },
    });

    await fireEvent.click(screen.getByRole('button', { name: 'Test action' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders the default loading message and disables interaction while loading', () => {
    renderWithIntl(Button, {
      props: { loading: true },
      slots: { default: 'Test action' },
      descriptors: [defaultMessages.loading],
    });

    const button = screen.getByRole('button', {
      name: defaultMessages.loading.defaultMessage as string,
    });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('renders a link styled as a button when given an href', () => {
    renderWithIntl(Button, { props: { href: '/catalog', variant: 'inverse' }, slots: { default: 'Explorar' } });

    expect(screen.getByRole('link', { name: 'Explorar' })).toHaveAttribute('href', '/catalog');
    expect(screen.queryByRole('button')).toBeNull();
  });
});
