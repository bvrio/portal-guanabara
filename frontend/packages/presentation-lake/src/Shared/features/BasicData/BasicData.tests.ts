import { fireEvent, screen } from '@testing-library/vue';

import { renderWithIntl } from '../../../../tests/renderWithIntl';

import BasicData from './BasicData.vue';
import { defaultMessages } from './BasicData.messages';

const descriptors = Object.values(defaultMessages);

const filledValues = {
  fullName: 'Test Name',
  cpf: '12345678900',
  phone: '11999999999',
  email: 'test@example.com',
};

async function type(id: string, value: string) {
  await fireEvent.update(document.getElementById(id)!, value);
}

describe('BasicData', () => {
  it('renders all registration fields', () => {
    renderWithIntl(BasicData, { props: { mode: 'registration' }, descriptors });

    for (const id of [
      'basic-data-full-name',
      'basic-data-cpf',
      'basic-data-phone',
      'basic-data-email',
      'basic-data-password',
      'basic-data-password-confirmation',
    ]) {
      expect(document.getElementById(id)).toBeInTheDocument();
    }

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('emits registration data on submit', async () => {
    const { emitted } = renderWithIntl(BasicData, {
      props: { mode: 'registration' },
      descriptors,
    });

    await type('basic-data-full-name', filledValues.fullName);
    await type('basic-data-cpf', filledValues.cpf);
    await type('basic-data-phone', filledValues.phone);
    await type('basic-data-email', filledValues.email);
    await type('basic-data-password', 'test-password');
    await type('basic-data-password-confirmation', 'test-password');

    await fireEvent.submit(screen.getByRole('button').closest('form')!);

    expect(emitted('submit')?.[0]).toEqual([
      {
        ...filledValues,
        password: 'test-password',
        passwordConfirmation: 'test-password',
      },
    ]);
  });

  it('does not render password fields in edit mode and emits only basic data', async () => {
    const { emitted } = renderWithIntl(BasicData, {
      props: { mode: 'edit', initialValues: filledValues },
      descriptors,
    });

    expect(document.getElementById('basic-data-password')).not.toBeInTheDocument();
    expect(document.getElementById('basic-data-password-confirmation')).not.toBeInTheDocument();

    await fireEvent.submit(screen.getByRole('button').closest('form')!);

    expect(emitted('submit')?.[0]).toEqual([filledValues]);
  });

  it('renders basic data without editable controls in view mode', () => {
    renderWithIntl(BasicData, {
      props: { mode: 'view', initialValues: filledValues },
      descriptors,
    });

    expect(document.getElementById('basic-data-full-name')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText(filledValues.email)).toBeInTheDocument();
  });
});
