<script lang="ts">
/**
 * “Em construção”: a page or section whose content is still on its way. The
 * default slot says what is coming. Soft orange with black ink, like the
 * other markers that ask for attention without being an action.
 */
export interface AboutWorkInProgressProps {
  /** `inverse` on the dark structure bands (the page hero). */
  tone?: 'default' | 'inverse';
}
</script>

<script setup lang="ts">
import Icon from '../../../Shared/foundations/Icon/Icon.vue';
import FormattedMessage from '../../../Shared/foundations/i18n/FormattedMessage.vue';

import { defaultMessages } from './AboutWorkInProgress.messages';
import styles from './AboutWorkInProgress.module.scss';

const { tone = 'default' } = defineProps<AboutWorkInProgressProps>();
</script>

<template>
  <p :class="[styles.root, styles[tone]]" data-work-in-progress>
    <span :class="styles.label">
      <Icon name="clock" size="xs" />
      <FormattedMessage v-bind="defaultMessages.label" />
    </span>
    <span v-if="$slots.default" :class="styles.text"><slot /></span>
  </p>
</template>
