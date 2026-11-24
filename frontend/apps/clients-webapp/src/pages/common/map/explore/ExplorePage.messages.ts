import { defineMessages } from '@portal-guanabara/presentation-lake';

export const defaultMessages = defineMessages({
  documentTitle: { id: 'clients.mapExplorePage.documentTitle', defaultMessage: 'Mapa · Portal Guanabara' },
  title: { id: 'clients.mapExplorePage.title', defaultMessage: 'Mapa do catálogo' },
  unknownSectors: {
    id: 'clients.mapExplorePage.unknownSectors',
    defaultMessage:
      '{count, plural, one {# entrada sem setor confirmado não aparece nos setores} other {# entradas sem setor confirmado não aparecem nos setores}}.',
  },
  unknown: {
    id: 'clients.mapExplorePage.unknown',
    defaultMessage:
      '{count, plural, one {# entrada sem município confirmado não aparece no mapa} other {# entradas sem município confirmado não aparecem no mapa}}.',
  },
  source: {
    id: 'clients.mapExplorePage.source',
    defaultMessage: 'Limites municipais provisórios e simplificados, derivados da malha do IBGE; setores da baía aproximados.',
  },
  sourceLink: { id: 'clients.mapExplorePage.sourceLink', defaultMessage: 'Malhas territoriais do IBGE' },
  loadError: { id: 'clients.mapExplorePage.loadError', defaultMessage: 'Não foi possível carregar o mapa agora.' },
  retry: { id: 'clients.mapExplorePage.retry', defaultMessage: 'Tentar de novo' },
});
