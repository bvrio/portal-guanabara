import { defineJourneyManifest } from '../schema.ts';

export const homeManifest = defineJourneyManifest({
  schemaVersion: 1,
  journey: 'Home',
  key: 'home',
  description:
    'Entry point of the portal: the panorama of the catalogue (both halves, key numbers, bay sectors, themes, mechanisms, studies by academic institution, highlights), previews in a side drawer and the guided tour.',
  owner: { team: 'portal-core' },
  access: { authentication: 'public' },
  features: [
    {
      key: 'home.guided-tour',
      name: 'Guided tour',
      description: 'Interactive tour that highlights, one by one, the main things a visitor can do on the portal.',
    },
    {
      key: 'home.catalog-summary',
      name: 'Catalogue summary',
      description:
        'Initiatives × studies duo (“Explorar o catálogo”) and the key numbers — institutions and municipalities — each opening its tab.',
    },
    {
      key: 'home.catalog-sectors',
      name: 'Bay sectors',
      description: 'Entries by bay sector, drawn on the bay.',
    },
    {
      key: 'home.catalog-distributions',
      name: 'Distributions',
      description: 'Entries by keyword and mechanism of action, and studies by academic institution.',
    },
    {
      key: 'home.catalog-highlights',
      name: 'Highlights',
      description: 'Ongoing initiatives and the most recent studies.',
    },
    {
      key: 'home.catalog-drawer',
      name: 'Entries drawer',
      description:
        'Side drawer with the entries behind a sector, a bar or a key number, opened without leaving Home; filters stack and “+ Filtro” adds more.',
    },
  ],
  pages: [
    {
      key: 'home',
      name: 'Home',
      app: 'clients-webapp',
      context: 'common',
      path: '/',
      features: [
        'home.guided-tour',
        'home.catalog-summary',
        'home.catalog-sectors',
        'home.catalog-distributions',
        'home.catalog-highlights',
        'home.catalog-drawer',
      ],
    },
  ],
});
