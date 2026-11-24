import { defineJourneyManifest } from '../schema.ts';

export const authenticationManifest = defineJourneyManifest({
  schemaVersion: 1,
  journey: 'Authentication',
  key: 'authentication',
  description: 'Sign-in, account creation and password recovery.',
  owner: { team: 'portal-core' },
  access: { authentication: 'public' },
  features: [
    {
      key: 'authentication.login',
      name: 'Login',
      description: 'Sign in with e-mail and password.',
    },
    {
      key: 'authentication.registration',
      name: 'Registration',
      description: 'Create a new account.',
    },
    {
      key: 'authentication.password-reset',
      name: 'Password reset',
      description: 'Request a link to define a new password.',
    },
  ],
  pages: [
    {
      key: 'login',
      name: 'Login',
      app: 'clients-webapp',
      context: 'common',
      path: '/authentication/login',
      features: ['authentication.login'],
    },
    {
      key: 'registration',
      name: 'Registration',
      app: 'clients-webapp',
      context: 'common',
      path: '/authentication/registration',
      features: ['authentication.registration'],
    },
    {
      key: 'reset-password',
      name: 'ResetPassword',
      app: 'clients-webapp',
      context: 'common',
      path: '/authentication/reset-password',
      features: ['authentication.password-reset'],
    },
  ],
});
