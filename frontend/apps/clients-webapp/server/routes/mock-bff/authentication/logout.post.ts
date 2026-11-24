import { defineEventHandler } from 'h3';

import { endSession } from '../../../mock-bff/session';

export default defineEventHandler((event) => {
  endSession(event);
  return { authenticated: false };
});
