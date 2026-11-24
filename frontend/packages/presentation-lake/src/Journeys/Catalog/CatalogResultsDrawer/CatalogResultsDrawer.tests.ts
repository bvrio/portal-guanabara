import { fireEvent, screen, within } from '@testing-library/vue';

import { projectEntry, studyEntry } from '../../../../tests/fixtures/catalog';
import { renderWithIntl } from '../../../../tests/renderWithIntl';
import { defaultMessages as drawerMessages } from '../../../Shared/components/Drawer/Drawer.messages';
import { catalogLabelMessages } from '../Catalog.messages';
import { defaultMessages as cardMessages } from '../CatalogEntryCard/CatalogEntryCard.messages';
import { defaultMessages as periodMessages } from '../CatalogPeriod/CatalogPeriod.messages';

import { defaultMessages } from './CatalogResultsDrawer.messages';
import CatalogResultsDrawer from './CatalogResultsDrawer.vue';

const descriptors = [
  ...Object.values(defaultMessages),
  ...catalogLabelMessages,
  ...Object.values(cardMessages),
  ...Object.values(periodMessages),
  drawerMessages.close,
];
const text = (key: keyof typeof defaultMessages) => defaultMessages[key].defaultMessage as string;

const base = {
  open: true,
  filters: [{ dimension: 'municipality' as const, code: 'rio-de-janeiro', label: 'Rio de Janeiro' }],
  facets: {
    status: [
      { value: 'active', label: 'active', count: 7 },
      { value: 'ended', label: 'ended', count: 2 },
    ],
    institution: Array.from({ length: 10 }, (_, index) => ({ value: `i${index}`, label: index ? `Instituto ${index}` : 'Prefeitura de Niterói', count: 10 - index })),
    mechanism: [{ value: 'limpeza', label: 'Limpeza', count: 0 }],
    // Every result is a project: "Tipo" would change nothing.
    kind: [{ value: 'project', label: 'project', count: 22 }],
  },
  items: [projectEntry, studyEntry],
  total: 22,
  listHref: '/catalog?municipality=rio-de-janeiro',
};

function renderDrawer(props: Record<string, unknown> = {}) {
  return renderWithIntl(CatalogResultsDrawer, { locale: 'pt-BR', descriptors, props: { ...base, ...props } });
}

describe('CatalogResultsDrawer', () => {
  it('is titled by the first filter and shows the count, the entries and a way to the Catálogo', async () => {
    renderDrawer();
    const dialog = await screen.findByRole('dialog', { name: /Rio de Janeiro/ });
    expect(dialog).toHaveTextContent('22 entradas');
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getByText('Mostrando 2 de 22')).toBeInTheDocument();
    expect(screen.getByTestId('drawer-open-catalog')).toHaveAttribute('href', '/catalog?municipality=rio-de-janeiro');
  });

  it('stacks the filters as removable chips, with labels for kind and status', async () => {
    const { emitted } = renderDrawer({
      filters: [...base.filters, { dimension: 'status', code: 'active', label: 'active' }],
    });
    const chip = (await screen.findByRole('dialog')).querySelector('[data-chip="status"]')!;
    expect(chip).toHaveTextContent('Ativa');
    await fireEvent.click(screen.getByRole('button', { name: 'Remover filtro: Ativa' }));
    expect(emitted('remove')).toEqual([['status']]);
    await fireEvent.click(screen.getByRole('button', { name: text('clear') }));
    expect(emitted('clear')).toHaveLength(1);
  });

  it('adds a filter: a dimension, then a value with its count', async () => {
    const { emitted } = renderDrawer();
    await fireEvent.click(await screen.findByTestId('drawer-add-filter'));
    const adder = document.querySelector('[data-drawer-adder]') as HTMLElement;
    // In use: listed and still open, to swap its value (v0.9.4). Nothing that would narrow
    // the results (no value, or only values every result has): not listed at all.
    expect(within(adder).getByRole('button', { name: new RegExp(text('municipality')) })).toBeEnabled();
    expect(within(adder).queryByRole('button', { name: new RegExp(text('mechanism')) })).toBeNull();
    expect(within(adder).queryByRole('button', { name: new RegExp(`^${text('kind')}`) })).toBeNull();
    expect(adder.querySelector('[data-drawer-adder-empty]')).toBeNull();

    await fireEvent.click(within(adder).getByRole('button', { name: new RegExp(`^${text('status')}`) }));
    await fireEvent.click(within(adder).getByRole('button', { name: /Encerrada/ }));
    expect(emitted('add')).toEqual([[{ dimension: 'status', code: 'ended', label: 'Encerrada' }]]);
  });

  it('searches long lists of values', async () => {
    const { emitted } = renderDrawer();
    await fireEvent.click(await screen.findByTestId('drawer-add-filter'));
    const adder = document.querySelector('[data-drawer-adder]') as HTMLElement;
    await fireEvent.click(within(adder).getByRole('button', { name: new RegExp(`^${text('institution')}`) }));
    await fireEvent.update(within(adder).getByRole('searchbox'), 'niteroi');
    const values = adder.querySelectorAll('[data-value]');
    expect([...values].map((value) => value.getAttribute('data-value'))).toEqual(['i0']);
    await fireEvent.click(values[0]!);
    expect(emitted('add')?.[0]).toEqual([{ dimension: 'institution', code: 'i0', label: 'Prefeitura de Niterói' }]);
  });

  it('draws the sector map for sectors and offers a retry on error', async () => {
    const { emitted } = renderDrawer({
      filters: [{ dimension: 'sector', code: 'entrada', label: 'Entrada' }],
      items: [],
      error: true,
    });
    const dialog = await screen.findByRole('dialog', { name: /Entrada/ });
    expect(dialog.querySelector('[data-icon="sector-entrance"]')).not.toBeNull();
    await fireEvent.click(screen.getByRole('button', { name: text('retry') }));
    expect(emitted('retry')).toHaveLength(1);
  });

  it('shows an official emblem next to the title when the App has one', async () => {
    renderDrawer({
      filters: [{ dimension: 'institution', code: 'uff', label: 'UFF' }],
      emblem: { shape: 'logo' },
    });
    const dialog = await screen.findByRole('dialog', { name: /UFF/ });
    expect(dialog.querySelector('[data-emblem="monogram"]')).toHaveTextContent('UFF');
  });

  it('says so when no new filter would change the results, and still lets the one in use be swapped', async () => {
    const { emitted } = renderDrawer({
      filters: [{ dimension: 'keyword', code: 'hidrodinamica', label: 'Hidrodinâmica' }],
      total: 1,
      facets: {
        kind: [{ value: 'study', label: 'study', count: 1 }],
        // Counted without the keyword filter itself: the other keywords to swap to.
        keyword: [
          { value: 'hidrodinamica', label: 'Hidrodinâmica', count: 1 },
          { value: 'microplastico', label: 'Microplástico', count: 12 },
          { value: 'fauna', label: 'Fauna', count: 0 },
        ],
      },
    });
    await fireEvent.click(await screen.findByTestId('drawer-add-filter'));
    const adder = document.querySelector('[data-drawer-adder]') as HTMLElement;
    expect(adder.querySelector('[data-drawer-adder-empty]')).toHaveTextContent(text('nothingToAdd'));
    const inUse = within(adder).getByRole('button', { name: new RegExp(text('keyword')) });
    expect(inUse).toHaveTextContent(text('inUse'));
    await fireEvent.click(inUse);
    // Every other keyword with entries; not the current one, not the empty ones.
    expect([...adder.querySelectorAll('[data-value]')].map((value) => value.getAttribute('data-value'))).toEqual(['microplastico']);
    await fireEvent.click(within(adder).getByRole('button', { name: /Microplástico/ }));
    expect(emitted('add')).toEqual([[{ dimension: 'keyword', code: 'microplastico', label: 'Microplástico' }]]);
  });
});
