<script lang="ts">
/**
 * The panel that holds a list's search and filters (Catálogo, Instituições).
 * On tablets and desktops it stays anchored right below the sticky site header
 * while the list scrolls; on phones it stays in the flow.
 *
 * Slots: default — the filter rows; `summary` — the results line's text (how
 * many results, what the list is); `actions` — the right end of that line
 * (sort, pagination).
 */
export interface FilterPanelProps {
  /** Anchored while scrolling (≥ 720px). Default true. */
  sticky?: boolean;
}
</script>

<script setup lang="ts">
import styles from './FilterPanel.module.scss';

const { sticky = true } = defineProps<FilterPanelProps>();

defineSlots<{
  default(): unknown;
  summary?(): unknown;
  actions?(): unknown;
}>();
</script>

<template>
  <section :class="[styles.root, sticky && styles.sticky]" data-filter-panel>
    <div :class="styles.body"><slot /></div>
    <div v-if="$slots.summary || $slots.actions" :class="styles.results">
      <div :class="styles.summary"><slot name="summary" /></div>
      <div v-if="$slots.actions" :class="styles.actions"><slot name="actions" /></div>
    </div>
  </section>
</template>
