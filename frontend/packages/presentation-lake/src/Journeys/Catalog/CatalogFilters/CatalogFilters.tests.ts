import { fireEvent, screen, within } from '@testing-library/vue';

import { filterOptions } from '../../../../tests/fixtures/catalog';
import { defaultMessages as filterMenuMessages } from '../../../Shared/components/FilterMenu/FilterMenu.messages';
import { renderWithIntl } from '../../../../tests/renderWithIntl';
import { catalogLabelMessages } from '../Catalog.messages';

import { defaultMessages } from './CatalogFilters.messages';
import CatalogFilters, { type CatalogFiltersValue, emptyCatalogFilters } from './CatalogFilters.vue';

const descriptors = [...catalogLabelMessages, ...Object.values(defaultMessages), ...Object.values(filterMenuMessages)];
const label = (key: keyof typeof defaultMessages) => defaultMessages[key].defaultMessage as string;

function renderFilters(modelValue: CatalogFiltersValue = emptyCatalogFilters()) {
  const updates: CatalogFiltersValue[] = [];
  const result = renderWithIntl(CatalogFilters, {
    locale: 'pt-BR',
    descriptors,
    props: {
      options: filterOptions,
      modelValue,
      today: '2026-11',
      'onUpdate:modelValue': (value: CatalogFiltersValue) => updates.push(value),
    },
  });
  return { ...result, updates };
}

async function openPill(name: string) {
  await fireEvent.click(screen.getByRole('button', { name }));
  return screen.getByRole('listbox', { name });
}

describe('CatalogFilters', () => {
  it('opens a menu with counts, a check on the current value and no empty options', async () => {
    renderFilters();

    const list = await openPill(label('municipality'));
    const options = within(list).getAllByRole('option');
    expect(options.map((option) => option.getAttribute('aria-label'))).toEqual([
      label('allMunicipalities'),
      'Rio de Janeiro (22)',
      'Niterói (11)',
      'São Gonçalo (11)',
    ]);
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('groups keywords by category, each with its icon', async () => {
    renderFilters();

    const list = await openPill(label('keyword'));
    expect(within(list).getByText('Tipo de resíduo')).toBeInTheDocument();
    expect(within(list).getByText('Ambiente')).toBeInTheDocument();
    const mangrove = within(list).getByRole('option', { name: /Manguezal/ });
    expect(mangrove.querySelector('[data-icon="topic-mangrove"]')).not.toBeNull();
  });

  it('applies a menu choice immediately and the search on submit', async () => {
    const { emitted, updates } = renderFilters();

    const list = await openPill(label('keyword'));
    await fireEvent.click(within(list).getByRole('option', { name: /Macrolixo/ }));
    expect(updates.at(-1)).toMatchObject({ keyword: 'macrolixo' });
    expect(emitted('submit')).toHaveLength(1);
    expect(screen.queryByRole('listbox')).toBeNull();

    await fireEvent.update(screen.getByLabelText(label('searchLabel')), 'pescadores');
    expect(updates.at(-1)).toMatchObject({ q: 'pescadores' });
    await fireEvent.submit(screen.getByRole('search'));
    expect(emitted('submit')).toHaveLength(2);
  });

  it('works from the keyboard: arrows move, Enter chooses', async () => {
    const { updates } = renderFilters();

    await fireEvent.keyDown(screen.getByRole('button', { name: label('status') }), { key: 'ArrowDown' });
    const list = screen.getByRole('listbox', { name: label('status') });
    expect(within(list).getAllByRole('option').map((option) => option.getAttribute('aria-label'))).toEqual([
      label('allStatuses'),
      'Ativa (10)',
      'Encerrada (2)',
    ]);

    await fireEvent.keyDown(list, { key: 'End' });
    await fireEvent.keyDown(list, { key: 'Enter' });
    expect(updates.at(-1)).toMatchObject({ status: 'ended' });
  });

  it('shows both kinds with icons and counts, and one when filtered', async () => {
    const { container, emitted, updates } = renderFilters();

    const group = screen.getByRole('radiogroup', { name: label('kind') });
    expect(group.querySelectorAll('[data-icon="kind-project"]')).toHaveLength(2);
    expect(group.querySelectorAll('[data-icon="kind-study"]')).toHaveLength(2);
    expect(container.querySelector('[data-kind-option="all"]')).toHaveTextContent('41');

    await fireEvent.click(screen.getByRole('radio', { name: /Estudos/ }));
    expect(updates.at(-1)).toMatchObject({ kind: 'study' });
    expect(emitted('submit')).toHaveLength(1);
  });

  it('picks a period of months on the calendar, or from a preset', async () => {
    const { updates } = renderFilters();

    await fireEvent.click(screen.getByRole('button', { name: label('period') }));
    const dialog = screen.getByRole('dialog', { name: label('period') });

    await fireEvent.click(within(dialog).getByRole('button', { name: label('periodPreviousYear') }));
    await fireEvent.click(within(dialog).getByRole('button', { name: 'março de 2025' }));
    await fireEvent.click(within(dialog).getByRole('button', { name: 'agosto de 2025' }));
    await fireEvent.click(within(dialog).getByRole('button', { name: label('periodApply') }));
    expect(updates.at(-1)).toMatchObject({ from: '2025-03', to: '2025-08' });

    await fireEvent.click(screen.getByRole('button', { name: label('period') }));
    await fireEvent.click(screen.getByRole('button', { name: label('periodThisYear') }));
    expect(updates.at(-1)).toMatchObject({ from: '2026-01', to: '2026-11' });
  });

  it('lists active filters as removable chips with their icons', async () => {
    const { container, emitted, updates } = renderFilters({
      ...emptyCatalogFilters(),
      keyword: 'manguezal',
      sector: 'interior',
      status: 'active',
      from: '2020-01',
      to: '2024-12',
    });

    expect(container.querySelector('[data-chip="keyword"] [data-icon="topic-mangrove"]')).not.toBeNull();
    expect(container.querySelector('[data-chip="sector"] [data-icon="sector-inner"]')).not.toBeNull();
    expect(container.querySelector('[data-chip="period"]')).toHaveTextContent('2020');
    expect(container.querySelector('[data-filter="sector"] [data-icon="sector-inner"]')).not.toBeNull();

    await fireEvent.click(screen.getByRole('button', { name: 'Remover filtro: Interior' }));
    expect(updates.at(-1)).toMatchObject({ sector: '', keyword: 'manguezal' });
    await fireEvent.click(screen.getByRole('button', { name: /^Remover filtro: .*2020/ }));
    expect(updates.at(-1)).toMatchObject({ from: '', to: '' });
    expect(emitted('submit')).toHaveLength(2);
  });

  it('filters by institution through a searchable menu, shown as a chip', async () => {
    const { container, updates } = renderFilters();
    await fireEvent.click(screen.getByRole('button', { name: label('institution') }));
    await fireEvent.update(screen.getByRole('combobox'), 'niteroi');
    await fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
    expect(updates.at(-1)).toMatchObject({ institution: 'prefeitura-de-niteroi' });

    const chips = renderFilters({ ...emptyCatalogFilters(), institution: 'uff' });
    expect(chips.container.querySelector('[data-chip="institution"]')).toHaveTextContent('UFF');
    expect(container).toBeTruthy();
  });

  it('puts the summary, the sort and the pagination on the results line', () => {
    renderWithIntl(CatalogFilters, {
      locale: 'pt-BR',
      descriptors,
      props: { options: filterOptions, modelValue: emptyCatalogFilters(), today: '2026-11' },
      slots: { summary: '<b>41 entradas</b>', pagination: '<nav aria-label="Páginas" />' },
    });
    expect(screen.getByText('41 entradas')).toBeTruthy();
    expect(screen.getByRole('button', { name: new RegExp(`^${label('sort')}`) })).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Páginas' })).toBeTruthy();
  });

  it('offers to clear only when something is filtered', async () => {
    renderFilters();
    expect(screen.queryByTestId('catalog-filters-clear')).toBeNull();

    const { emitted } = renderFilters({ ...emptyCatalogFilters(), kind: 'study' });
    await fireEvent.click(screen.getByTestId('catalog-filters-clear'));
    expect(emitted('clear')).toHaveLength(1);
  });

  it('hides filters that cannot narrow the current results, but never an active one', async () => {
    const options = {
      ...filterOptions,
      // 5 results: every one is "active" and in Entrada; none has a mechanism.
      statuses: [{ value: 'active' as const, count: 5 }],
      sectors: [{ value: 'entrada', label: 'Entrada', count: 5 }],
      mechanisms: [],
    };
    const { container, rerender } = renderWithIntl(CatalogFilters, {
      locale: 'pt-BR',
      descriptors,
      props: { options, total: 5, modelValue: emptyCatalogFilters(), today: '2026-11' },
    });
    const pill = (name: string) => container.querySelector(`[data-filter="${name}"]`);
    expect(pill('status')).toBeNull();
    expect(pill('sector')).toBeNull();
    expect(pill('mechanism')).toBeNull();
    // Keywords still split the five results.
    expect(pill('keyword')).not.toBeNull();

    await rerender({ options, total: 5, modelValue: { ...emptyCatalogFilters(), sector: 'entrada' }, today: '2026-11' });
    expect(pill('sector')).not.toBeNull();
  });
});
