import type { MockProfile } from './accounts';
import { MIN_PASSWORD_LENGTH } from './accounts';
import { bffError } from './errors';

export function requireText(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) throw bffError(422, 'VALIDATION_ERROR');
  return value.trim();
}

export function readProfile(body: Record<string, unknown> | undefined): MockProfile {
  return {
    fullName: requireText(body?.fullName),
    cpf: requireText(body?.cpf),
    phone: requireText(body?.phone),
    email: requireText(body?.email),
  };
}

export function assertNewPassword(password: unknown, confirmation: unknown): string {
  const value = typeof password === 'string' ? password : '';
  if (value.length < MIN_PASSWORD_LENGTH) throw bffError(422, 'PASSWORD_TOO_SHORT');
  if (value !== confirmation) throw bffError(422, 'PASSWORD_MISMATCH');
  return value;
}
