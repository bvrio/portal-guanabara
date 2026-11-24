import { fireEvent, screen } from '@testing-library/vue';

import { renderWithIntl } from '../../../../tests/renderWithIntl';

import PasswordChange from './PasswordChange.vue';
import { defaultMessages } from './PasswordChange.messages';

const descriptors = Object.values(defaultMessages);

describe('PasswordChange', () => {
  it('emits the three password fields', async () => {
    const { emitted } = renderWithIntl(PasswordChange, { descriptors });

    await fireEvent.update(document.getElementById('password-change-current')!, 'current-secret');
    await fireEvent.update(document.getElementById('password-change-new')!, 'new-secret-1');
    await fireEvent.update(document.getElementById('password-change-confirmation')!, 'new-secret-1');
    await fireEvent.submit(screen.getByRole('button').closest('form')!);

    expect(emitted('submit')?.[0]).toEqual([
      {
        currentPassword: 'current-secret',
        newPassword: 'new-secret-1',
        newPasswordConfirmation: 'new-secret-1',
      },
    ]);
  });

  it('renders page-owned feedback and hint', () => {
    renderWithIntl(PasswordChange, {
      descriptors,
      slots: {
        feedback: '<p data-testid="feedback">Test error</p>',
        hint: 'Test hint',
      },
    });

    expect(screen.getByTestId('feedback')).toBeInTheDocument();
    expect(document.getElementById('password-change-new')).toHaveAttribute(
      'aria-describedby',
      'password-change-new-description',
    );
  });
});
