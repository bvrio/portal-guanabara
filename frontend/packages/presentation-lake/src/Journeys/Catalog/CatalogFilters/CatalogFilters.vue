<script lang="ts">
import type { CatalogEntryKind, CatalogEntryStatus } from '../types';

export interface CatalogFiltersValue {
  q: string;
  kind: CatalogEntryKind | '';
  status: CatalogEntryStatus | '';
  /** Period, `YYYY-MM` or "" (open). */
  from: string;
  to: string;
  keyword: string;
  municipality: string;
  sector: string;
  mechanism: string;
  /** Institution slug. */
  institution: string;
  sort: 'recent' | 'name';
}

export interface CatalogFilterOption {
  value: string;
  label: string;
  count: number;
}

export interface CatalogFiltersOptions {
  kinds: readonly { value: CatalogEntryKind; count: number }[];
  statuses: readonly { value: CatalogEntryStatus; count: number }[];
  keywords: readonly CatalogFilterOption[];
  municipalities: readonly CatalogFilterOption[];
  sectors: readonly CatalogFilterOption[];
  mechanisms: readonly CatalogFilterOption[];
  institutions: readonly CatalogFilterOption[];
  /** First and last month any entry covers (calendar bounds). */
  period: { first: string | null; last: string | null };
}

/**
 * Search and filters of the catalog list, in an anchored `FilterPanel`:
 *
 * 1. kind toggle (both kinds / initiatives / studies, with icons and
 *    counts), search field and button;
 * 2. pills that open small menus — status, period (month calendar), keyword
 *    (grouped by category, with icons), bay sector (with the sector maps),
 *    municipality, institution (searchable), mechanism;
 * 3. the active filters as removable chips, with their icons;
 * 4. the results line: the `summary` slot (count and what the list is), the
 *    sort and the `pagination` slot.
 *
 * The value is a v-model; `submit` fires on the search button and whenever a
 * filter changes, so the Page can apply the filters (e.g. to the URL).
 */
export interface CatalogFiltersProps {
  options: CatalogFiltersOptions;
  busy?: boolean;
  /** Anchored while the list scrolls (≥ 720px). Default true. */
  sticky?: boolean;
  /** "Now" as `YYYY-MM` for the period presets (defaults to the current month). */
  today?: string;
  /**
   * Entries in the current results (v0.9). With it, a filter that cannot
   * narrow them — no value, or only values every result already has — is
   * hidden until it would change something; an active filter always stays.
   */
  total?: number;
}

export function emptyCatalogFilters(): CatalogFiltersValue {
  return {
    q: '',
    kind: '',
    status: '',
    from: '',
    to: '',
    keyword: '',
    municipality: '',
    sector: '',
    mechanism: '',
    institution: '',
    sort: 'recent',
  };
}

type ChipKey = 'q' | 'status' | 'period' | 'keyword' | 'sector' | 'municipality' | 'institution' | 'mechanism';
</script>

<script setup lang="ts">
import { computed, useId } from 'vue';
import { useIntl } from 'vue-intl';

import Button from '../../../Shared/components/Button/Button.vue';
import FilterPanel from '../../../Shared/components/FilterPanel/FilterPanel.vue';
import Icon from '../../../Shared/foundations/Icon/Icon.vue';
import FormattedMessage from '../../../Shared/foundations/i18n/FormattedMessage.vue';
import { FilterMenu, type FilterMenuGroup, type FilterMenuOption } from '../../../Shared/components/FilterMenu';
import { formatMessage } from '../../../Shared/foundations/i18n/formatMessage';
import { statusMessages, topicMessages } from '../Catalog.messages';
import { catalogStatusTone } from '../CatalogEntryBadges/CatalogEntryBadges.vue';
import CatalogIcon from '../CatalogIcon/CatalogIcon.vue';
import CatalogMechanismIcon from '../CatalogMechanismIcon/CatalogMechanismIcon.vue';
import { catalogKeywordIcon, type CatalogTopic } from '../CatalogIcon/catalogIcons';

import { CatalogKindToggle } from './Components/CatalogKindToggle';
import { CatalogPeriodPicker, type CatalogPeriodRange } from './Components/CatalogPeriodPicker';
import { defaultMessages } from './CatalogFilters.messages';
import styles from './CatalogFilters.module.scss';

const { options, busy = false, sticky = true, today, total } = defineProps<CatalogFiltersProps>();

defineSlots<{
  summary?(): unknown;
  pagination?(): unknown;
}>();

const filters = defineModel<CatalogFiltersValue>({ required: true });

const emit = defineEmits<{
  submit: [];
  clear: [];
}>();

const intl = useIntl();
const searchId = useId();
const t = (descriptor: Parameters<typeof formatMessage>[1], values?: Record<string, string | number>) =>
  formatMessage(intl, descriptor, values);

function visible(list: readonly CatalogFilterOption[], selected: string): FilterMenuOption[] {
  return list
    .filter((option) => option.count > 0 || option.value === selected)
    .map((option) => ({ value: option.value, label: option.label, count: option.count }));
}

/** Would choosing a value of this dimension change the results? */
function narrows(list: readonly { count: number }[], selected: string): boolean {
  if (selected || total === undefined) return true;
  return list.some((option) => option.count > 0 && option.count < total);
}

const offered = computed(() => ({
  status: narrows(options.statuses, filters.value.status),
  keyword: narrows(options.keywords, filters.value.keyword),
  sector: narrows(options.sectors, filters.value.sector),
  municipality: narrows(options.municipalities, filters.value.municipality),
  institution: narrows(options.institutions, filters.value.institution),
  mechanism: narrows(options.mechanisms, filters.value.mechanism),
}));

function labelOf(list: readonly { value: string; label: string }[], value: string): string {
  return list.find((option) => option.value === value)?.label ?? value;
}

const statusOptions = computed<FilterMenuOption[]>(() =>
  options.statuses
    .filter((option) => option.count > 0 || option.value === filters.value.status)
    .map((option) => ({ value: option.value, label: t(statusMessages[option.value]), count: option.count })),
);

const topics: CatalogTopic[] = ['waste', 'environment', 'biota', 'physical', 'social', 'other'];
const keywordGroups = computed<FilterMenuGroup[]>(() =>
  topics.map((topic) => ({ key: topic, label: t(topicMessages[topic]) })),
);
const keywordOptions = computed<FilterMenuOption[]>(() =>
  visible(options.keywords, filters.value.keyword).map((option) => ({
    ...option,
    group: catalogKeywordIcon(option.value).topic,
  })),
);

const sortOptions = computed<FilterMenuOption[]>(() => [
  { value: 'recent', label: t(defaultMessages.sortRecent) },
  { value: 'name', label: t(defaultMessages.sortName) },
]);

const period = computed<CatalogPeriodRange>(() => ({ from: filters.value.from, to: filters.value.to }));

function shortMonth(month: string) {
  const date = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 15));
  return `${intl.formatDate(date, { month: 'short', timeZone: 'UTC' })} ${month.slice(0, 4)}`;
}

const periodLabel = computed(() => {
  const { from, to } = filters.value;
  if (from && to) return t(defaultMessages.periodRange, { from: shortMonth(from), to: shortMonth(to) });
  if (from) return t(defaultMessages.periodFrom, { from: shortMonth(from) });
  return t(defaultMessages.periodTo, { to: shortMonth(to) });
});

const chips = computed(() => {
  const value = filters.value;
  const list: { key: ChipKey; label: string; code: string }[] = [];
  if (value.q.trim()) list.push({ key: 'q', code: value.q, label: t(defaultMessages.searchTerm, { term: value.q.trim() }) });
  if (value.status) list.push({ key: 'status', code: value.status, label: t(statusMessages[value.status]) });
  if (value.from || value.to) list.push({ key: 'period', code: `${value.from}/${value.to}`, label: periodLabel.value });
  if (value.keyword) list.push({ key: 'keyword', code: value.keyword, label: labelOf(options.keywords, value.keyword) });
  if (value.sector) list.push({ key: 'sector', code: value.sector, label: labelOf(options.sectors, value.sector) });
  if (value.municipality) list.push({ key: 'municipality', code: value.municipality, label: labelOf(options.municipalities, value.municipality) });
  if (value.institution) list.push({ key: 'institution', code: value.institution, label: labelOf(options.institutions, value.institution) });
  if (value.mechanism) list.push({ key: 'mechanism', code: value.mechanism, label: labelOf(options.mechanisms, value.mechanism) });
  return list;
});

const hasFilters = computed(() => Boolean(filters.value.kind) || chips.value.length > 0);

function update(patch: Partial<CatalogFiltersValue>) {
  filters.value = { ...filters.value, ...patch };
}

function updateAndSubmit(patch: Partial<CatalogFiltersValue>) {
  update(patch);
  emit('submit');
}

function removeChip(key: ChipKey) {
  updateAndSubmit(key === 'period' ? { from: '', to: '' } : { [key]: '' });
}
</script>

<template>
  <FilterPanel :sticky="sticky">
    <form :class="styles.root" role="search" :aria-busy="busy || undefined" @submit.prevent="emit('submit')">
      <div :class="styles.searchRow">
        <CatalogKindToggle
          name="kind"
          :label="t(defaultMessages.kind)"
          :options="options.kinds"
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
        <Button type="submit" :disabled="busy">
          <FormattedMessage v-bind="defaultMessages.submit" />
        </Button>
      </div>

      <div :class="styles.filterRow">
        <FilterMenu
          v-if="offered.status"
          name="status"
          :label="t(defaultMessages.status)"
          :all-label="t(defaultMessages.allStatuses)"
          :options="statusOptions"
          :model-value="filters.status"
          @update:model-value="updateAndSubmit({ status: $event as CatalogFiltersValue['status'] })"
        >
          <template #icon>
            <span v-if="filters.status" :class="[styles.dot, styles[catalogStatusTone[filters.status]]]" />
            <Icon v-else name="clock" size="sm" />
          </template>
          <template #option-icon="{ option }">
            <span
              v-if="option.value"
              :class="[styles.dot, styles[catalogStatusTone[option.value as CatalogEntryStatus]]]"
            />
          </template>
        </FilterMenu>

        <CatalogPeriodPicker
          name="period"
          :bounds="options.period"
          :today="today"
          :model-value="period"
          @update:model-value="updateAndSubmit({ from: $event.from, to: $event.to })"
        />

        <FilterMenu
          v-if="offered.keyword"
          name="keyword"
          :label="t(defaultMessages.keyword)"
          :all-label="t(defaultMessages.allKeywords)"
          :options="keywordOptions"
          :groups="keywordGroups"
          :model-value="filters.keyword"
          @update:model-value="updateAndSubmit({ keyword: $event })"
        >
          <template #icon>
            <CatalogIcon v-if="filters.keyword" :keyword="filters.keyword" size="sm" />
            <Icon v-else name="tag" size="sm" />
          </template>
          <template #option-icon="{ option }">
            <CatalogIcon v-if="option.value" :keyword="option.value" size="sm" framed :class="styles.optionKeyword" />
          </template>
        </FilterMenu>

        <FilterMenu
          v-if="offered.sector"
          name="sector"
          :label="t(defaultMessages.sector)"
          :text="t(defaultMessages.sectorShort)"
          :all-label="t(defaultMessages.allSectors)"
          :options="visible(options.sectors, filters.sector)"
          :model-value="filters.sector"
          @update:model-value="updateAndSubmit({ sector: $event })"
        >
          <template #icon>
            <CatalogIcon v-if="filters.sector" :sector="filters.sector" size="sm" />
            <Icon v-else name="bay" size="sm" />
          </template>
          <template #option-icon="{ option }">
            <CatalogIcon v-if="option.value" :sector="option.value" size="md" />
          </template>
        </FilterMenu>

        <FilterMenu
          v-if="offered.municipality"
          name="municipality"
          :label="t(defaultMessages.municipality)"
          :all-label="t(defaultMessages.allMunicipalities)"
          :options="visible(options.municipalities, filters.municipality)"
          :model-value="filters.municipality"
          @update:model-value="updateAndSubmit({ municipality: $event })"
        >
          <template #icon><Icon name="map-pin" size="sm" /></template>
        </FilterMenu>

        <FilterMenu
          v-if="offered.institution"
          name="institution"
          :label="t(defaultMessages.institution)"
          :all-label="t(defaultMessages.allInstitutions)"
          :options="visible(options.institutions, filters.institution)"
          :model-value="filters.institution"
          searchable
          @update:model-value="updateAndSubmit({ institution: $event })"
        >
          <template #icon><Icon name="institution" size="sm" /></template>
        </FilterMenu>

        <FilterMenu
          v-if="offered.mechanism"
          name="mechanism"
          :label="t(defaultMessages.mechanism)"
          :text="t(defaultMessages.mechanismShort)"
          :all-label="t(defaultMessages.allMechanisms)"
          :options="visible(options.mechanisms, filters.mechanism)"
          :model-value="filters.mechanism"
          @update:model-value="updateAndSubmit({ mechanism: $event })"
        >
          <template #icon><Icon name="target" size="sm" /></template>
          <template #option-icon="{ option }">
            <CatalogMechanismIcon v-if="option.value" :code="option.value" :name="option.label" :size="24" />
          </template>
        </FilterMenu>
      </div>

      <div v-if="hasFilters" :class="styles.activeRow">
        <span :class="styles.activeLabel"><FormattedMessage v-bind="defaultMessages.active" /></span>
        <ul :class="styles.chips">
          <li v-for="chip in chips" :key="chip.key" :class="styles.chip" :data-chip="chip.key">
            <CatalogIcon v-if="chip.key === 'keyword'" :keyword="chip.code" size="xs" framed :class="styles.chipKeyword" />
            <CatalogIcon v-else-if="chip.key === 'sector'" :sector="chip.code" size="sm" />
            <span v-else-if="chip.key === 'status'" :class="[styles.dot, styles[catalogStatusTone[filters.status as CatalogEntryStatus]]]" />
            <Icon v-else-if="chip.key === 'period'" name="calendar" size="xs" />
            <Icon v-else-if="chip.key === 'municipality'" name="map-pin" size="xs" />
            <Icon v-else-if="chip.key === 'institution'" name="institution" size="xs" />
            <CatalogMechanismIcon v-else-if="chip.key === 'mechanism'" :code="chip.code" :name="chip.label" :size="20" />
            <Icon v-else name="search" size="xs" />
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
        <button type="button" :class="styles.clear" data-testid="catalog-filters-clear" @click="emit('clear')">
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
        @update:model-value="updateAndSubmit({ sort: $event as CatalogFiltersValue['sort'] })"
      >
        <template #icon><Icon name="sliders" size="sm" /></template>
      </FilterMenu>
      <slot name="pagination" />
    </template>
  </FilterPanel>
</template>
