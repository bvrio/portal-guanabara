<script lang="ts">
import type { CatalogPartialDate } from '../types';

/** When an entry ran: dates at their precision, "em curso", or "não informado". */
export interface CatalogPeriodProps {
  start: CatalogPartialDate | null;
  end: CatalogPartialDate | null;
  ongoing?: boolean;
}
</script>

<script setup lang="ts">
import { computed } from 'vue';
import { useIntl } from 'vue-intl';

import { formatMessage } from '../../../Shared/foundations/i18n/formatMessage';

import { defaultMessages } from './CatalogPeriod.messages';
import styles from './CatalogPeriod.module.scss';
import { formatPartialDate, partialDateTime } from './formatPartialDate';

const { start, end, ongoing = false } = defineProps<CatalogPeriodProps>();

const intl = useIntl();

const text = computed(() => {
  const from = start && formatPartialDate(intl, start);
  const to = end && formatPartialDate(intl, end);

  if (from && to) return formatMessage(intl, defaultMessages.range, { start: from, end: to });
  if (from && ongoing) return formatMessage(intl, defaultMessages.ongoingSince, { start: from });
  if (from) return formatMessage(intl, defaultMessages.since, { start: from });
  if (to) return formatMessage(intl, defaultMessages.until, { end: to });
  if (ongoing) return formatMessage(intl, defaultMessages.ongoing);
  return formatMessage(intl, defaultMessages.unknown);
});

const datetime = computed(() => {
  if (start && end) return `${partialDateTime(start)}/${partialDateTime(end)}`;
  return start ? partialDateTime(start) : end ? partialDateTime(end) : undefined;
});
</script>

<template>
  <time v-if="datetime" :class="styles.root" :datetime="datetime">{{ text }}</time>
  <span v-else :class="[styles.root, styles.unknown]">{{ text }}</span>
</template>
