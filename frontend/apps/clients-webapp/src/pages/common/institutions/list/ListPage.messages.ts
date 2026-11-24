import { defineMessages } from '@portal-guanabara/presentation-lake';

export const defaultMessages = defineMessages({
  documentTitle: { id: 'clients.institutionsListPage.documentTitle', defaultMessage: 'Instituições · Portal Guanabara' },
  title: { id: 'clients.institutionsListPage.title', defaultMessage: 'Instituições do catálogo' },
  introduction: {
    id: 'clients.institutionsListPage.introduction',
    defaultMessage:
      'Quem executa, financia, apoia ou assina os trabalhos do catálogo. Clique numa instituição para ver as entradas ao lado.',
  },
  total: {
    id: 'clients.institutionsListPage.total',
    defaultMessage: '{total, plural, =0 {Nenhuma instituição} one {# instituição} other {# instituições}}',
  },
  count: {
    id: 'clients.institutionsListPage.count',
    defaultMessage:
      '{total, plural, =0 {Nenhuma instituição encontrada} one {# instituição encontrada} other {# instituições encontradas}}',
  },
  emptyTitle: { id: 'clients.institutionsListPage.emptyTitle', defaultMessage: 'Nenhuma instituição com esses filtros' },
  emptyDescription: {
    id: 'clients.institutionsListPage.emptyDescription',
    defaultMessage: 'Tente outro nome ou remova algum filtro.',
  },
  clearFilters: { id: 'clients.institutionsListPage.clearFilters', defaultMessage: 'Limpar filtros' },
  loadError: { id: 'clients.institutionsListPage.loadError', defaultMessage: 'Não foi possível carregar as instituições agora.' },
  retry: { id: 'clients.institutionsListPage.retry', defaultMessage: 'Tentar de novo' },
});
