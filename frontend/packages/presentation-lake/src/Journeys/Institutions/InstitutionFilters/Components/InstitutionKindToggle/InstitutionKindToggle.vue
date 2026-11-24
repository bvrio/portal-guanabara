<script lang="ts">
import type { InstitutionEntryKind } from '../../../types';

export interface InstitutionKindToggleOption {
  value: InstitutionEntryKind;
  count: number;
}

/**
 * Where the institutions work — both kinds, initiatives or studies (v0.9.22):
 * the same segmented radio group as the Catálogo's kind toggle (kind icons,
 * counts, "Todos" with both icons), drawn in this Journey. An institution can
 * work in both, so "Todos" carries its own count (`allCount`) rather than the
 * sum of the other two.
 */
export interface InstitutionKindToggleProps {
  name: string;
  options: readonly InstitutionKindToggleOption[];
  /** Institutions of any kind (with the other filters applied). */
  allCount: number;
  /** Accessible name of the group. */
  label: string;
}
</script>

<script setup lang="ts">
import Icon from '../../../../../Shared/foundations/Icon/Icon.vue';
import FormattedMessage from '../../../../../Shared/foundations/i18n/FormattedMessage.vue';
import { defaultMessages } from '../../InstitutionFilters.messages';

import styles from './InstitutionKindToggle.module.scss';

const { name, options, allCount, label } = defineProps<InstitutionKindToggleProps>();

const model = defineModel<InstitutionEntryKind | ''>({ required: true });
</script>

<template>
  <div :class="styles.root" role="radiogroup" :aria-label="label">
    <label :class="[styles.segment, model === '' && styles.selected]" data-kind-option="all">
      <input v-model="model" :class="styles.input" type="radio" :name="name" value="" />
      <span :class="styles.both" aria-hidden="true">
        <Icon name="kind-project" size="sm" :class="styles.project" />
        <Icon name="kind-study" size="sm" :class="styles.study" />
      </span>
      <span :class="styles.text"><FormattedMessage v-bind="defaultMessages.all" /></span>
      <span :class="styles.count">{{ allCount }}</span>
    </label>
    <label
      v-for="option in options"
      :key="option.value"
      :class="[styles.segment, model === option.value && styles.selected]"
      :data-kind-option="option.value"
    >
      <input v-model="model" :class="styles.input" type="radio" :name="name" :value="option.value" />
      <Icon :name="option.value === 'project' ? 'kind-project' : 'kind-study'" size="sm" :class="styles[option.value]" />
      <span :class="styles.text"><FormattedMessage v-bind="defaultMessages[option.value]" /></span>
      <span :class="styles.count">{{ option.count }}</span>
    </label>
  </div>
</template>
