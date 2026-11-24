import { fireEvent, screen, within } from '@testing-library/vue';
import { ref } from 'vue';

import { renderWithIntl } from '../../../../tests/renderWithIntl';

import { defaultMessages } from './FilterMenu.messages';
import FilterMenu from './FilterMenu.vue';

const options = [
  { value: 'uff', label: 'UFF', count: 11 },
  { value: 'inea', label: 'INEA', count: 5 },
  { value: 'prefeitura-de-niteroi', label: 'Prefeitura de Niterói', count: 3 },
];

function renderMenu(props: Record<string, unknown> = {}) {
  const model = ref('');
  renderWithIntl(FilterMenu, {
    locale: 'pt-BR',
    descriptors: Object.values(defaultMessages),
    props: {
      name: 'institution',
      label: 'Instituição',
      allLabel: 'Todas',
      options,
      modelValue: model.value,
      'onUpdate:modelValue': (value: string) => {
        model.value = value;
      },
      ...props,
    },
  });
  return model;
}

describe('FilterMenu', () => {
  it('lists the options with counts and chooses one', async () => {
    const model = renderMenu();
    await fireEvent.click(screen.getByRole('button', { name: 'Instituição' }));
    const list = screen.getByRole('listbox', { name: 'Instituição' });
    expect(within(list).getAllByRole('option').map((option) => option.getAttribute('aria-label'))).toEqual([
      'Todas',
      'UFF (11)',
      'INEA (5)',
      'Prefeitura de Niterói (3)',
    ]);
    await fireEvent.click(within(list).getByRole('option', { name: 'INEA (5)' }));
    expect(model.value).toBe('inea');
  });

  it('narrows a searchable list as you type, ignoring accents, and chooses with Enter', async () => {
    const model = renderMenu({ searchable: true });
    await fireEvent.click(screen.getByRole('button', { name: 'Instituição' }));
    const field = screen.getByRole('combobox');
    await fireEvent.update(field, 'niteroi');
    expect(within(screen.getByRole('listbox')).getAllByRole('option').map((option) => option.getAttribute('data-value'))).toEqual([
      'prefeitura-de-niteroi',
    ]);
    await fireEvent.keyDown(field, { key: 'Enter' });
    expect(model.value).toBe('prefeitura-de-niteroi');
  });

  it('says when nothing matches', async () => {
    renderMenu({ searchable: true });
    await fireEvent.click(screen.getByRole('button', { name: 'Instituição' }));
    await fireEvent.update(screen.getByRole('combobox'), 'xyz');
    expect(screen.getByRole('status').textContent).toContain(defaultMessages.noMatch.defaultMessage as string);
  });

  it('has an inverse tone for the dark header, without an "all" option', async () => {
    const model = renderMenu({ tone: 'inverse', allLabel: undefined, label: 'Tamanho', options: [{ value: '100', label: '100%' }, { value: '120', label: '120%' }], modelValue: '100' });
    const pill = screen.getByRole('button', { name: 'Tamanho: 100%' });
    await fireEvent.click(pill);
    await fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: '120%' }));
    expect(model.value).toBe('120');
  });
});
