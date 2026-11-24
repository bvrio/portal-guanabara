import { defineMessages } from '../../../Shared/foundations/i18n';

export const defaultMessages = defineMessages({
  count: {
    id: 'presentationLake.catalog.sectorGrid.count',
    defaultMessage: '{count, plural, one {# entrada} other {# entradas}}',
  },
  unknown: {
    id: 'presentationLake.catalog.sectorGrid.unknown',
    defaultMessage: '{count, plural, one {# entrada sem setor confirmado} other {# entradas sem setor confirmado}}',
  },
});
