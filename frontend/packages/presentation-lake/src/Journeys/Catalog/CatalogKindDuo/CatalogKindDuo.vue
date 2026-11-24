<script lang="ts">
/**
 * The catalogue's two halves side by side — field action (initiatives) and
 * research (studies) — each a large link card with its icon, count and a short
 * line. Since v0.9.20 each half is a `CatalogExploreCard`, the card Início also
 * uses for Instituições and Municípios.
 */
export interface CatalogKindDuoProps {
  projects: { count: number; active: number; href: string };
  studies: { count: number; href: string };
  /** Heading level of the card titles. */
  headingLevel?: 2 | 3;
}
</script>

<script setup lang="ts">
import CardGrid from '../../../Shared/primitives/CardGrid/CardGrid.vue';
import FormattedMessage from '../../../Shared/foundations/i18n/FormattedMessage.vue';
import { kindPluralMessages } from '../Catalog.messages';
import CatalogExploreCard from '../CatalogExploreCard/CatalogExploreCard.vue';

import { defaultMessages } from './CatalogKindDuo.messages';

const { projects, studies, headingLevel = 2 } = defineProps<CatalogKindDuoProps>();
</script>

<template>
  <CardGrid :max-columns="2">
    <CatalogExploreCard tone="project" :href="projects.href" :count="projects.count" :heading-level="headingLevel" data-kind="project">
      <template #title><FormattedMessage v-bind="kindPluralMessages.project" /></template>
      <template #line><FormattedMessage v-bind="defaultMessages.projectsLine" :values="{ active: projects.active }" /></template>
    </CatalogExploreCard>
    <CatalogExploreCard tone="study" :href="studies.href" :count="studies.count" :heading-level="headingLevel" data-kind="study">
      <template #title><FormattedMessage v-bind="kindPluralMessages.study" /></template>
      <template #line><FormattedMessage v-bind="defaultMessages.studiesLine" /></template>
    </CatalogExploreCard>
  </CardGrid>
</template>
