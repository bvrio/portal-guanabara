<script lang="ts">
/**
 * The one grid for card collections across the project: 1 column on phones
 * (< 720px), 2 on tablets and laptops (720–1599px), 3 on the largest screens
 * (≥ 1600px). Cards in a row stretch to the same height.
 *
 * Render it as a list (`as="ol"` / `"ul"`) when the cards are a list of
 * results; its children should then be `<li>` elements.
 */
export interface CardGridProps {
  as?: string;
  /** Cap the columns (e.g. 2 for a pair of cards). */
  maxColumns?: 1 | 2 | 3;
}
</script>

<script setup lang="ts">
import styles from './CardGrid.module.scss';

const { as = 'div', maxColumns = 3 } = defineProps<CardGridProps>();
</script>

<template>
  <component :is="as" :class="[styles.root, styles[`max${maxColumns}`]]">
    <slot />
  </component>
</template>
