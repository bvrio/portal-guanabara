import { fireEvent, screen, within } from '@testing-library/vue';

import { renderWithIntl } from '../../../../tests/renderWithIntl';

import BarList from './BarList.vue';

const items = [
  { id: 'macrolixo', label: 'Macrolixo', value: 28, href: '/catalog/list?keyword=macrolixo' },
  { id: 'estuario', label: 'Estuário', value: 14 },
  { id: 'flora', label: 'Flora', value: 0 },
];

describe('BarList', () => {
  it('prints every label and value, so color is never the only channel', () => {
    renderWithIntl(BarList, { props: { items } });

    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(3);
    expect(within(rows[0]!).getByText('28')).toBeInTheDocument();
    expect(within(rows[1]!).getByText('Estuário')).toBeInTheDocument();
  });

  it('scales bars against the largest value unless a max is given', () => {
    const { container, rerender } = renderWithIntl(BarList, { props: { items } });
    const shares = () =>
      [...container.querySelectorAll<HTMLElement>('[aria-hidden="true"][style]')].map((bar) =>
        bar.style.getPropertyValue('--bar-share'),
      );

    expect(shares()).toEqual(['1', '0.5', '0']);

    return rerender({ items, max: 56 }).then(() => {
      expect(shares()).toEqual(['0.5', '0.25', '0']);
    });
  });

  it('makes the whole row the link of categories that have a drill-down', () => {
    renderWithIntl(BarList, { props: { items } });
    const link = screen.getByRole('link', { name: /Macrolixo/ });
    expect(link).toHaveAttribute('href', '/catalog/list?keyword=macrolixo');
    // Label, bar and value are all inside the link; the name is plain text.
    expect(within(link).getByText('28')).toBeInTheDocument();
    expect(within(link).queryByRole('link')).toBeNull();
    expect(screen.queryByRole('link', { name: /Estuário/ })).toBeNull();
  });

  it('splits bars into coloured parts and says them in words', () => {
    const split = [
      {
        id: 'macrolixo',
        label: 'Macrolixo',
        value: 28,
        href: '/catalog?keyword=macrolixo',
        segments: [
          { value: 20, color: 'orange', label: '20 iniciativas' },
          { value: 8, color: 'purple', label: '8 estudos' },
        ],
      },
      {
        id: 'fauna',
        label: 'Fauna',
        value: 6,
        segments: [
          { value: 6, color: 'orange', label: '6 iniciativas' },
          { value: 0, color: 'purple', label: '0 estudos' },
        ],
      },
    ];
    const { container } = renderWithIntl(BarList, { props: { items: split }, locale: 'pt-BR' });

    const parts = (id: string) =>
      [...container.querySelectorAll<HTMLElement>(`[data-item="${id}"] [aria-hidden="true"] > span`)].map((part) => [
        part.style.getPropertyValue('--segment-grow'),
        part.style.getPropertyValue('--segment-color'),
      ]);
    expect(parts('macrolixo')).toEqual([
      ['20', 'orange'],
      ['8', 'purple'],
    ]);
    // Empty parts are not drawn nor read.
    expect(parts('fauna')).toEqual([['6', 'orange']]);
    const link = screen.getByRole('link', { name: /Macrolixo/ });
    expect(link).toHaveTextContent('20 iniciativas e 8 estudos');
    expect(link).toHaveAttribute('title', 'Macrolixo: 20 iniciativas e 8 estudos');
  });

  it('paints whole bars in the colour asked for', () => {
    const { container } = renderWithIntl(BarList, { props: { items, color: 'var(--color-kind-study)' } });
    const bar = container.querySelector<HTMLElement>('[data-item="macrolixo"] [aria-hidden="true"]');
    expect(bar?.style.getPropertyValue('--bar-color')).toBe('var(--color-kind-study)');
  });

  it('renders the empty slot when there is nothing to compare', () => {
    renderWithIntl(BarList, { props: { items: [] }, slots: { empty: 'Sem dados' } });
    expect(screen.getByText('Sem dados')).toBeInTheDocument();
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('emits select from buttons when selectable', async () => {
    const { emitted } = renderWithIntl(BarList, { props: { items, selectable: true } });

    expect(screen.queryByRole('link')).toBeNull();
    // The whole row is the button: its name holds the label and the value.
    await fireEvent.click(screen.getByRole('button', { name: /Estuário/ }));
    expect(emitted('select')).toEqual([[items[1]]]);
  });
});
