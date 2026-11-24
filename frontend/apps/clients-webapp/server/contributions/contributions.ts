const SUBJECTS = ['new-entry', 'fix-entry', 'new-institution', 'fix-institution'] as const;
const TEXT_LIMIT = 4000;

export interface StoredContribution {
  id: string;
  status: 'received' | 'recorded';
  receivedAt: string;
  audience: 'public' | 'team';
  subject: (typeof SUBJECTS)[number];
  fields: Record<string, string>;
}

/**
 * Checks a contribution and keeps only known, trimmed text fields. Returns
 * null when it cannot be accepted. The rules match the form's
 * (CatalogContributionForm): a correction names its target, anything new its
 * name, everything says what; the team signs; an e-mail only with consent.
 */
export function parseContribution(body: unknown): Omit<StoredContribution, 'id' | 'status' | 'receivedAt'> | null {
  if (!body || typeof body !== 'object') return null;
  const input = body as Record<string, unknown>;
  const text = (key: string) => (typeof input[key] === 'string' ? (input[key] as string).trim().slice(0, TEXT_LIMIT) : '');
  const audience = input.audience === 'team' ? 'team' : input.audience === 'public' ? 'public' : null;
  const subject = SUBJECTS.find((value) => value === input.subject);
  if (!audience || !subject) return null;
  const fix = subject.startsWith('fix-');
  const fields: Record<string, string> = {};
  for (const key of ['target', 'kind', 'name', 'details', 'places', 'institutions', 'source', 'contactName', 'contactEmail']) {
    const value = text(key);
    if (value) fields[key] = value;
  }
  if (fields.kind && fields.kind !== 'project' && fields.kind !== 'study') delete fields.kind;
  if (audience === 'team') delete fields.contactEmail;
  if (!fields.details || (fix ? !fields.target : !fields.name)) return null;
  if (audience === 'team' && !fields.contactName) return null;
  if (fields.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.contactEmail)) return null;
  return { audience, subject, fields };
}

/*
 * In memory until the backend stores them (backend.md §6: `submission` table,
 * POST /api/submissions). A restart empties it.
 */
const store: StoredContribution[] = [];

export function saveContribution(contribution: Omit<StoredContribution, 'id' | 'status' | 'receivedAt'>): StoredContribution {
  const stored: StoredContribution = {
    ...contribution,
    id: `sub-${Date.now().toString(36)}-${store.length + 1}`,
    status: contribution.audience === 'team' ? 'recorded' : 'received',
    receivedAt: new Date().toISOString(),
  };
  store.push(stored);
  return stored;
}
