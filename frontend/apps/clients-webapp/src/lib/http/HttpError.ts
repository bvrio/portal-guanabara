/** Error raised by the HTTP client; `code` is the endpoint's stable error code. */
export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  /**
   * Same values in the shape Nuxt reads, so `useAsyncData` keeps them when it
   * wraps the error in a NuxtError (`error.value.statusCode`, `.data.code`).
   */
  readonly statusCode: number;
  readonly data: { code: string };

  constructor(status: number, code: string, message?: string) {
    super(message ?? code);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.statusCode = status;
    this.data = { code };
  }
}

export function isHttpError(error: unknown, code?: string): error is HttpError {
  return error instanceof HttpError && (code === undefined || error.code === code);
}

/** Error code of an HttpError, or of the NuxtError that `useAsyncData` wrapped it in. */
export function httpErrorCode(error: unknown): string | undefined {
  if (error instanceof HttpError) return error.code;
  const data = (error as { data?: { code?: unknown } } | null | undefined)?.data;
  return typeof data?.code === 'string' ? data.code : undefined;
}

interface FetchErrorLike {
  statusCode?: number;
  status?: number;
  data?: { code?: string; data?: { code?: string } };
  message?: string;
}

/** Normalizes ofetch/h3 errors into an HttpError. */
export function toHttpError(error: unknown): HttpError {
  if (error instanceof HttpError) return error;

  const value = (error ?? {}) as FetchErrorLike;
  const status = value.statusCode ?? value.status ?? 0;
  const code = value.data?.data?.code ?? value.data?.code ?? (status ? `HTTP_${status}` : 'NETWORK_ERROR');

  return new HttpError(status, code, value.message);
}
