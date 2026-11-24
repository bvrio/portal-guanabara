import type { IntlShape } from 'vue-intl';

import type { CatalogPartialDate } from '../types';

const OPTIONS: Record<CatalogPartialDate['precision'], Intl.DateTimeFormatOptions> = {
  day: { day: 'numeric', month: 'short', year: 'numeric' },
  month: { month: 'long', year: 'numeric' },
  year: { year: 'numeric' },
};

/**
 * Formats a partial date at its precision (Core v2.0, D-033): "21 de jan. de
 * 2016", "dezembro de 2021", "2022" — never inventing a day or a month.
 */
export function formatPartialDate(intl: Pick<IntlShape, 'formatDate'>, value: CatalogPartialDate): string {
  return intl.formatDate(new Date(`${value.date}T00:00:00Z`), { ...OPTIONS[value.precision], timeZone: 'UTC' });
}

/** `datetime` attribute at the same precision: 2016-01-21, 2021-12, 2022. */
export function partialDateTime(value: CatalogPartialDate): string {
  return value.date.slice(0, value.precision === 'day' ? 10 : value.precision === 'month' ? 7 : 4);
}
