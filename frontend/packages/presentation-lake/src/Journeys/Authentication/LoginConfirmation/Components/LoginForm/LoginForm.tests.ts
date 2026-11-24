import { fireEvent, screen } from '@testing-library/vue';

import { renderWithIntl } from '../../../../../../tests/renderWithIntl';

import LoginForm from './LoginForm.vue';
import { defaultMessages } from './LoginForm.messages';

const descriptors = Object.values(defaultMessages);

describe('LoginForm', () => {
  it('renders e-mail and password fields in login mode', () => {
    renderWithIntl(LoginForm, { descriptors });

    expect(document.getElementById('login-email')).toBeInTheDocument();
    expect(document.getElementById('login-password')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: defaultMessages.submit.defaultMessage as string }),
    ).toBeInTheDocument();
  });

  it('renders only the e-mail field in reset-password mode', async () => {
    const { emitted } = renderWithIntl(LoginForm, {
      props: { mode: 'reset-password' },
      descriptors,
    });

    expect(document.getElementById('login-password')).not.toBeInTheDocument();

    await fireEvent.update(document.getElementById('login-email')!, 'test@example.com');
    await fireEvent.submit(screen.getByRole('button').closest('form')!);

    expect(emitted('submit')?.[0]).toEqual([{ email: 'test@example.com' }]);
  });
});
