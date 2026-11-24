<script lang="ts">
import type { InstitutionEntryKind, InstitutionRole } from '../types';

export interface InstitutionFiltersValue {
  q: string;
  kind: InstitutionEntryKind | '';
  role: InstitutionRole | '';
  /** Institution type code. */
  type: string;
  sort: 'entries' | 'name';
}

export interface InstitutionFiltersOptions {
  /** Institutions of any kind with the other filters applied (the toggle's "Todos"). */
  allKinds?: number;
  kinds: readonly { value: InstitutionEntryKind; count: number }[];
  roles: readonly { value: InstitutionRole; count: number }[];
  types: readonly { value: string; label: string; count: number }[];
}

/**
 * Search and filters of the institution directory, in an anchored
 * `FilterPanel`, laid out like the Catálogo's (v0.9.22): where it works
 * (Todos · Iniciativas · Estudos, a toggle with counts) beside the name search;
 * pills for role and type; the active filters as removable chips; the results
 * line with the `summary` slot, the sort and the `pagination` slot. `submit`
 * fires on search and on every choice.
 */
export interface InstitutionFiltersProps {
  options: InstitutionFiltersOptions;
  busy?: boolean;
}

export function emptyInstitutionFilters(): InstitutionFiltersValue {
  return { q: '', kind: '', role: '', type: '', sort: 'entries' };
}
</script>

<script setup lang="ts">
import { computed, useId } from 'vue';
import { useIntl } from 'vue-intl';

import Button from '../../../Shared/components/Button/Button.vue';
import FilterMenu from '../../../Shared/components/FilterMenu/FilterMenu.vue';
import FilterPanel from '../../../Shared/components/FilterPanel/FilterPanel.vue';
import Icon from '../../../Shared/foundations/Icon/Icon.vue';
import FormattedMessage from '../../../Shared/foundations/i18n/FormattedMessage.vue';
import { formatMessage } from '../../../Shared/foundations/i18n/formatMessage';
import { institutionRoleMessages } from '../Institutions.messages';

import { InstitutionKindToggle } from './Components/InstitutionKindToggle';

import { defaultMessages } from './InstitutionFilters.messages';
import styles from './InstitutionFilters.module.scss';

const { options, busy = false } = defineProps<InstitutionFiltersProps>();

const filters = defineModel<InstitutionFiltersValue>({ required: true });

const emit = defineEmits<{ submit: []; clear: [] }>();

defineSlots<{ summary?(): unknown; pagination?(): unknown }>();

const intl = useIntl();
const searchId = useId();
const t = (descriptor: Parameters<typeof formatMessage>[1], values?: Record<string, string | number>) =>
  formatMessage(intl, descriptor, values);

const allKinds = computed(() => options.allKinds ?? options.kinds.reduce((most, option) => Math.max(most, option.count), 0));
const roleOptions = computed(() =>
  options.roles
    .filter((option) => option.count > 0 || option.value === filters.value.role)
    .map((option) => ({ value: option.value, label: t(institutionRoleMessages[option.value]), count: option.count })),
);
const typeOptions = computed(() =>
  options.types.filter((option) => option.count > 0 || option.value === filters.value.type),
);
const sortOptions = computed(() => [
  { value: 'entries', label: t(defaultMessages.sortEntries) },
  { value: 'name', label: t(defaultMessages.sortName) },
]);
type ChipKey = 'q' | 'role' | 'type';
/** The kind shows in the toggle; the other filters in use become chips. */
const chips = computed(() => {
  const value = filters.value;
  const list: { key: ChipKey; label: string }[] = [];
  if (value.q.trim()) list.push({ key: 'q', label: `“${value.q.trim()}”` });
  if (value.role) list.push({ key: 'role', label: t(institutionRoleMessages[value.role]) });
  if (value.type) list.push({ key: 'type', label: options.types.find((option) => option.value === value.type)?.label ?? value.type });
  return list;
});
const hasFilters = computed(() => Boolean(filters.value.kind) || chips.value.length > 0);
const CHIP_ICON = { q: 'search', role: 'people', type: 'institution' } as const;

function update(patch: Partial<InstitutionFiltersValue>) {
  filters.value = { ...filters.value, ...patch };
}

function updateAndSubmit(patch: Partial<InstitutionFiltersValue>) {
  update(patch);
  emit('submit');
}

function removeChip(key: ChipKey) {
  updateAndSubmit({ [key]: '' });
}
</script>

<template>
  <FilterPanel>
    <form :class="styles.root" role="search" :aria-busy="busy || undefined" @submit.prevent="emit('submit')">
      <div :class="styles.searchRow">
        <InstitutionKindToggle
          name="kind"
          :label="t(defaultMessages.kind)"
          :options="options.kinds"
          :all-count="allKinds"
          :model-value="filters.kind"
          @update:model-value="updateAndSubmit({ kind: $event })"
        />
        <label :for="searchId" :class="styles.visuallyHidden"><FormattedMessage v-bind="defaultMessages.searchLabel" /></label>
        <span :class="styles.searchField">
          <Icon name="search" size="sm" :class="styles.searchIcon" />
          <input
            :id="searchId"
            :class="styles.searchInput"
            name="q"
            type="search"
            autocomplete="off"
            :value="filters.q"
            :placeholder="t(defaultMessages.searchPlaceholder)"
            @input="update({ q: ($event.target as HTMLInputElement).value })"
          />
        </span>
        <Button type="submit" :disabled="busy"><FormattedMessage v-bind="defaultMessages.submit" /></Button>
      </div>

      <div :class="styles.filterRow">
        <FilterMenu
          name="role"
          :label="t(defaultMessages.role)"
          :all-label="t(defaultMessages.allRoles)"
          :options="roleOptions"
          :model-value="filters.role"
          @update:model-value="updateAndSubmit({ role: $event as InstitutionFiltersValue['role'] })"
        >
          <template #icon><Icon name="people" size="sm" /></template>
        </FilterMenu>
        <FilterMenu
          name="type"
          :label="t(defaultMessages.type)"
          :all-label="t(defaultMessages.allTypes)"
          :options="typeOptions"
          :model-value="filters.type"
          @update:model-value="updateAndSubmit({ type: $event })"
        >
          <template #icon><Icon name="institution" size="sm" /></template>
        </FilterMenu>
      </div>

      <div v-if="hasFilters" :class="styles.activeRow">
        <template v-if="chips.length">
          <span :class="styles.activeLabel"><FormattedMessage v-bind="defaultMessages.active" /></span>
          <ul :class="styles.chips">
            <li v-for="chip in chips" :key="chip.key" :class="styles.chip" :data-chip="chip.key">
              <Icon :name="CHIP_ICON[chip.key]" size="xs" />
              <span>{{ chip.label }}</span>
              <button
                type="button"
                :class="styles.remove"
                :aria-label="t(defaultMessages.remove, { label: chip.label })"
                @click="removeChip(chip.key)"
              >
                <Icon name="close-small" size="xs" />
              </button>
            </li>
          </ul>
        </template>
        <button type="button" :class="styles.clear" data-testid="institution-filters-clear" @click="emit('clear')">
          <FormattedMessage v-bind="defaultMessages.clear" />
        </button>
      </div>
    </form>

    <template #summary><slot name="summary" /></template>
    <template #actions>
      <FilterMenu
        name="sort"
        :label="t(defaultMessages.sort)"
        :options="sortOptions"
        :model-value="filters.sort"
        @update:model-value="updateAndSubmit({ sort: $event as InstitutionFiltersValue['sort'] })"
      >
        <template #icon><Icon name="sliders" size="sm" /></template>
      </FilterMenu>
      <slot name="pagination" />
    </template>
  </FilterPanel>
</template>
