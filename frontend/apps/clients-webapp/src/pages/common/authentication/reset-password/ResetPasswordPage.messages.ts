import { defineMessages } from '@portal-guanabara/presentation-lake';

export const defaultMessages = defineMessages({
  title: {
    id: 'clients.resetPasswordPage.title',
    defaultMessage: 'Recupere sua senha',
  },
  description: {
    id: 'clients.resetPasswordPage.description',
    defaultMessage: 'Informe seu e-mail e enviaremos um link para redefinir sua senha.',
  },
  backToLogin: {
    id: 'clients.resetPasswordPage.backToLogin',
    defaultMessage: 'Voltar para o login',
  },
  genericError: {
    id: 'clients.resetPasswordPage.genericError',
    defaultMessage: 'Não foi possível enviar o link agora. Tente novamente.',
  },
  requested: {
    id: 'clients.resetPasswordPage.requested',
    defaultMessage: 'Se o e-mail estiver cadastrado, você receberá um link em instantes.',
  },
});
