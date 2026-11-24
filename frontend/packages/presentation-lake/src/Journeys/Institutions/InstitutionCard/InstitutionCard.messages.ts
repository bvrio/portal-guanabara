import { defineMessages } from '../../../Shared/foundations/i18n';

export const defaultMessages = defineMessages({
  unknownType: { id: 'presentationLake.institutions.card.unknownType', defaultMessage: 'Tipo não informado' },
  projects: {
    id: 'presentationLake.institutions.card.projects',
    defaultMessage: '{count, plural, one {# iniciativa} other {# iniciativas}}',
  },
  studies: {
    id: 'presentationLake.institutions.card.studies',
    defaultMessage: '{count, plural, one {# estudo} other {# estudos}}',
  },
});
