import { defineMessages } from '@portal-guanabara/presentation-lake';

export const defaultMessages = defineMessages({
  title: {
    id: 'clients.registrationPage.title',
    defaultMessage: 'Crie sua conta',
  },
  emailAlreadyRegistered: {
    id: 'clients.registrationPage.emailAlreadyRegistered',
    defaultMessage: 'Já existe uma conta com este e-mail.',
  },
  passwordTooShort: {
    id: 'clients.registrationPage.passwordTooShort',
    defaultMessage: 'A senha precisa ter pelo menos 8 caracteres.',
  },
  passwordMismatch: {
    id: 'clients.registrationPage.passwordMismatch',
    defaultMessage: 'A confirmação não confere com a senha.',
  },
  validationError: {
    id: 'clients.registrationPage.validationError',
    defaultMessage: 'Preencha todos os campos obrigatórios.',
  },
  genericError: {
    id: 'clients.registrationPage.genericError',
    defaultMessage: 'Não foi possível criar sua conta agora. Tente novamente.',
  },
  alreadyHaveAccount: {
    id: 'clients.registrationPage.alreadyHaveAccount',
    defaultMessage: 'Já tenho conta',
  },
});
