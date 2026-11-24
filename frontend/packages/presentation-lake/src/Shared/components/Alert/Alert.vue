<script lang="ts">
export type AlertVariant = 'info' | 'success' | 'error';

/**
 * Inline feedback message. `error` is announced immediately (role="alert");
 * `info` / `success` politely (role="status").
 */
export interface AlertProps {
  variant?: AlertVariant;
}
</script>

<script setup lang="ts">
import styles from './Alert.module.scss';

const { variant = 'info' } = defineProps<AlertProps>();
</script>

<template>
  <div :class="[styles.root, styles[variant]]" :role="variant === 'error' ? 'alert' : 'status'">
    <slot />
  </div>
</template>
