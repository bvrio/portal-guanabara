import { defineEventHandler, readBody, setResponseStatus } from 'h3';

import { simulateLatency } from '../../../mock-bff/latency';
import { requireText } from '../../../mock-bff/validation';

/** Always accepted, so the endpoint cannot be used to discover accounts. */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string }>(event);
  requireText(body?.email);
  await simulateLatency();

  setResponseStatus(event, 202);
  return { requested: true };
});
