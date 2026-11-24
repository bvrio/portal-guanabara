import { getRequestHeader, type H3Event } from 'h3';

import { type CatalogLocale, negotiateCatalogLocale } from '@portal-guanabara/catalog-domain';

/**
 * Language of the controlled vocabularies in a response (v0.7): the web app
 * sends the visitor's language as `Accept-Language`; Portuguese otherwise.
 */
export function catalogLocale(event: H3Event): CatalogLocale {
  return negotiateCatalogLocale(getRequestHeader(event, 'accept-language'));
}
