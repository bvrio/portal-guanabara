import type { Meta, StoryObj } from '@storybook/vue3-vite';

import CardGrid from '../../../Shared/primitives/CardGrid/CardGrid.vue';

import CatalogExploreCard from './CatalogExploreCard.vue';

const meta = {
  title: 'Journeys/Catalog/CatalogExploreCard',
  component: CatalogExploreCard,
  args: { tone: 'institution', href: '#', count: 63 },
  render: (args) => ({
    components: { CatalogExploreCard },
    setup: () => ({ args }),
    template: '<CatalogExploreCard v-bind="args"><template #title>Instituições</template><template #line>Executam, financiam, apoiam ou assinam</template></CatalogExploreCard>',
  }),
} satisfies Meta<typeof CatalogExploreCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Institutions: Story = {};

/** The four ways into the catalogue, as on Início (v0.9.20). */
export const All: Story = {
  render: () => ({
    components: { CatalogExploreCard, CardGrid },
    template: `<CardGrid :max-columns="2">
      <CatalogExploreCard tone="project" href="#" :count="24"><template #title>Iniciativas</template><template #line>Ação em campo · 10 ativas</template></CatalogExploreCard>
      <CatalogExploreCard tone="study" href="#" :count="17"><template #title>Estudos</template><template #line>Pesquisa publicada e em andamento</template></CatalogExploreCard>
      <CatalogExploreCard tone="institution" href="#" :count="63"><template #title>Instituições</template><template #line>Executam, financiam, apoiam ou assinam</template></CatalogExploreCard>
      <CatalogExploreCard tone="place" href="#" :count="8"><template #title>Municípios</template><template #line>Com atuação em volta da Baía de Guanabara</template></CatalogExploreCard>
    </CardGrid>`,
  }),
};
