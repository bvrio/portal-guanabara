<script lang="ts">
import type { CatalogTagItem } from '../types';

export type CatalogTagDimension = 'keyword' | 'sector' | 'other';

/**
 * A keyword or bay sector as a chip with its icon — the small, repeatable
 * way the catalogue shows categories (cards, facts, active filters). With
 * `href` it links to the list filtered by that value.
 */
export interface CatalogTagProps {
  item: CatalogTagItem;
  dimension: CatalogTagDimension;
  size?: 'sm' | 'md';
}
</script>

<script setup lang="ts">
import { inject } from 'vue';

import { LINK_COMPONENT_KEY } from '../../../Shared/components/Link/linkComponent';
import CatalogIcon from '../CatalogIcon/CatalogIcon.vue';

import styles from './CatalogTag.module.scss';

const { item, dimension, size = 'sm' } = defineProps<CatalogTagProps>();

const linkComponent = inject(LINK_COMPONENT_KEY, null);
</script>

<template>
  <component
    :is="item.href ? (linkComponent ?? 'a') : 'span'"
    :href="item.href"
    :class="[styles.root, styles[size], item.href && styles.interactive]"
    :data-tag="`${dimension}:${item.code}`"
  >
    <CatalogIcon
      v-if="dimension === 'keyword'"
      :keyword="item.code"
      :size="size === 'md' ? 'sm' : 'xs'"
      framed
      :class="styles.icon"
    />
    <CatalogIcon v-else-if="dimension === 'sector'" :sector="item.code" :size="size === 'md' ? 'md' : 'sm'" :class="styles.mapIcon" />
    <span :class="styles.label">{{ item.label }}</span>
  </component>
</template>
