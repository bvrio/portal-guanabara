import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { sources } from '../../../../tests/fixtures/catalog';

import { CatalogEntrySources } from './index';

const meta = {
  title: 'Journeys/Catalog/CatalogEntrySources',
  component: CatalogEntrySources,
  args: { sources, sourceTypes: ['Artigo científico'], venues: ['Marine Pollution Bulletin'], publicationYears: [2019] },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CatalogEntrySources>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SinglePairedSource: Story = {};

export const SeveralLinks: Story = {
  args: {
    sources: [
      { url: 'https://www.bvrio.org/pt-br/pescandoresiduos/', doi: null, note: null, sourceType: null, venue: null, publishedYear: null },
      {
        url: 'https://agenciabrasil.ebc.com.br/meio-ambiente/noticia/2025-07/pescadores-tiram-46-toneladas-de-lixo',
        doi: null,
        note: null,
        sourceType: null,
        venue: null,
        publishedYear: null,
      },
      { url: 'https://www.redalyc.org/pdf/3883/388340132012.pdf', doi: null, note: 'PDF do artigo', sourceType: null, venue: null, publishedYear: null },
    ],
    sourceTypes: ['Site institucional', 'Reportagem'],
    venues: ['Agência Brasil'],
    publicationYears: [2024, 2025, 2026],
  },
};
