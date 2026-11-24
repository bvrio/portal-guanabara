<script lang="ts">
import type { MessageDescriptor, MessageValues } from '../i18n/types';

export type TypographyVariant =
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'title'
  | 'subtitle';

export interface TypographyProps {
  /** Rendered element, e.g. `p`, `h1`, `span`. */
  as?: string;
  variant?: TypographyVariant;
  /** Renders a message descriptor instead of the default slot. */
  message?: MessageDescriptor;
  values?: MessageValues;
}
</script>

<script setup lang="ts">
import FormattedMessage from '../i18n/FormattedMessage.vue';

import styles from './Typography.module.scss';

const {
  as = 'p',
  variant = 'body',
  message,
  values,
} = defineProps<TypographyProps>();
</script>

<template>
  <component :is="as" :class="[styles.root, styles[variant]]">
    <FormattedMessage v-if="message" v-bind="message" :values="values" />
    <slot v-else />
  </component>
</template>
