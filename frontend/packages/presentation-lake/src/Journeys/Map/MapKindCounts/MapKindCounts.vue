<script lang="ts">
/**
 * Initiatives over studies, one per line with the kind's colour dot (v0.9.5) —
 * narrower than "12 iniciativas · 10 estudos" on one line, so the Mapa's two
 * lists fit beside the map.
 */
export interface MapKindCountsProps {
  projects: number;
  studies: number;
}
</script>

<script setup lang="ts">
import FormattedMessage from '../../../Shared/foundations/i18n/FormattedMessage.vue';
import { mapMessages } from '../Map.messages';

import styles from './MapKindCounts.module.scss';

const { projects, studies } = defineProps<MapKindCountsProps>();
</script>

<template>
  <span :class="styles.root" data-kind-counts>
    <span :class="styles.line" data-kind="project">
      <span :class="[styles.dot, styles.project]" aria-hidden="true" />
      <FormattedMessage v-bind="mapMessages.projects" :values="{ count: projects }" />
    </span>
    <span :class="styles.line" data-kind="study">
      <span :class="[styles.dot, styles.study]" aria-hidden="true" />
      <FormattedMessage v-bind="mapMessages.studies" :values="{ count: studies }" />
    </span>
  </span>
</template>
