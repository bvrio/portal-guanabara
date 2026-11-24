import { fireEvent, render, screen } from '@testing-library/vue';

import Checkbox from './Checkbox.vue';

describe('Checkbox', () => {
  it('associates the label with the checkbox', () => {
    render(Checkbox, { props: { id: 'test-checkbox', label: 'Test option' } });

    expect(screen.getByRole('checkbox', { name: 'Test option' })).not.toBeChecked();
  });

  it('emits model updates', async () => {
    const { emitted } = render(Checkbox, { props: { id: 'test-model', label: 'Test option' } });

    await fireEvent.click(screen.getByRole('checkbox'));

    expect(emitted('update:modelValue')?.[0]).toEqual([true]);
  });

  it('can be disabled', () => {
    render(Checkbox, { props: { id: 'test-disabled', label: 'Test option', disabled: true } });

    expect(screen.getByRole('checkbox')).toBeDisabled();
  });
});
