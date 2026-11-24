import { defineJourneyManifest } from '../schema.ts';

/**
 * Sobre nós (v0.8; content v0.9; team v0.9.3): the FAPERJ project behind the
 * portal, the team — the two FAPERJ fellows and the Instituto BVRio team — and
 * the two scholarships. Photos arrive from the people themselves.
 */
export const aboutManifest = defineJourneyManifest({
  schemaVersion: 1,
  journey: 'About',
  key: 'about',
  description: 'Who builds Portal Guanabara: the FAPERJ project, the team and the scholarships.',
  owner: { team: 'portal-core' },
  access: { authentication: 'public' },
  features: [
    { key: 'about.project', name: 'Project', description: 'The FAPERJ project: objective, facts and partners.' },
    {
      key: 'about.team',
      name: 'Team',
      description: 'The people behind the portal: the two FAPERJ fellows and the Instituto BVRio team.',
    },
    { key: 'about.funding', name: 'Funding', description: 'The FAPERJ scholarships (ME2 and DE2).' },
  ],
  pages: [
    {
      key: 'overview',
      name: 'Overview',
      app: 'clients-webapp',
      context: 'common',
      path: '/about',
      features: ['about.project', 'about.team', 'about.funding'],
    },
  ],
});
