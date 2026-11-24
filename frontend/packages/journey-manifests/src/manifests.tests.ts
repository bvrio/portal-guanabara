import {
  defineJourneyManifest,
  getJourneyManifest,
  journeyManifests,
  type JourneyManifest,
  validateManifests,
} from './index.ts';

const base = defineJourneyManifest({
  schemaVersion: 1,
  journey: 'Sample',
  key: 'sample',
  description: 'Test journey.',
  owner: { team: 'test-team' },
  access: { authentication: 'authenticated' },
  features: [{ key: 'sample.do-something', name: 'Do', description: 'Test feature.' }],
  pages: [
    {
      key: 'main',
      name: 'Main',
      app: 'clients-webapp',
      context: 'common',
      path: '/sample',
      features: ['sample.do-something'],
    },
  ],
});

function withChanges(changes: Partial<JourneyManifest>): JourneyManifest {
  return { ...base, ...changes } as JourneyManifest;
}

describe('journey manifests', () => {
  it('ships valid V0 manifests', () => {
    expect(validateManifests(journeyManifests)).toEqual([]);
  });

  it('looks manifests up by key', () => {
    expect(getJourneyManifest('user')?.journey).toBe('User');
    expect(getJourneyManifest('missing')).toBeUndefined();
  });

  it('accepts a valid sample manifest', () => {
    expect(validateManifests([base])).toEqual([]);
  });

  it('rejects features outside the Journey namespace', () => {
    const errors = validateManifests([
      withChanges({ features: [{ key: 'other.thing', name: 'X', description: 'X' }], pages: [] }),
    ]);

    expect(errors.some((error) => error.includes('key must be "sample.<kebab-case>"'))).toBe(true);
  });

  it('rejects pages that reference unknown features', () => {
    const errors = validateManifests([
      withChanges({
        pages: [{ ...base.pages[0], features: ['sample.unknown'] }],
      }),
    ]);

    expect(errors).toContain('Journey "sample" page "main": references unknown Feature "sample.unknown"');
  });

  it('rejects invalid App contexts and unknown authorization vocabulary', () => {
    const errors = validateManifests([
      withChanges({
        access: { authentication: 'authenticated', capabilities: ['made-up' as never] },
        pages: [{ ...base.pages[0], context: 'partner' }],
      }),
    ]);

    expect(errors).toContain('Journey "sample" access: unknown Capability "made-up"');
    expect(errors).toContain('Journey "sample" page "main": context "partner" is not valid for clients-webapp');
  });

  it('rejects public features inside authenticated Journeys', () => {
    const errors = validateManifests([
      withChanges({
        features: [
          { key: 'sample.do-something', name: 'Do', description: 'X', access: { authentication: 'public' } },
        ],
      }),
    ]);

    expect(errors).toContain(
      'Journey "sample" feature "sample.do-something": cannot be public inside an authenticated Journey',
    );
  });

  it('rejects duplicated routes across Journeys', () => {
    const copy = withChanges({ key: 'sample-two', journey: 'SampleTwo', features: [] , pages: [{ ...base.pages[0], features: [] }] });

    expect(validateManifests([base, copy])).toContain(
      'Journey "sample-two" page "main": route clients-webapp:/sample is declared twice',
    );
  });
});
