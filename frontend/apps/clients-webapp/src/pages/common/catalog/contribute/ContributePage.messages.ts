import { defineMessages } from '@portal-guanabara/presentation-lake';


export const defaultMessages = defineMessages({
  documentTitle: { id: 'clients.contributePage.documentTitle', defaultMessage: 'Contribuir · Portal Guanabara' },
  title: { id: 'clients.contributePage.title', defaultMessage: 'Contribuir com o catálogo' },
  description: {
    id: 'clients.contributePage.description',
    defaultMessage:
      'Conhece uma iniciativa, um estudo ou uma instituição que falta, ou viu algo a corrigir? Conte para nós: a equipe do mapeamento confere antes de publicar.',
  },
  disabledTitle: { id: 'clients.contributePage.disabledTitle', defaultMessage: 'Formulário indisponível' },
  disabledDescription: { id: 'clients.contributePage.disabledDescription', defaultMessage: 'As contribuições ainda não estão abertas.' },
  sentTitle: { id: 'clients.contributePage.sentTitle', defaultMessage: 'Sugestão recebida, obrigado!' },
  recordedTitle: { id: 'clients.contributePage.recordedTitle', defaultMessage: 'Alteração registrada' },
  receipt: { id: 'clients.contributePage.receipt', defaultMessage: 'Protocolo {id}. A equipe do mapeamento confere antes de entrar no catálogo.' },
  another: { id: 'clients.contributePage.another', defaultMessage: 'Enviar outra' },
  error: { id: 'clients.contributePage.error', defaultMessage: 'Não foi possível enviar agora. Confira os campos e tente de novo.' },
});
