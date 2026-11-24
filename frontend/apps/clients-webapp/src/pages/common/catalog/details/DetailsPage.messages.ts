import { defineMessages } from '@portal-guanabara/presentation-lake';

export const defaultMessages = defineMessages({
  documentTitle: { id: 'clients.catalogDetailsPage.documentTitle', defaultMessage: '{name} · Catálogo · Portal Guanabara' },
  notFoundDocumentTitle: {
    id: 'clients.catalogDetailsPage.notFoundDocumentTitle',
    defaultMessage: 'Entrada não encontrada · Catálogo · Portal Guanabara',
  },
  whereTitle: { id: 'clients.catalogDetailsPage.whereTitle', defaultMessage: 'Onde' },
  whatTitle: { id: 'clients.catalogDetailsPage.whatTitle', defaultMessage: 'O quê' },
  mapTitle: { id: 'clients.catalogDetailsPage.mapTitle', defaultMessage: 'No mapa' },
  mapLabel: { id: 'clients.catalogDetailsPage.mapLabel', defaultMessage: 'Mapa da Baía de Guanabara com {places} em destaque' },
  mapLink: { id: 'clients.catalogDetailsPage.mapLink', defaultMessage: 'Abrir o mapa' },
  partiesTitle: { id: 'clients.catalogDetailsPage.partiesTitle', defaultMessage: 'Quem participa' },
  sourcesTitle: { id: 'clients.catalogDetailsPage.sourcesTitle', defaultMessage: 'Fontes' },
  notFoundTitle: { id: 'clients.catalogDetailsPage.notFoundTitle', defaultMessage: 'Entrada não encontrada' },
  notFoundDescription: {
    id: 'clients.catalogDetailsPage.notFoundDescription',
    defaultMessage:
      'Nenhuma iniciativa ou estudo do catálogo tem o ID “{id}”. IDs de entradas removidas não são reutilizados.',
  },
  browseAll: { id: 'clients.catalogDetailsPage.browseAll', defaultMessage: 'Ver todas as entradas' },
  loadError: { id: 'clients.catalogDetailsPage.loadError', defaultMessage: 'Não foi possível carregar esta entrada agora.' },
  retry: { id: 'clients.catalogDetailsPage.retry', defaultMessage: 'Tentar de novo' },
  suggestFix: { id: 'clients.catalogDetailsPage.suggestFix', defaultMessage: 'Viu algo a corrigir? Sugira uma correção' },
});
