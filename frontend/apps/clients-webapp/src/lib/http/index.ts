export { API_BASE_PATH, apiClient, createHttpClient, createNuxtTransport, mockBffClient } from './httpClient';
export { HttpError, httpErrorCode, isHttpError, toHttpError } from './HttpError';
export { errorCodeOf, pickErrorMessage } from './errorMessage';

export type { BaseUrl, HttpClient, HttpMethod, HttpQuery, HttpRequest, HttpTransport } from './httpClient';
