<script lang="ts">
export interface CatalogTotals {
  entries: number;
  projects: number;
  studies: number;
  activeProjects: number;
  institutions: number;
  municipalities: number;
}

export type CatalogKeyNumber = 'activeProjects' | 'institutions' | 'municipalities';

/**
 * The headline figures of the catalog, as tiles the reader can open (v0.6):
 * a tile with an `hrefs` entry is a link; the others emit `select` with their
 * key, so the Page decides (a drawer, a scroll…). The total of entries is not
 * repeated here: the initiatives × studies duo already says it. `show` picks
 * which tiles appear (v0.8: Início shows institutions and municipalities only).
 */
export interface CatalogKeyNumbersProps {
  totals: CatalogTotals;
  hrefs?: Partial<Record<CatalogKeyNumber, string>>;
  show?: readonly CatalogKeyNumber[];
}
</script>

<script setup lang="ts">
import StatCard from '../../../Shared/components/StatCard/StatCard.vue';
import Icon from '../../../Shared/foundations/Icon/Icon.vue';
import FormattedMessage from '../../../Shared/foundations/i18n/FormattedMessage.vue';
import CatalogIcon from '../CatalogIcon/CatalogIcon.vue';

import { defaultMessages } from './CatalogKeyNumbers.messages';
import styles from './CatalogKeyNumbers.module.scss';

const { totals, hrefs = {}, show = ['activeProjects', 'institutions', 'municipalities'] } =
  defineProps<CatalogKeyNumbersProps>();

const emit = defineEmits<{ select: [key: CatalogKeyNumber] }>();
</script>

<template>
  <section :class="styles.root" aria-labelledby="catalog-key-numbers-title">
    <h2 id="catalog-key-numbers-title" :class="styles.visuallyHidden">
      <FormattedMessage v-bind="defaultMessages.title" />
    </h2>
    <div :class="styles.grid" :style="{ '--key-numbers-columns': show.length }">
      <StatCard
        v-if="show.includes('activeProjects')"
        :value="totals.activeProjects"
        :href="hrefs.activeProjects"
        :selectable="!hrefs.activeProjects"
        data-stat="active-projects"
        @select="emit('select', 'activeProjects')"
      >
        <template #icon><CatalogIcon kind="project" size="xl" /></template>
        <template #label><FormattedMessage v-bind="defaultMessages.activeProjects" /></template>
        <template #hint>
          <FormattedMessage v-bind="defaultMessages.activeProjectsHint" :values="{ projects: totals.projects }" />
        </template>
        <template #action><FormattedMessage v-bind="defaultMessages.activeProjectsAction" /></template>
      </StatCard>
      <StatCard
        v-if="show.includes('institutions')"
        :value="totals.institutions"
        :href="hrefs.institutions"
        :selectable="!hrefs.institutions"
        data-stat="institutions"
        @select="emit('select', 'institutions')"
      >
        <template #icon><Icon name="institution" size="xl" /></template>
        <template #label><FormattedMessage v-bind="defaultMessages.institutions" /></template>
        <template #hint><FormattedMessage v-bind="defaultMessages.institutionsHint" /></template>
        <template #action><FormattedMessage v-bind="defaultMessages.institutionsAction" /></template>
      </StatCard>
      <StatCard
        v-if="show.includes('municipalities')"
        :value="totals.municipalities"
        :href="hrefs.municipalities"
        :selectable="!hrefs.municipalities"
        data-stat="municipalities"
        @select="emit('select', 'municipalities')"
      >
        <template #icon><Icon name="map-pin" size="xl" /></template>
        <template #label><FormattedMessage v-bind="defaultMessages.municipalities" /></template>
        <template #hint><FormattedMessage v-bind="defaultMessages.municipalitiesHint" /></template>
        <template #action><FormattedMessage v-bind="defaultMessages.municipalitiesAction" /></template>
      </StatCard>
    </div>
  </section>
</template>
