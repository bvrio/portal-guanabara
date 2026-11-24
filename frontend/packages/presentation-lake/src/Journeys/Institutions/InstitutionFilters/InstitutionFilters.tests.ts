import { fireEvent, screen, within } from '@testing-library/vue';

import { renderWithIntl } from '../../../../tests/renderWithIntl';
import { defaultMessages as filterMenuMessages } from '../../../Shared/components/FilterMenu/FilterMenu.messages';
import { institutionRoleMessages } from '../Institutions.messages';

import { defaultMessages } from './InstitutionFilters.messages';
import InstitutionFilters, { emptyInstitutionFilters, type InstitutionFiltersValue } from './InstitutionFilters.vue';

const descriptors = [...Object.values(defaultMessages), ...Object.values(institutionRoleMessages), ...Object.values(filterMenuMessages)];
const label = (key: keyof typeof defaultMessages) => defaultMessages[key].defaultMessage as string;
const options = {
  allKinds: 57,
  kinds: [
    { value: 'project' as const, count: 48 },
    { value: 'study' as const, count: 18 },
  ],
  roles: [
    { value: 'executor' as const, count: 35 },
    { value: 'author' as const, count: 14 },
    { value: 'partner' as const, count: 0 },
  ],
  types: [{ value: 'academica', label: 'Acadêmica', count: 4 }],
};

function renderFilters(modelValue: InstitutionFiltersValue = emptyInstitutionFilters()) {
  const updates: InstitutionFiltersValue[] = [];
  const result = renderWithIntl(InstitutionFilters, {
    locale: 'pt-BR',
    descriptors,
    props: { options, modelValue, 'onUpdate:modelValue': (value: InstitutionFiltersValue) => updates.push(value) },
    slots: { summary: '<b>63 instituições</b>' },
  });
  return { ...result, updates };
}

describe('InstitutionFilters', () => {
  it('filters by role with counts, hiding empty roles, and submits at once', async () => {
    const { emitted, updates } = renderFilters();
    await fireEvent.click(screen.getByRole('button', { name: label('role') }));
    const list = screen.getByRole('listbox', { name: label('role') });
    expect(within(list).getAllByRole('option').map((option) => option.getAttribute('aria-label'))).toEqual([
      label('allRoles'),
      'Executora (35)',
      'Autora (estudos) (14)',
    ]);
    await fireEvent.click(within(list).getByRole('option', { name: 'Executora (35)' }));
    expect(updates.at(-1)).toMatchObject({ role: 'executor' });
    expect(emitted('submit')).toHaveLength(1);
  });

  it('scopes by kind with the Catálogo toggle, "Todos" counting each institution once', async () => {
    const { emitted, updates } = renderFilters();
    const group = screen.getByRole('radiogroup', { name: label('kind') });
    const radios = within(group).getAllByRole('radio');
    expect(radios.map((radio) => radio.closest('label')?.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
      'Todos57',
      'Iniciativas48',
      'Estudos18',
    ]);
    expect(radios[0]).toBeChecked();
    await fireEvent.click(radios[2]!);
    expect(updates.at(-1)).toMatchObject({ kind: 'study' });
    expect(emitted('submit')).toHaveLength(1);
  });

  it('lists the filters in use as removable chips', async () => {
    const { emitted, updates } = renderFilters({ ...emptyInstitutionFilters(), q: 'uff', role: 'author', type: 'academica' });
    expect(screen.getByText(label('active'))).toBeInTheDocument();
    expect(screen.getByText('“uff”')).toBeInTheDocument();
    await fireEvent.click(screen.getByRole('button', { name: 'Remover filtro: Acadêmica' }));
    expect(updates.at(-1)).toMatchObject({ q: 'uff', role: 'author', type: '' });
    expect(emitted('submit')).toHaveLength(1);
  });

  it('shows no active row without filters', () => {
    renderFilters();
    expect(screen.queryByTestId('institution-filters-clear')).not.toBeInTheDocument();
  });

  it('searches by name on submit, shows the summary and clears', async () => {
    const { emitted, updates } = renderFilters({ ...emptyInstitutionFilters(), type: 'academica' });
    expect(screen.getByText('63 instituições')).toBeInTheDocument();
    await fireEvent.update(screen.getByRole('searchbox'), 'uff');
    expect(updates.at(-1)).toMatchObject({ q: 'uff', type: 'academica' });
    await fireEvent.submit(screen.getByRole('search'));
    expect(emitted('submit')).toHaveLength(1);
    await fireEvent.click(screen.getByTestId('institution-filters-clear'));
    expect(emitted('clear')).toHaveLength(1);
  });
});
