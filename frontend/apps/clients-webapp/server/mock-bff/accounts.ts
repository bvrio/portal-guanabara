import type { Capability, UserType } from '@portal-guanabara/journey-manifests';

export interface MockProfile {
  fullName: string;
  cpf: string;
  phone: string;
  email: string;
}

export interface MockPreferences {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
}

export interface MockAccount {
  id: string;
  label: string;
  password: string;
  userType: UserType;
  capabilities: Capability[];
  profile: MockProfile;
  preferences: MockPreferences;
}

export const MOCK_PASSWORD = 'teste1234';
export const MIN_PASSWORD_LENGTH = 8;

function seed(): MockAccount[] {
  return [
    {
      id: 'acc-interested',
      label: 'Interessado',
      password: MOCK_PASSWORD,
      userType: 'interested',
      capabilities: [],
      profile: {
        fullName: 'Ana Interessada',
        cpf: '111.111.111-11',
        phone: '(21) 91111-1111',
        email: 'interessado@teste.com',
      },
      preferences: { email: true, sms: false, whatsapp: false },
    },
    {
      id: 'acc-holder',
      label: 'Titular',
      password: MOCK_PASSWORD,
      userType: 'holder',
      capabilities: [],
      profile: {
        fullName: 'Bruno Titular',
        cpf: '222.222.222-22',
        phone: '(21) 92222-2222',
        email: 'titular@teste.com',
      },
      preferences: { email: true, sms: true, whatsapp: false },
    },
    {
      id: 'acc-premium',
      label: 'Titular Premium',
      password: MOCK_PASSWORD,
      userType: 'holder',
      capabilities: ['holder-premium'],
      profile: {
        fullName: 'Carla Premium',
        cpf: '333.333.333-33',
        phone: '(21) 93333-3333',
        email: 'premium@teste.com',
      },
      preferences: { email: true, sms: true, whatsapp: true },
    },
  ];
}

const accounts = new Map<string, MockAccount>();

/** Resets the in-memory store to the seeded accounts (also used by tests). */
export function resetAccounts() {
  accounts.clear();
  for (const account of seed()) accounts.set(account.id, account);
}

resetAccounts();

const normalize = (email: string) => email.trim().toLowerCase();

export function findAccountById(id: string | undefined): MockAccount | undefined {
  return id ? accounts.get(id) : undefined;
}

export function findAccountByEmail(email: string): MockAccount | undefined {
  const wanted = normalize(email);
  return [...accounts.values()].find((account) => normalize(account.profile.email) === wanted);
}

export function listAccounts(): MockAccount[] {
  return [...accounts.values()];
}

export function createAccount(profile: MockProfile, password: string): MockAccount {
  const account: MockAccount = {
    id: `acc-${Math.random().toString(36).slice(2, 10)}`,
    label: profile.fullName,
    password,
    userType: 'interested',
    capabilities: [],
    profile: { ...profile, email: profile.email.trim() },
    preferences: { email: false, sms: false, whatsapp: false },
  };

  accounts.set(account.id, account);
  return account;
}
