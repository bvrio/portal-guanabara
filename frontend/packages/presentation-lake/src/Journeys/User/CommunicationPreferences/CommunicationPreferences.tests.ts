import { fireEvent, screen } from '@testing-library/vue';

import { renderWithIntl } from '../../../../tests/renderWithIntl';

import CommunicationPreferences from './CommunicationPreferences.vue';
import { defaultMessages } from './CommunicationPreferences.messages';

const descriptors = Object.values(defaultMessages);

describe('CommunicationPreferences', () => {
  it('starts from the initial values', () => {
    renderWithIntl(CommunicationPreferences, {
      props: { initialValues: { email: true, sms: false, whatsapp: true } },
      descriptors,
    });

    expect(document.getElementById('communication-preferences-email')).toBeChecked();
    expect(document.getElementById('communication-preferences-sms')).not.toBeChecked();
    expect(document.getElementById('communication-preferences-whatsapp')).toBeChecked();
  });

  it('emits the updated preferences', async () => {
    const { emitted } = renderWithIntl(CommunicationPreferences, {
      props: { initialValues: { email: true, sms: false, whatsapp: false } },
      descriptors,
    });

    await fireEvent.click(document.getElementById('communication-preferences-sms')!);
    await fireEvent.submit(screen.getByRole('button').closest('form')!);

    expect(emitted('submit')?.[0]).toEqual([{ email: true, sms: true, whatsapp: false }]);
  });
});
