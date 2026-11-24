import { defineMessages } from '@portal-guanabara/presentation-lake';

export const defaultMessages = defineMessages({
  title: {
    id: 'clients.loginPage.title',
    defaultMessage: 'Entre na sua conta',
  },
  description: {
    id: 'clients.loginPage.description',
    defaultMessage: 'Acesse sua conta para continuar.',
  },
  invalidCredentials: {
    id: 'clients.loginPage.invalidCredentials',
    defaultMessage: 'E-mail ou senha inválidos.',
  },
  genericError: {
    id: 'clients.loginPage.genericError',
    defaultMessage: 'Não foi possível entrar agora. Tente novamente em instantes.',
  },
  registered: {
    id: 'clients.loginPage.registered',
    defaultMessage: 'Conta criada com sucesso! Entre com seu e-mail e senha.',
  },
});
