import { defineMessages } from '../../foundations/i18n';

export const defaultMessages = defineMessages({
  label: {
    id: 'presentationLake.components.pagination.label',
    defaultMessage: 'Páginas',
  },
  previous: {
    id: 'presentationLake.components.pagination.previous',
    defaultMessage: 'Anterior',
  },
  next: {
    id: 'presentationLake.components.pagination.next',
    defaultMessage: 'Próxima',
  },
  status: {
    id: 'presentationLake.components.pagination.status',
    defaultMessage: 'Página {page} de {pageCount}',
  },
});
