import { fireEvent, render, screen } from '@testing-library/vue';
import { ref } from 'vue';

import Input from './Input.vue';

describe('Input', () => {
  it('renders a text input by default', () => {
    render(Input, { props: { id: 'test-input' }, attrs: { placeholder: 'Test value' } });

    expect(screen.getByPlaceholderText('Test value')).toHaveAttribute('type', 'text');
  });

  it('renders an email input', () => {
    render(Input, { props: { id: 'test-email', type: 'email' } });

    expect(document.getElementById('test-email')).toHaveAttribute('type', 'email');
  });

  it('renders a password input', () => {
    render(Input, { props: { id: 'test-password', type: 'password' } });

    expect(document.getElementById('test-password')).toHaveAttribute('type', 'password');
  });

  it('associates error text with the input', () => {
    render(Input, { props: { id: 'test-error', type: 'email', error: 'Test error' } });

    const input = document.getElementById('test-error');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'test-error-description');
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('supports v-model', async () => {
    const value = ref('');

    render(Input, {
      props: {
        id: 'test-model',
        modelValue: value.value,
        'onUpdate:modelValue': (next: string) => {
          value.value = next;
        },
      },
    });

    await fireEvent.update(document.getElementById('test-model')!, 'typed value');

    expect(value.value).toBe('typed value');
  });
});
