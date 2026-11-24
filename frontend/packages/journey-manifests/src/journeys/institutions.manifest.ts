import { defineJourneyManifest } from '../schema.ts';

/**
 * Instituições (v0.6): every institution in the catalog — who executes,
 * funds, partners in or signs the work — with its entries one click away in a
 * side drawer. Built from the same mapping workbook as the Catalog.
 */
export const institutionsManifest = defineJourneyManifest({
  schemaVersion: 1,
  journey: 'Institutions',
  key: 'institutions',
  description:
    'Directory of the institutions in the catalog (executors, funders, partners, authors’ institutions), with their entries in a side drawer.',
  owner: { team: 'portal-core' },
  access: { authentication: 'public' },
  features: [
    {
      key: 'institutions.directory',
      name: 'Institution directory',
      description: 'Search and filters by name, kind of entry, role and type; sort by entries or name; paging.',
    },
    {
      key: 'institutions.drawer',
      name: 'Entries drawer',
      description: 'The entries of one institution in a side drawer, where more filters can be stacked.',
    },
    {
      // Logos appear only with each institution's authorisation (files supplied by BVRio).
      key: 'institutions.logos',
      name: 'Official logos',
      description: 'Official institution logos where authorised; a monogram otherwise.',
    },
  ],
  pages: [
    {
      key: 'list',
      name: 'List',
      app: 'clients-webapp',
      context: 'common',
      path: '/institutions',
      features: ['institutions.directory', 'institutions.drawer', 'institutions.logos'],
    },
  ],
});
