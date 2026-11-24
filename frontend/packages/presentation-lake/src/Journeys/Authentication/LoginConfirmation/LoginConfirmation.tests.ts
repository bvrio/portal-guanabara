import { fireEvent, screen } from '@testing-library/vue';

import { renderWithIntl } from '../../../../tests/renderWithIntl';
import { defaultMessages as buttonMessages } from '../../../Shared/components/Button/Button.messages';

import { defaultMessages as loginFormMessages } from './Components/LoginForm/LoginForm.messages';
import LoginConfirmation from './LoginConfirmation.vue';
import { defaultMessages as loginConfirmationMessages } from './LoginConfirmation.messages';

const descriptors = [
  ...Object.values(loginConfirmationMessages),
  ...Object.values(loginFormMessages),
  buttonMessages.loading,
];

const props = {
  registrationHref: '/register',
  forgotPasswordHref: '/forgot-password',
};

describe('LoginConfirmation', () => {
  it('renders the login form and navigation links', () => {
    renderWithIntl(LoginConfirmation, { props, descriptors });

    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(document.getElementById('login-email')).toBeInTheDocument();
    expect(document.getElementById('login-password')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();

    const links = screen.getAllByRole('link');

    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/forgot-password');
    expect(links[1]).toHaveAttribute('href', '/register');
  });

  it('forwards submitted credentials to the parent', async () => {
    const { emitted } = renderWithIntl(LoginConfirmation, { props, descriptors });

    await fireEvent.update(document.getElementById('login-email')!, 'test@example.com');
    await fireEvent.update(document.getElementById('login-password')!, 'test-password');
    await fireEvent.submit(screen.getByRole('button').closest('form')!);

    expect(emitted('submit')?.[0]).toEqual([
      { email: 'test@example.com', password: 'test-password' },
    ]);
  });

  it('renders page-owned feedback above the form', () => {
    renderWithIntl(LoginConfirmation, {
      props,
      descriptors,
      slots: { feedback: '<p data-testid="feedback">Test feedback</p>' },
    });

    expect(screen.getByTestId('feedback')).toBeInTheDocument();
  });
});
