<script lang="ts">
export interface FilterMenuOption {
  value: string;
  label: string;
  count?: number;
  /** Group key; options are shown under their group's heading, in `groups` order. */
  group?: string;
}

export interface FilterMenuGroup {
  key: string;
  label: string;
}

/**
 * A compact filter (promoted from the Catalog in v0.6, now also used by
 * Instituições): a pill (with the dimension's or the chosen value's icon)
 * that opens a listbox in a popover — icons, counts and a check on the
 * current value, grouped when `groups` is given. A hidden input keeps the
 * value in the form.
 *
 * With `searchable`, a field above the list narrows the options as you type
 * (accents and case ignored) and keeps the keyboard: ↓/↑ move, Enter chooses.
 *
 * Keyboard: ↓/↑, Home/End move; Enter or Space choose; Esc closes.
 */
export interface FilterMenuProps {
  name: string;
  /** Dimension name, e.g. "Município" — the accessible name and the panel heading. */
  label: string;
  /** Shorter text for the pill when nothing is chosen (defaults to `label`). */
  text?: string;
  options: readonly FilterMenuOption[];
  groups?: readonly FilterMenuGroup[];
  /** First option meaning "no filter" (value ""); omit for always-set pills (sort). */
  allLabel?: string;
  /** Text shown for the chosen value (defaults to the option label). */
  display?: string;
  /** Spoken text for the chosen value when `display` is abbreviated (e.g. "PT" → "Português"). */
  displayName?: string;
  /** Adds a search field above the list (long lists such as institutions). */
  searchable?: boolean;
  /** `inverse` for the dark structure bands (the site header). */
  tone?: 'default' | 'inverse';
}
</script>

<script setup lang="ts">
import { computed, nextTick, ref, useId } from 'vue';

import { useIntl } from 'vue-intl';

import Icon from '../../foundations/Icon/Icon.vue';
import { formatMessage } from '../../foundations/i18n/formatMessage';
import { searchable as normalize } from '../../../Utils/searchable';
import Popover from '../Popover/Popover.vue';

import { defaultMessages } from './FilterMenu.messages';
import styles from './FilterMenu.module.scss';

const { name, label, text, options, groups, allLabel, display, displayName, searchable, tone = 'default' } =
  defineProps<FilterMenuProps>();

const model = defineModel<string>({ required: true });

const intl = useIntl();
const optionName = (option: FilterMenuOption) =>
  option.count === undefined
    ? option.label
    : formatMessage(intl, defaultMessages.optionWithCount, { label: option.label, count: option.count });

const open = ref(false);
const trigger = ref<HTMLButtonElement | null>(null);
const list = ref<HTMLElement | null>(null);
const active = ref(0);
const search = ref('');
const searchField = ref<HTMLInputElement | null>(null);
const id = useId();

interface Row {
  type: 'option' | 'group';
  key: string;
  option?: FilterMenuOption;
  index?: number;
}

/** Options in display order: "all" first, then grouped (or plain) options. */
const ordered = computed<FilterMenuOption[]>(() => {
  const term = searchable ? normalize(search.value.trim()) : '';
  const matching = term ? options.filter((option) => normalize(option.label).includes(term)) : options;
  const all = allLabel !== undefined && !term ? [{ value: '', label: allLabel }] : [];
  if (!groups?.length) return [...all, ...matching];
  const rest = matching.filter((option) => !groups.some((group) => group.key === option.group));
  return [...all, ...groups.flatMap((group) => matching.filter((option) => option.group === group.key)), ...rest];
});

const rows = computed<Row[]>(() => {
  const result: Row[] = [];
  let lastGroup: string | undefined;
  ordered.value.forEach((option, index) => {
    if (groups?.length && option.value && option.group !== lastGroup) {
      const group = groups.find((candidate) => candidate.key === option.group);
      if (group) result.push({ type: 'group', key: `g-${group.key}` });
      lastGroup = option.group;
    }
    result.push({ type: 'option', key: `o-${option.value}`, option, index });
  });
  return result;
});

const isActive = computed(() => allLabel !== undefined && Boolean(model.value));
const selected = computed(() => options.find((option) => option.value === model.value));
const shown = computed(() => (isActive.value || allLabel === undefined ? (display ?? selected.value?.label ?? model.value) : (text ?? label)));
const accessibleName = computed(() =>
  isActive.value || allLabel === undefined ? `${label}: ${displayName ?? shown.value}` : label,
);
const optionId = (index: number) => `${id}-option-${index}`;
const groupLabel = (key: string) => groups?.find((group) => `g-${group.key}` === key)?.label;

function show() {
  search.value = '';
  active.value = Math.max(ordered.value.findIndex((option) => option.value === model.value), 0);
  open.value = true;
}

function focusList() {
  (searchable ? searchField.value : list.value)?.focus();
  void nextTick(scrollActiveIntoView);
}

function onSearch() {
  active.value = 0;
}

function scrollActiveIntoView() {
  document.getElementById(optionId(active.value))?.scrollIntoView?.({ block: 'nearest' });
}

function choose(value: string) {
  open.value = false;
  if (value !== model.value) model.value = value;
  trigger.value?.focus();
}

function move(to: number) {
  active.value = Math.min(Math.max(to, 0), ordered.value.length - 1);
  void nextTick(scrollActiveIntoView);
}

function onListKey(event: KeyboardEvent) {
  const typing = event.target === searchField.value;
  const keys: Record<string, () => void> = {
    ArrowDown: () => move(active.value + 1),
    ArrowUp: () => move(active.value - 1),
    Home: () => move(0),
    End: () => move(ordered.value.length - 1),
    Enter: () => {
      const option = ordered.value[active.value];
      if (option) choose(option.value);
    },
    ' ': () => {
      const option = ordered.value[active.value];
      if (option) choose(option.value);
    },
    Tab: () => {
      open.value = false;
    },
  };
  // In the search field, Space/Home/End type and move the caret.
  const action = typing && [' ', 'Home', 'End'].includes(event.key) ? undefined : keys[event.key];
  if (!action) return;
  if (event.key !== 'Tab') event.preventDefault();
  action();
}

function onTriggerKey(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    show();
  }
}
</script>

<template>
  <span :class="styles.root" :data-filter="name">
    <button
      ref="trigger"
      type="button"
      :class="[styles.pill, tone === 'inverse' && styles.inverse, isActive && styles.active, open && styles.open]"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="open ? `${id}-list` : undefined"
      :aria-label="accessibleName"
      @click="open ? (open = false) : show()"
      @keydown="onTriggerKey"
    >
      <span :class="styles.icon"><slot name="icon" /></span>
      <span :class="[styles.text, !isActive && allLabel !== undefined && styles.dimension]">{{ shown }}</span>
      <Icon name="chevron-down" size="xs" :class="styles.chevron" />
    </button>
    <input type="hidden" :name="name" :value="model" />

    <Popover v-model:open="open" :anchor="trigger" role="none" width="19rem" @opened="focusList">
      <p :class="styles.heading" aria-hidden="true">{{ label }}</p>
      <div v-if="searchable" :class="styles.search">
        <Icon name="search" size="xs" />
        <input
          ref="searchField"
          v-model="search"
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded="true"
          :aria-controls="`${id}-list`"
          :aria-activedescendant="ordered.length ? optionId(active) : undefined"
          :aria-label="formatMessage(intl, defaultMessages.searchLabel, { label })"
          :placeholder="formatMessage(intl, defaultMessages.searchPlaceholder)"
          :class="styles.searchInput"
          @input="onSearch"
          @keydown="onListKey"
        />
      </div>
      <p v-if="!ordered.length" :class="styles.empty" role="status">
        {{ formatMessage(intl, defaultMessages.noMatch) }}
      </p>
      <ul
        :id="`${id}-list`"
        ref="list"
        :class="styles.list"
        role="listbox"
        tabindex="-1"
        :aria-label="label"
        :aria-activedescendant="optionId(active)"
        @keydown="onListKey"
      >
        <template v-for="row in rows" :key="row.key">
          <li v-if="row.type === 'group'" :class="styles.group" role="presentation">{{ groupLabel(row.key) }}</li>
          <li
            v-else
            :id="optionId(row.index!)"
            role="option"
            :aria-label="optionName(row.option!)"
            :aria-selected="row.option!.value === model"
            :class="[styles.option, row.index === active && styles.activeOption, row.option!.value === model && styles.selected]"
            :data-value="row.option!.value"
            @click="choose(row.option!.value)"
            @mousemove="active = row.index!"
          >
            <span :class="styles.check" aria-hidden="true">
              <Icon v-if="row.option!.value === model" name="check" size="xs" />
            </span>
            <span :class="styles.optionIcon"><slot name="option-icon" :option="row.option!" /></span>
            <span :class="styles.optionLabel">{{ row.option!.label }}</span>
            <span v-if="row.option!.count !== undefined" :class="styles.count">{{ row.option!.count }}</span>
          </li>
        </template>
      </ul>
    </Popover>
  </span>
</template>
