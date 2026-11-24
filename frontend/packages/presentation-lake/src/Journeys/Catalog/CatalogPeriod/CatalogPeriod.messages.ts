import { defineMessages } from '../../../Shared/foundations/i18n';

export const defaultMessages = defineMessages({
  range: { id: 'presentationLake.catalog.period.range', defaultMessage: '{start} – {end}' },
  ongoingSince: { id: 'presentationLake.catalog.period.ongoingSince', defaultMessage: '{start} – em curso' },
  since: { id: 'presentationLake.catalog.period.since', defaultMessage: 'Desde {start}' },
  until: { id: 'presentationLake.catalog.period.until', defaultMessage: 'Até {end}' },
  ongoing: { id: 'presentationLake.catalog.period.ongoing', defaultMessage: 'Em curso' },
  unknown: { id: 'presentationLake.catalog.period.unknown', defaultMessage: 'Período não informado' },
});
