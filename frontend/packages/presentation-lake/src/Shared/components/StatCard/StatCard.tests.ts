import { fireEvent, screen } from '@testing-library/vue';

import { renderWithIntl } from '../../../../tests/renderWithIntl';

import StatCard from './StatCard.vue';

describe('StatCard', () => {
  it('formats numbers for the locale and shows the label', () => {
    renderWithIntl(StatCard, { locale: 'pt-BR', props: { value: 1284, label: 'Entradas' } });

    expect(screen.getByText(new Intl.NumberFormat('pt-BR').format(1284))).toBeInTheDocument();
    expect(screen.getByText('Entradas')).toBeInTheDocument();
  });

  it('accepts slots for label and hint', () => {
    renderWithIntl(StatCard, {
      props: { value: '24' },
      slots: { label: 'Iniciativas', hint: '10 ativas' },
    });

    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByText('10 ativas')).toBeInTheDocument();
  });

  it('is a link with an action line when it has an href', () => {
    renderWithIntl(StatCard, {
      props: { value: 63, href: '/institutions' },
      slots: { label: 'Instituições envolvidas', action: 'Ver as instituições' },
    });
    const link = screen.getByRole('link', { name: /Instituições envolvidas/ });
    expect(link).toHaveAttribute('href', '/institutions');
    expect(link).toHaveTextContent('Ver as instituições');
  });

  it('is a button that emits select when selectable', async () => {
    const { emitted } = renderWithIntl(StatCard, {
      props: { value: 10, selectable: true },
      slots: { label: 'Iniciativas ativas' },
    });
    await fireEvent.click(screen.getByRole('button', { name: /Iniciativas ativas/ }));
    expect(emitted('select')).toHaveLength(1);
  });
});
