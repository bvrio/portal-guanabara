<script lang="ts">
export type CardVariant = 'primary' | 'secondary' | 'ghost';
export type CardSize = 'sm' | 'md' | 'lg';

export interface CardProps {
  variant?: CardVariant;
  size?: CardSize;
  fullWidth?: boolean;
}
</script>

<script setup lang="ts">
import styles from './Card.module.scss';

/**
 * Card is a layout container rather than a button so it can safely compose
 * controls such as Button and Input. Use <Card.Row> to define each row's grid
 * and <Card.Cell> to group multiple components within a column.
 */
const {
  variant = 'primary',
  size = 'md',
  fullWidth = false,
} = defineProps<CardProps>();
</script>

<template>
  <div
    :class="[
      styles.root,
      styles[`variant-${variant}`],
      styles[`size-${size}`],
      fullWidth && styles.fullWidth,
    ]"
  >
    <slot />
  </div>
</template>
