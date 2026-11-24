import { screen } from '@testing-library/vue';

import { renderWithIntl } from '../../../../tests/renderWithIntl';

import { defaultMessages } from './CatalogPeriod.messages';
import CatalogPeriod from './CatalogPeriod.vue';
import { formatPartialDate } from './formatPartialDate';

const descriptors = Object.values(defaultMessages);
const pt = { formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('pt-BR', options).format(date) };

describe('CatalogPeriod', () => {
  it('formats dates at their precision, never inventing a day or month', () => {
    expect(formatPartialDate(pt, { date: '2016-01-21', precision: 'day' })).toBe(
      new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
        new Date('2016-01-21T00:00:00Z'),
      ),
    );
    expect(formatPartialDate(pt, { date: '2021-12-01', precision: 'month' })).toBe('dezembro de 2021');
    expect(formatPartialDate(pt, { date: '2022-01-01', precision: 'year' })).toBe('2022');
  });

  it('renders a machine-readable range', () => {
    const { container } = renderWithIntl(CatalogPeriod, {
      locale: 'pt-BR',
      descriptors,
      props: {
        start: { date: '2017-03-01', precision: 'month' },
        end: { date: '2017-12-01', precision: 'month' },
      },
    });

    expect(container.querySelector('time')).toHaveAttribute('datetime', '2017-03/2017-12');
    expect(screen.getByText('março de 2017 – dezembro de 2017')).toBeInTheDocument();
  });

  it('says when an entry is ongoing or has no known period', () => {
    renderWithIntl(CatalogPeriod, {
      locale: 'pt-BR',
      descriptors,
      props: { start: { date: '2021-12-01', precision: 'month' }, end: null, ongoing: true },
    });
    expect(screen.getByText('dezembro de 2021 – em curso')).toBeInTheDocument();

    renderWithIntl(CatalogPeriod, { descriptors, props: { start: null, end: null } });
    expect(screen.getByText(defaultMessages.unknown.defaultMessage as string)).toBeInTheDocument();
  });
});
