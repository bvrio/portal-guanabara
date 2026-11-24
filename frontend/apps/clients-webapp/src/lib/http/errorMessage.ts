import { httpErrorCode } from './HttpError';

/** Picks the Page message for an error code, falling back to a generic one. */
export function pickErrorMessage<M>(error: unknown, messages: Partial<Record<string, M>>, fallback: M): M {
  const code = httpErrorCode(error);
  return (code && messages[code]) || fallback;
}

export function errorCodeOf(error: unknown): string {
  return httpErrorCode(error) ?? 'UNKNOWN';
}
