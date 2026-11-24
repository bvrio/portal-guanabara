/**
 * Authorization and App vocabulary shared by every Journey Manifest.
 * Owned by the architecture contracts (root AGENTS.md §3–§5).
 */

export const USER_TYPES = ['interested', 'holder', 'partner', 'backoffice', 'engineer'] as const;
export type UserType = (typeof USER_TYPES)[number];

/** Business-defined Capabilities. Not Feature Flags, not UI concepts. */
export const CAPABILITIES = [
  'accreditation-partner',
  'captation-partner',
  'negotiation-partner',
  'holder-premium',
  'holder-diamond',
  'buyer-3p',
] as const;
export type Capability = (typeof CAPABILITIES)[number];

/** App → allowed context groups for pages/hooks/services. */
export const APP_CONTEXTS = {
  'clients-webapp': ['common', 'interested', 'holder'],
  'partners-webapp': ['partner'],
  'backoffice-webapp': ['common', 'backoffice', 'engineer'],
  'clients-app': ['common', 'interested', 'holder'],
  'partners-app': ['partner'],
} as const;

export type AppName = keyof typeof APP_CONTEXTS;
export type AppContext<A extends AppName = AppName> = (typeof APP_CONTEXTS)[A][number];

export const APPS = Object.keys(APP_CONTEXTS) as AppName[];
