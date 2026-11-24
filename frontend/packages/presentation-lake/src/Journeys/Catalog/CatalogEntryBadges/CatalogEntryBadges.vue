<script lang="ts">
import type { CatalogEntryKind, CatalogEntryStatus } from '../types';

/**
 * Kind (initiative or study) as a chip with its icon, and, when confirmed,
 * the status with a dot (green while alive, teal in progress, grey when ended).
 * Without `kind`, only the status (when the kind is shown another way).
 */
export interface CatalogEntryBadgesProps {
  kind?: CatalogEntryKind;
  status?: CatalogEntryStatus | null;
  /** `lg` (v0.9.1): the entry page, where the kind chip carries the only kind icon. */
  size?: 'sm' | 'md' | 'lg';
}

export const catalogStatusTone: Record<CatalogEntryStatus, 'live' | 'progress' | 'done'> = {
  active: 'live',
  published: 'live',
  in_implementation: 'progress',
  in_progress: 'progress',
  ended: 'done',
};
</script>

<script setup lang="ts">
import FormattedMessage from '../../../Shared/foundations/i18n/FormattedMessage.vue';
import { kindMessages, statusMessages } from '../Catalog.messages';
import CatalogIcon from '../CatalogIcon/CatalogIcon.vue';

import styles from './CatalogEntryBadges.module.scss';

const { kind, status = null, size = 'sm' } = defineProps<CatalogEntryBadgesProps>();
</script>

<template>
  <span :class="[styles.root, styles[size]]">
    <span v-if="kind" :class="[styles.badge, styles.kind, styles[kind]]" :data-kind="kind">
      <CatalogIcon :kind="kind" :size="size === 'lg' ? 'md' : size === 'md' ? 'sm' : 'xs'" />
      <FormattedMessage v-bind="kindMessages[kind]" />
    </span>
    <span v-if="status" :class="[styles.badge, styles.status]" :data-status="status">
      <span :class="[styles.dot, styles[catalogStatusTone[status]]]" aria-hidden="true" />
      <FormattedMessage v-bind="statusMessages[status]" />
    </span>
  </span>
</template>
