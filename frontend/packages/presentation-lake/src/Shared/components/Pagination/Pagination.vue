<script lang="ts">
/**
 * Previous / next navigation between pages, as one joined control:
 * ‹ Anterior | Página x de n | Próxima ›. The Page owns the state.
 */
export interface PaginationProps {
  /** 1-based. */
  page: number;
  pageCount: number;
  disabled?: boolean;
}
</script>

<script setup lang="ts">
import { useIntl } from 'vue-intl';

import Icon from '../../foundations/Icon/Icon.vue';
import FormattedMessage from '../../foundations/i18n/FormattedMessage.vue';
import { formatMessage } from '../../foundations/i18n/formatMessage';

import { defaultMessages } from './Pagination.messages';
import styles from './Pagination.module.scss';

const { page, pageCount, disabled = false } = defineProps<PaginationProps>();

const emit = defineEmits<{
  change: [page: number];
}>();

const intl = useIntl();
</script>

<template>
  <nav v-if="pageCount > 1" :class="styles.root" :aria-label="formatMessage(intl, defaultMessages.label)">
    <button
      type="button"
      :class="[styles.step, styles.previous]"
      :disabled="disabled || page <= 1"
      data-testid="pagination-previous"
      @click="emit('change', page - 1)"
    >
      <Icon name="arrow-left" size="xs" />
      <FormattedMessage v-bind="defaultMessages.previous" />
    </button>

    <span :class="styles.status" aria-live="polite">
      <FormattedMessage v-bind="defaultMessages.status" :values="{ page, pageCount }" />
    </span>

    <button
      type="button"
      :class="[styles.step, styles.next]"
      :disabled="disabled || page >= pageCount"
      data-testid="pagination-next"
      @click="emit('change', page + 1)"
    >
      <FormattedMessage v-bind="defaultMessages.next" />
      <Icon name="arrow-right" size="xs" />
    </button>
  </nav>
</template>
