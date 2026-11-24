import { defineMessages } from '@portal-guanabara/presentation-lake';

export const defaultMessages = defineMessages({
  title: {
    id: 'clients.userManagementPage.title',
    defaultMessage: 'Gerenciar conta',
  },
  backToOverview: {
    id: 'clients.userManagementPage.backToOverview',
    defaultMessage: 'Voltar para minha conta',
  },
  profileTitle: {
    id: 'clients.userManagementPage.profileTitle',
    defaultMessage: 'Dados pessoais',
  },
  profileSaved: {
    id: 'clients.userManagementPage.profileSaved',
    defaultMessage: 'Seus dados foram atualizados.',
  },
  passwordTitle: {
    id: 'clients.userManagementPage.passwordTitle',
    defaultMessage: 'Senha',
  },
  passwordHint: {
    id: 'clients.userManagementPage.passwordHint',
    defaultMessage: 'Use pelo menos 8 caracteres.',
  },
  passwordChanged: {
    id: 'clients.userManagementPage.passwordChanged',
    defaultMessage: 'Sua senha foi alterada.',
  },
  preferencesTitle: {
    id: 'clients.userManagementPage.preferencesTitle',
    defaultMessage: 'Preferências de comunicação',
  },
  preferencesSaved: {
    id: 'clients.userManagementPage.preferencesSaved',
    defaultMessage: 'Suas preferências foram salvas.',
  },
  invalidCurrentPassword: {
    id: 'clients.userManagementPage.invalidCurrentPassword',
    defaultMessage: 'A senha atual está incorreta.',
  },
  passwordTooShort: {
    id: 'clients.userManagementPage.passwordTooShort',
    defaultMessage: 'A nova senha precisa ter pelo menos 8 caracteres.',
  },
  passwordMismatch: {
    id: 'clients.userManagementPage.passwordMismatch',
    defaultMessage: 'A confirmação não confere com a nova senha.',
  },
  emailAlreadyRegistered: {
    id: 'clients.userManagementPage.emailAlreadyRegistered',
    defaultMessage: 'Este e-mail já está em uso por outra conta.',
  },
  validationError: {
    id: 'clients.userManagementPage.validationError',
    defaultMessage: 'Preencha todos os campos obrigatórios.',
  },
  genericError: {
    id: 'clients.userManagementPage.genericError',
    defaultMessage: 'Não foi possível salvar agora. Tente novamente.',
  },
  loadError: {
    id: 'clients.userManagementPage.loadError',
    defaultMessage: 'Não foi possível carregar seus dados.',
  },
});
