import { createError } from 'h3';

/** Stable, machine-readable BFF error codes consumed by the Frontend. */
export type BffErrorCode =
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_ALREADY_REGISTERED'
  | 'PASSWORD_TOO_SHORT'
  | 'PASSWORD_MISMATCH'
  | 'INVALID_CURRENT_PASSWORD';

export function bffError(statusCode: number, code: BffErrorCode, message: string = code) {
  return createError({ statusCode, statusMessage: code, message, data: { code } });
}
