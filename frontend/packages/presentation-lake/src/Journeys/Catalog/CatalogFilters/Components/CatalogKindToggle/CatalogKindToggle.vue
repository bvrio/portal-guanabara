<script lang="ts">
import type { CatalogEntryKind } from '../../../types';

export interface CatalogKindToggleOption {
  value: CatalogEntryKind;
  count: number;
}

/**
 * Both kinds, or only one: a radio group whose segments carry the kind icons
 * and counts, so the current scope is visible at a glance ("Todos" shows both
 * icons). Native radios keep arrow-key navigation.
 */
export interface CatalogKindToggleProps {
  name: string;
  options: readonly CatalogKindToggleOption[];
  /** Accessible name of the group. */
  label: string;
}
</script>

<script setup lang="ts">
import { computed } from 'vue';

import FormattedMessage from '../../../../../Shared/foundations/i18n/FormattedMessage.vue';
import { kindPluralMessages } from '../../../Catalog.messages';
import CatalogIcon from '../../../CatalogIcon/CatalogIcon.vue';
import { defaultMessages } from '../../CatalogFilters.messages';

import styles from './CatalogKindToggle.module.scss';

const { name, options, label } = defineProps<CatalogKindToggleProps>();

const model = defineModel<CatalogEntryKind | ''>({ required: true });

const total = computed(() => options.reduce((sum, option) => sum + option.count, 0));
</script>

<template>
  <div :class="styles.root" role="radiogroup" :aria-label="label">
    <label :class="[styles.segment, model === '' && styles.selected]" data-kind-option="all">
      <input v-model="model" :class="styles.input" type="radio" :name="name" value="" />
      <span :class="styles.both" aria-hidden="true">
        <CatalogIcon kind="project" size="sm" />
        <CatalogIcon kind="study" size="sm" />
      </span>
      <span :class="styles.text"><FormattedMessage v-bind="defaultMessages.all" /></span>
      <span :class="styles.count">{{ total }}</span>
    </label>
    <label
      v-for="option in options"
      :key="option.value"
      :class="[styles.segment, model === option.value && styles.selected]"
      :data-kind-option="option.value"
    >
      <input v-model="model" :class="styles.input" type="radio" :name="name" :value="option.value" />
      <CatalogIcon :kind="option.value" size="sm" />
      <span :class="styles.text"><FormattedMessage v-bind="kindPluralMessages[option.value]" /></span>
      <span :class="styles.count">{{ option.count }}</span>
    </label>
  </div>
</template>
