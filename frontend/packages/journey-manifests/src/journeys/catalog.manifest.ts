import { defineJourneyManifest } from '../schema.ts';

export const catalogManifest = defineJourneyManifest({
  schemaVersion: 1,
  journey: 'Catalog',
  key: 'catalog',
  description:
    'Public catalog of initiatives and studies about waste in Guanabara Bay, built from the mapping workbook (Core v2.0).',
  owner: { team: 'portal-core' },
  // Everything in the catalog is published information (Core v2.0, D-042).
  access: { authentication: 'public' },
  // The catalogue's panorama (key numbers, sectors, distributions, highlights)
  // lives on Home since v0.5; the Catalog Journey is the list and the entries.
  features: [
    {
      key: 'catalog.search',
      name: 'Search and filters',
      description:
        'Text search and filters by kind, status, period, keyword, municipality, bay sector and mechanism.',
    },
    {
      key: 'catalog.entry-details',
      name: 'Entry details',
      description: 'Everything published about one initiative or study, addressed by its workbook ID (D-047).',
    },
    {
      key: 'catalog.entry-map',
      name: 'Entry mini map',
      description: 'A static map of the bay with the municipalities and bay sectors of the entry highlighted (v0.9).',
    },
    {
      key: 'catalog.entry-drawer',
      name: 'Participant entries',
      description: 'Each participating institution opens its other catalogue entries in the side drawer (v0.9).',
    },
    {
      // Rollout is controlled by the `catalogPersonNames` Feature Flag until
      // BVRio answers the LGPD question (Core v2.0, open question 4).
      key: 'catalog.person-names',
      name: 'Person names',
      description: 'Coordinators and study authors shown by name.',
    },
    {
      // Rollout is controlled by the `contributionForms` Feature Flag (v0.9.25).
      key: 'catalog.contribution',
      name: 'Contributions',
      description:
        'One form to suggest a new initiative, study or institution, or a correction; the internal team records changes with it too.',
    },
  ],
  pages: [
    {
      key: 'list',
      name: 'List',
      app: 'clients-webapp',
      context: 'common',
      path: '/catalog',
      features: ['catalog.search'],
    },
    {
      key: 'details',
      name: 'Details',
      app: 'clients-webapp',
      context: 'common',
      path: '/catalog/:id',
      features: ['catalog.entry-details', 'catalog.entry-map', 'catalog.entry-drawer', 'catalog.person-names'],
    },
    {
      key: 'contribute',
      name: 'Contribute',
      app: 'clients-webapp',
      context: 'common',
      path: '/catalog/contribute',
      features: ['catalog.contribution'],
    },
  ],
});
