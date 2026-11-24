import { createError, defineEventHandler, readBody } from 'h3';

import { parseContribution, saveContribution } from '../contributions/contributions';
import { contributionsEnabled } from '../contributions/flag';

/** POST /api/submissions → { id, status, receivedAt } (v0.9.25; behind the `contributionForms` flag). */
export default defineEventHandler(async (event) => {
  if (!contributionsEnabled(event)) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found', data: { code: 'CONTRIBUTIONS_DISABLED' } });
  }
  const contribution = parseContribution(await readBody(event));
  if (!contribution) {
    throw createError({ statusCode: 422, statusMessage: 'Unprocessable Entity', data: { code: 'CONTRIBUTION_INVALID' } });
  }
  const { id, status, receivedAt } = saveContribution(contribution);
  return { id, status, receivedAt };
});
