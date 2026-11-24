import { defineJourneyManifest } from '../schema.ts';

export const userManifest = defineJourneyManifest({
  schemaVersion: 1,
  journey: 'User',
  key: 'user',
  description: "The signed-in user's account: profile, security and preferences.",
  owner: { team: 'portal-core' },
  access: {
    authentication: 'authenticated',
    userTypes: ['interested', 'holder'],
  },
  features: [
    {
      key: 'user.profile-details',
      name: 'Profile details',
      description: 'Read-only view of the account basic data.',
    },
    {
      key: 'user.profile-edit',
      name: 'Profile edit',
      description: 'Update the account basic data.',
    },
    {
      key: 'user.change-password',
      name: 'Change password',
      description: 'Replace the current password.',
    },
    {
      // Example of a User Type rule — adjust to the product decision.
      key: 'user.communication-preferences',
      name: 'Communication preferences',
      description: 'Choose the channels the portal may use to contact the holder.',
      access: { authentication: 'authenticated', userTypes: ['holder'] },
    },
    {
      // Example of a Capability rule.
      key: 'user.premium-benefits',
      name: 'Premium benefits',
      description: 'Benefits reserved to premium holders.',
      access: { authentication: 'authenticated', capabilities: ['holder-premium', 'holder-diamond'] },
    },
  ],
  pages: [
    {
      key: 'overview',
      name: 'Overview',
      app: 'clients-webapp',
      context: 'common',
      path: '/user/overview',
      features: ['user.premium-benefits'],
    },
    {
      key: 'details',
      name: 'Details',
      app: 'clients-webapp',
      context: 'common',
      path: '/user/details',
      features: ['user.profile-details'],
    },
    {
      key: 'management',
      name: 'Management',
      app: 'clients-webapp',
      context: 'common',
      path: '/user/management',
      features: ['user.profile-edit', 'user.change-password', 'user.communication-preferences'],
    },
  ],
});
