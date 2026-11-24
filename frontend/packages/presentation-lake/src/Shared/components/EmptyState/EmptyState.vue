<script lang="ts">
/**
 * A quiet panel for "nothing here": no results, not found, no data yet.
 * Content comes through slots: `#title`, default (description), `#actions`.
 */
export interface EmptyStateProps {
  /** Heading level of the title. */
  headingLevel?: 2 | 3;
}
</script>

<script setup lang="ts">
import styles from './EmptyState.module.scss';

const { headingLevel = 2 } = defineProps<EmptyStateProps>();
</script>

<template>
  <section :class="styles.root">
    <component :is="`h${headingLevel}`" v-if="$slots.title" :class="styles.title">
      <slot name="title" />
    </component>
    <div v-if="$slots.default" :class="styles.description">
      <slot />
    </div>
    <div v-if="$slots.actions" :class="styles.actions">
      <slot name="actions" />
    </div>
  </section>
</template>
