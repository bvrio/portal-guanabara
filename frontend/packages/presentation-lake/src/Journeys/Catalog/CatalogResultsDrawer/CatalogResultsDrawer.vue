<script lang="ts">
import type { CatalogEntryItem } from '../types';

export type CatalogResultsDimension =
  | 'kind'
  | 'status'
  | 'keyword'
  | 'sector'
  | 'municipality'
  | 'institution'
  | 'mechanism';

/** One filter in the drawer's stack. For kind and status, `label` may be the code. */
export interface CatalogResultsFilter {
  dimension: CatalogResultsDimension;
  code: string;
  label: string;
}

export interface CatalogResultsOption {
  value: string;
  label: string;
  count: number;
}

/**
 * The entries behind a choice on the page (a sector tile, a bar, an
 * institution…) in a side drawer, so the reader explores without leaving the
 * page. Filters stack on top — each removable — and “+ Filtro” adds another
 * (dimension first, then a value, with counts within the current results), so
 * any aggregation is a few clicks away. The footer opens the Catálogo with
 * the same filters.
 *
 * The first filter titles the drawer; `emblem` (an official flag or logo URL)
 * shows next to it when the App has one.
 */
export interface CatalogResultsDrawerProps {
  filters: readonly CatalogResultsFilter[];
  /** Options per dimension for “+ Filtro”, counted within the current results. */
  facets: Partial<Record<CatalogResultsDimension, readonly CatalogResultsOption[]>>;
  items: readonly CatalogEntryItem[];
  total: number;
  loading?: boolean;
  error?: boolean;
  /** The Catálogo with the same filters. */
  listHref: string;
  emblem?: { src?: string; shape: 'logo' | 'flag' };
}

export const catalogResultsDimensions: readonly CatalogResultsDimension[] = [
  'kind',
  'status',
  'keyword',
  'sector',
  'municipality',
  'institution',
  'mechanism',
];
</script>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { useIntl } from 'vue-intl';

import Alert from '../../../Shared/components/Alert/Alert.vue';
import Button from '../../../Shared/components/Button/Button.vue';
import Drawer from '../../../Shared/components/Drawer/Drawer.vue';
import Emblem from '../../../Shared/components/Emblem/Emblem.vue';
import Popover from '../../../Shared/components/Popover/Popover.vue';
import Icon from '../../../Shared/foundations/Icon/Icon.vue';
import type { IconName } from '../../../Shared/foundations/Icon/glyphs';
import FormattedMessage from '../../../Shared/foundations/i18n/FormattedMessage.vue';
import { formatMessage } from '../../../Shared/foundations/i18n/formatMessage';
import { searchable } from '../../../Utils/searchable';
import { kindMessages, statusMessages } from '../Catalog.messages';
import CatalogEntryCard from '../CatalogEntryCard/CatalogEntryCard.vue';
import CatalogMechanismIcon from '../CatalogMechanismIcon/CatalogMechanismIcon.vue';
import CatalogIcon from '../CatalogIcon/CatalogIcon.vue';
import type { CatalogEntryKind, CatalogEntryStatus } from '../types';

import { defaultMessages } from './CatalogResultsDrawer.messages';
import styles from './CatalogResultsDrawer.module.scss';

const {
  filters,
  facets,
  items,
  total,
  loading = false,
  error = false,
  listHref,
  emblem,
} = defineProps<CatalogResultsDrawerProps>();

const open = defineModel<boolean>('open', { required: true });

const emit = defineEmits<{
  retry: [];
  add: [filter: CatalogResultsFilter];
  remove: [dimension: CatalogResultsDimension];
  clear: [];
}>();

const intl = useIntl();
const t = (descriptor: Parameters<typeof formatMessage>[1], values?: Record<string, string | number>) =>
  formatMessage(intl, descriptor, values);

const DIMENSION_ICON: Record<CatalogResultsDimension, IconName> = {
  kind: 'catalog',
  status: 'clock',
  keyword: 'tag',
  sector: 'bay',
  municipality: 'map-pin',
  institution: 'institution',
  mechanism: 'target',
};

function labelOf(filter: { dimension: CatalogResultsDimension; code: string; label: string }) {
  if (filter.dimension === 'kind' && filter.code in kindMessages) return t(kindMessages[filter.code as CatalogEntryKind]);
  if (filter.dimension === 'status' && filter.code in statusMessages) {
    return t(statusMessages[filter.code as CatalogEntryStatus]);
  }
  return filter.label;
}

const lead = computed(() => filters[0] ?? null);
const used = computed(() => new Set(filters.map((filter) => filter.dimension)));

// ------------------------------------------------------------- + Filtro
const adderOpen = ref(false);
const adder = ref<HTMLButtonElement | null>(null);
const step = ref<CatalogResultsDimension | null>(null);
const search = ref('');
const firstChoice = ref<HTMLElement | null>(null);

/**
 * A value narrows the results when some but not all of them have it (v0.9).
 * Dimensions in use stay listed and can always be opened to **swap** their
 * value (v0.9.4; facets of a dimension are counted without its own filter);
 * the others only while one of their values would still change the results.
 */
const narrowing = (option: CatalogResultsOption) => option.count > 0 && option.count < total;
const available = computed(() =>
  catalogResultsDimensions
    .map((dimension) => ({
      dimension,
      inUse: used.value.has(dimension),
      empty: !(facets[dimension]?.some(narrowing) ?? false),
    }))
    .filter((choice) => choice.inUse || !choice.empty),
);
const nothingToAdd = computed(() => available.value.every((choice) => choice.inUse));

const stepOptions = computed(() => {
  if (!step.value) return [];
  const dimension = step.value;
  const term = searchable(search.value.trim());
  const current = filters.find((filter) => filter.dimension === dimension)?.code;
  // Swapping an in-use filter: every other value that has entries.
  const keep = current !== undefined ? (option: CatalogResultsOption) => option.count > 0 && option.value !== current : narrowing;
  return (facets[dimension] ?? [])
    .filter(keep)
    .map((option) => ({ ...option, label: labelOf({ dimension, code: option.value, label: option.label }) }))
    .filter((option) => !term || searchable(option.label).includes(term));
});
const searchableStep = computed(() => (step.value ? (facets[step.value]?.length ?? 0) > 8 : false));

function toggleAdder() {
  step.value = null;
  search.value = '';
  adderOpen.value = !adderOpen.value;
}

async function focusFirst() {
  await nextTick();
  firstChoice.value?.focus();
}

function chooseDimension(dimension: CatalogResultsDimension) {
  step.value = dimension;
  search.value = '';
  void focusFirst();
}

function back() {
  step.value = null;
  void focusFirst();
}

function add(option: { value: string; label: string }) {
  if (!step.value) return;
  emit('add', { dimension: step.value, code: option.value, label: option.label });
  adderOpen.value = false;
  adder.value?.focus();
}
</script>

<template>
  <Drawer v-model:open="open">
    <template #title>
      <span :class="styles.title" :data-dimension="lead?.dimension ?? 'all'">
        <Emblem v-if="emblem && lead && (emblem.src || emblem.shape === 'logo')" :name="lead.label" :src="emblem.src" :shape="emblem.shape" :size="emblem.shape === 'flag' ? 28 : 44" />
        <template v-else-if="lead">
          <CatalogIcon v-if="lead.dimension === 'keyword'" :keyword="lead.code" size="lg" framed />
          <CatalogIcon v-else-if="lead.dimension === 'sector'" :sector="lead.code" size="lg" />
          <CatalogIcon v-else-if="lead.dimension === 'kind'" :kind="lead.code as CatalogEntryKind" size="lg" framed />
          <CatalogMechanismIcon v-else-if="lead.dimension === 'mechanism'" :code="lead.code" :name="lead.label" :size="40" />
          <Icon v-else :name="DIMENSION_ICON[lead.dimension]" size="lg" :class="styles.dimensionIcon" />
        </template>
        <Icon v-else name="list" size="lg" :class="styles.dimensionIcon" />
        <span :class="styles.titleText">
          <span :class="styles.eyebrow">
            <FormattedMessage v-bind="lead ? defaultMessages[lead.dimension] : defaultMessages.everything" />
          </span>
          <span>{{ lead ? labelOf(lead) : t(defaultMessages.allEntries) }}</span>
        </span>
      </span>
    </template>

    <template #actions>
      <button
        ref="adder"
        type="button"
        :class="styles.add"
        aria-haspopup="dialog"
        :aria-expanded="adderOpen"
        data-testid="drawer-add-filter"
        data-drawer-add
        @click="toggleAdder"
      >
        <Icon name="filter" size="sm" />
        <FormattedMessage v-bind="defaultMessages.addFilter" />
      </button>
      <Popover v-model:open="adderOpen" :anchor="adder" :label="t(defaultMessages.addFilterTitle)" align="end" width="20rem" @opened="focusFirst">
        <div :class="styles.adder" data-drawer-adder>
          <template v-if="!step">
            <p :class="styles.adderHeading"><FormattedMessage v-bind="defaultMessages.addFilterTitle" /></p>
            <p v-if="nothingToAdd" :class="styles.adderEmpty" data-drawer-adder-empty>
              <FormattedMessage v-bind="defaultMessages.nothingToAdd" />
            </p>
            <ul :class="styles.choices">
              <li v-for="(choice, index) in available" :key="choice.dimension">
                <button
                  :ref="index === 0 ? (el) => (firstChoice = el as HTMLElement) : undefined"
                  type="button"
                  :class="styles.choice"
                  :disabled="!choice.inUse && choice.empty"
                  :data-dimension="choice.dimension"
                  @click="chooseDimension(choice.dimension)"
                >
                  <Icon :name="DIMENSION_ICON[choice.dimension]" size="sm" />
                  <span :class="styles.choiceLabel"><FormattedMessage v-bind="defaultMessages[choice.dimension]" /></span>
                  <span v-if="choice.inUse" :class="styles.hint"><FormattedMessage v-bind="defaultMessages.inUse" /></span>
                  <Icon name="chevron-right" size="xs" />
                </button>
              </li>
            </ul>
          </template>
          <template v-else>
            <button :ref="(el) => (firstChoice = el as HTMLElement)" type="button" :class="styles.back" @click="back">
              <Icon name="arrow-left" size="xs" />
              <FormattedMessage v-bind="defaultMessages[step]" />
            </button>
            <label v-if="searchableStep" :class="styles.search">
              <Icon name="search" size="xs" />
              <input
                v-model="search"
                type="search"
                :class="styles.searchInput"
                :placeholder="t(defaultMessages.searchPlaceholder)"
                :aria-label="t(defaultMessages.searchLabel, { dimension: t(defaultMessages[step]) })"
              />
            </label>
            <ul :class="styles.choices" :data-step="step">
              <li v-for="option in stepOptions" :key="option.value">
                <button type="button" :class="styles.choice" :data-value="option.value" @click="add(option)">
                  <CatalogIcon v-if="step === 'keyword'" :keyword="option.value" size="sm" framed />
                  <CatalogIcon v-else-if="step === 'sector'" :sector="option.value" size="md" />
                  <CatalogIcon v-else-if="step === 'kind'" :kind="option.value as CatalogEntryKind" size="sm" />
                  <Emblem v-else-if="step === 'institution'" :name="option.label" :size="24" />
                  <CatalogMechanismIcon v-else-if="step === 'mechanism'" :code="option.value" :name="option.label" :size="24" />
                  <span :class="styles.choiceLabel">{{ option.label }}</span>
                  <span :class="styles.optionCount">{{ option.count }}</span>
                </button>
              </li>
            </ul>
            <p v-if="!stepOptions.length" :class="styles.hint" role="status"><FormattedMessage v-bind="defaultMessages.noMatch" /></p>
          </template>
        </div>
      </Popover>
    </template>

    <template v-if="filters.length" #toolbar>
      <div :class="styles.stack">
        <span :class="styles.stackLabel"><FormattedMessage v-bind="defaultMessages.stackLabel" /></span>
        <ul :class="styles.chips">
          <li v-for="filter in filters" :key="filter.dimension" :class="styles.chip" :data-chip="filter.dimension">
            <Icon :name="DIMENSION_ICON[filter.dimension]" size="xs" />
            <span :class="styles.chipDimension"><FormattedMessage v-bind="defaultMessages[filter.dimension]" />:</span>
            <span>{{ labelOf(filter) }}</span>
            <button
              type="button"
              :class="styles.remove"
              :aria-label="t(defaultMessages.remove, { label: labelOf(filter) })"
              @click="emit('remove', filter.dimension)"
            >
              <Icon name="close-small" size="xs" />
            </button>
          </li>
        </ul>
        <button v-if="filters.length > 1" type="button" :class="styles.clear" @click="emit('clear')">
          <FormattedMessage v-bind="defaultMessages.clear" />
        </button>
      </div>
    </template>

    <div :class="styles.body" :aria-busy="loading || undefined">
      <p :class="styles.count" aria-live="polite">
        <FormattedMessage v-if="loading && !items.length" v-bind="defaultMessages.loading" />
        <FormattedMessage v-else v-bind="defaultMessages.count" :values="{ count: total }" />
      </p>

      <Alert v-if="error" variant="error">
        <FormattedMessage v-bind="defaultMessages.error" />
        <Button variant="secondary" size="sm" @click="emit('retry')">
          <FormattedMessage v-bind="defaultMessages.retry" />
        </Button>
      </Alert>

      <ul v-else-if="loading && !items.length" :class="styles.list" aria-hidden="true">
        <li v-for="index in 3" :key="index" :class="styles.skeleton" />
      </ul>

      <ol v-else :class="[styles.list, loading && styles.loading]">
        <li v-for="entry in items" :key="entry.ref">
          <CatalogEntryCard :entry="entry" :heading-level="3" />
        </li>
      </ol>
    </div>

    <template #footer>
      <div :class="styles.footer">
        <span v-if="total > items.length && items.length" :class="styles.showing">
          <FormattedMessage v-bind="defaultMessages.showing" :values="{ shown: items.length, total }" />
        </span>
        <Button :href="listHref" data-testid="drawer-open-catalog">
          <FormattedMessage v-bind="defaultMessages.seeAll" />
          <Icon name="arrow-right" size="sm" />
        </Button>
      </div>
    </template>
  </Drawer>
</template>
