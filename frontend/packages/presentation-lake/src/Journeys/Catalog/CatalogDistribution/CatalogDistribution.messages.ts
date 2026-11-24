import { defineMessages } from '../../../Shared/foundations/i18n';

export const defaultMessages = defineMessages({
  more: {
    id: 'presentationLake.catalog.distribution.more',
    defaultMessage: '{count, plural, one {Mais # categoria} other {Mais # categorias}} com menos entradas',
  },
  unknown: {
    id: 'presentationLake.catalog.distribution.unknown',
    defaultMessage:
      '{count, plural, one {# entrada sem informação confirmada} other {# entradas sem informação confirmada}}',
  },
  empty: { id: 'presentationLake.catalog.distribution.empty', defaultMessage: 'Nenhuma entrada com esta informação.' },
  projects: {
    id: 'presentationLake.catalog.distribution.projects',
    defaultMessage: '{count, plural, one {# iniciativa} other {# iniciativas}}',
  },
  studies: {
    id: 'presentationLake.catalog.distribution.studies',
    defaultMessage: '{count, plural, one {# estudo} other {# estudos}}',
  },
});
