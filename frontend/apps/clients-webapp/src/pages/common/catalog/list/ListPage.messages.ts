import { defineMessages } from '@portal-guanabara/presentation-lake';

export const defaultMessages = defineMessages({
  documentTitle: {
    id: 'clients.catalogListPage.documentTitle',
    defaultMessage: 'Catálogo · Portal Guanabara',
  },
  title: { id: 'clients.catalogListPage.title', defaultMessage: 'Catálogo de iniciativas e estudos' },
  introduction: {
    id: 'clients.catalogListPage.introduction',
    defaultMessage:
      'Iniciativas em campo e estudos sobre resíduos na Baía de Guanabara. Combine os filtros para chegar ao que procura.',
  },
  total: {
    id: 'clients.catalogListPage.total',
    defaultMessage: '{total, plural, =0 {Nenhuma entrada} one {# entrada} other {# entradas}}',
  },
  count: {
    id: 'clients.catalogListPage.count',
    defaultMessage:
      '{total, plural, =0 {Nenhuma entrada encontrada} one {# entrada encontrada} other {# entradas encontradas}}',
  },
  emptyTitle: { id: 'clients.catalogListPage.emptyTitle', defaultMessage: 'Nada por aqui com esses filtros' },
  emptyDescription: {
    id: 'clients.catalogListPage.emptyDescription',
    defaultMessage: 'Tente outras palavras ou remova algum filtro.',
  },
  clearFilters: { id: 'clients.catalogListPage.clearFilters', defaultMessage: 'Limpar filtros' },
  loadError: { id: 'clients.catalogListPage.loadError', defaultMessage: 'Não foi possível carregar as entradas agora.' },
  retry: { id: 'clients.catalogListPage.retry', defaultMessage: 'Tentar de novo' },
  suggestQuestion: {
    id: 'clients.catalogListPage.suggestQuestion',
    defaultMessage: 'Conhece uma iniciativa ou um estudo que não está aqui?',
  },
  suggest: { id: 'clients.catalogListPage.suggest', defaultMessage: 'Sugira uma entrada' },
});
