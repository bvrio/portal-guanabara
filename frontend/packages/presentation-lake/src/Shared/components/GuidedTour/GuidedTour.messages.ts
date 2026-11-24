import { defineMessages } from '../../foundations/i18n';

export const defaultMessages = defineMessages({
  progress: { id: 'presentationLake.guidedTour.progress', defaultMessage: 'Passo {current} de {total}' },
  next: { id: 'presentationLake.guidedTour.next', defaultMessage: 'Próximo' },
  previous: { id: 'presentationLake.guidedTour.previous', defaultMessage: 'Anterior' },
  done: { id: 'presentationLake.guidedTour.done', defaultMessage: 'Concluir' },
  skip: { id: 'presentationLake.guidedTour.skip', defaultMessage: 'Sair do tour' },
});
