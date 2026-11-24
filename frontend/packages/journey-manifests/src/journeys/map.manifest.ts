import { defineJourneyManifest } from '../schema.ts';

/**
 * Mapa (v0.7): the municipalities around Guanabara Bay with what the catalog
 * has in each, one click away in the side drawer; since v0.8 also the bay's
 * sectors as zones in the water. The outlines (simplified, IBGE-derived) and the
 * zones (hand-drawn) are provisional until their storage is decided with BVRio.
 */
export const mapManifest = defineJourneyManifest({
  schemaVersion: 1,
  journey: 'Map',
  key: 'map',
  description:
    'Map of the municipalities and sectors of Guanabara Bay: initiatives in orange, studies in purple circles, entries in a side drawer.',
  owner: { team: 'portal-core' },
  access: { authentication: 'public' },
  features: [
    {
      key: 'map.municipalities',
      name: 'Municipality map',
      description:
        'The bay and its municipalities; the eight with entries are coloured by initiatives, with a purple circle for their studies and a list beside the map.',
    },
    {
      key: 'map.sectors',
      name: 'Bay sectors',
      description: 'Interior, Transição, Entrada and Fora da Baía as zones in the water, and every sector (Baía inteira too) in a list.',
    },
    {
      key: 'map.drawer',
      name: 'Entries drawer',
      description: 'The entries of one municipality or sector in a side drawer, where more filters can be stacked.',
    },
  ],
  pages: [
    {
      key: 'explore',
      name: 'Explore',
      app: 'clients-webapp',
      context: 'common',
      path: '/map',
      features: ['map.municipalities', 'map.sectors', 'map.drawer'],
    },
  ],
});
