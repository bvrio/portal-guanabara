<script lang="ts">
export type DescriptionListLayout = 'stacked' | 'columns';

/** Term/description pairs (<dl>). Compose with <DescriptionListItem>. */
export interface DescriptionListProps {
  /** `columns`: term and description side by side from tablet width up. */
  layout?: DescriptionListLayout;
}
</script>

<script setup lang="ts">
import styles from './DescriptionList.module.scss';

const { layout = 'columns' } = defineProps<DescriptionListProps>();
</script>

<template>
  <dl :class="[styles.root, styles[layout]]">
    <slot />
  </dl>
</template>
