import { defineEventHandler, getRequestURL } from 'h3';

import { useRuntimeConfig } from '#imports';

import { bffError } from '../mock-bff/errors';

/** Turns every /mock-bff route off when the real BFF is in use. */
export default defineEventHandler((event) => {
  if (!getRequestURL(event).pathname.startsWith('/mock-bff/')) return;

  if (!useRuntimeConfig(event).mockBff.enabled) {
    throw bffError(404, 'NOT_FOUND', 'Mock BFF is disabled');
  }
});
