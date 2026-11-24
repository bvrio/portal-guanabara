<script lang="ts">
import type { SpacingScale } from '../../foundations/tokens';

export type InlineAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type InlineJustify =
  | 'start'
  | 'center'
  | 'end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

export interface InlineProps {
  gap?: SpacingScale;
  align?: InlineAlign;
  justify?: InlineJustify;
  wrap?: boolean;
}
</script>

<script setup lang="ts">
import { computed } from 'vue';

import { spacingScale } from '../../foundations/tokens';

import styles from './Inline.module.scss';

const {
  gap = 4,
  align = 'center',
  justify = 'start',
  wrap = false,
} = defineProps<InlineProps>();

const cssVariables = computed(() => ({
  '--inline-gap': spacingScale[gap],
}));
</script>

<template>
  <div
    :class="[
      styles.root,
      styles[`align-${align}`],
      styles[`justify-${justify}`],
      wrap && styles.wrap,
    ]"
    :style="cssVariables"
  >
    <slot />
  </div>
</template>
