import { fireEvent, render, screen } from '@testing-library/vue';
import { ref } from 'vue';

import Select from './Select.vue';

const options = [
  { value: 'project', label: 'Iniciativas' },
  { value: 'study', label: 'Estudos' },
];

describe('Select', () => {
  it('labels the native select and offers a placeholder option', () => {
    render(Select, { props: { name: 'kind', label: 'Tipo', options, placeholder: 'Todos' } });

    const select = screen.getByLabelText('Tipo') as HTMLSelectElement;
    expect(select.tagName).toBe('SELECT');
    expect([...select.options].map((option) => option.value)).toEqual(['', 'project', 'study']);
  });

  it('supports v-model', async () => {
    const value = ref('');
    render(Select, {
      props: {
        name: 'kind',
        label: 'Tipo',
        options,
        modelValue: value.value,
        'onUpdate:modelValue': (next: string) => {
          value.value = next;
        },
      },
    });

    await fireEvent.update(screen.getByLabelText('Tipo'), 'study');
    expect(value.value).toBe('study');
  });
});
