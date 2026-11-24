<script lang="ts">
export interface CatalogPeriodRange {
  /** `YYYY-MM` or "" (open). */
  from: string;
  to: string;
}

/**
 * Period filter: a pill that opens a month calendar. Catalogue dates are
 * known to the month at best, so the calendar picks months — first click the
 * start, second click the end (or apply with a start only). Presets cover the
 * common asks; months outside the catalogue's range are disabled.
 */
export interface CatalogPeriodPickerProps {
  name: string;
  /** First and last month any entry covers. */
  bounds: { first: string | null; last: string | null };
  /** "Now" as `YYYY-MM` (defaults to the current month); presets count back from it. */
  today?: string;
}

export function shiftMonth(month: string, delta: number): string {
  const [year, value] = month.split('-').map(Number) as [number, number];
  const index = year * 12 + (value - 1) + delta;
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}`;
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useIntl } from 'vue-intl';

import Popover from '../../../../../Shared/components/Popover/Popover.vue';
import Icon from '../../../../../Shared/foundations/Icon/Icon.vue';
import { formatMessage } from '../../../../../Shared/foundations/i18n/formatMessage';
import { defaultMessages } from '../../CatalogFilters.messages';

import styles from './CatalogPeriodPicker.module.scss';

const { name, bounds, today } = defineProps<CatalogPeriodPickerProps>();

const period = defineModel<CatalogPeriodRange>({ required: true });

const intl = useIntl();
const open = ref(false);
const trigger = ref<HTMLButtonElement | null>(null);
const draft = ref<CatalogPeriodRange>({ from: '', to: '' });
const hovered = ref('');
const year = ref(0);

const now = computed(() => today ?? new Date().toISOString().slice(0, 7));
const minMonth = computed(() => bounds.first ?? shiftMonth(now.value, -120));
const maxMonth = computed(() => (bounds.last && bounds.last > now.value ? bounds.last : now.value));
const minYear = computed(() => Number(minMonth.value.slice(0, 4)));
const maxYear = computed(() => Number(maxMonth.value.slice(0, 4)));

const t = (descriptor: (typeof defaultMessages)[keyof typeof defaultMessages], values?: Record<string, string>) =>
  formatMessage(intl, descriptor, values);

const asDate = (month: string) => new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 15));
const shortName = (month: string) => intl.formatDate(asDate(month), { month: 'short', timeZone: 'UTC' });
const longName = (month: string) => intl.formatDate(asDate(month), { month: 'long', year: 'numeric', timeZone: 'UTC' });
const short = (month: string) => `${shortName(month)} ${month.slice(0, 4)}`;

function describe(value: CatalogPeriodRange): string {
  if (value.from && value.to) return t(defaultMessages.periodRange, { from: short(value.from), to: short(value.to) });
  if (value.from) return t(defaultMessages.periodFrom, { from: short(value.from) });
  if (value.to) return t(defaultMessages.periodTo, { to: short(value.to) });
  return t(defaultMessages.period);
}

const isActive = computed(() => Boolean(period.value.from || period.value.to));
const pillText = computed(() => describe(period.value));

const months = computed(() =>
  Array.from({ length: 12 }, (_, index) => {
    const month = `${year.value}-${String(index + 1).padStart(2, '0')}`;
    const { from, to } = draft.value;
    const end = to || (from && hovered.value > from ? hovered.value : '');
    return {
      month,
      label: shortName(month),
      fullLabel: longName(month),
      disabled: month < minMonth.value || month > maxMonth.value,
      edge: month === from || month === to,
      inRange: Boolean(from && end && month > from && month < end),
    };
  }),
);

const summary = computed(() => {
  const { from, to } = draft.value;
  if (!from) return t(defaultMessages.periodPickStart);
  if (!to) return t(defaultMessages.periodPickEnd, { from: short(from) });
  return describe(draft.value);
});

function show() {
  draft.value = { ...period.value };
  hovered.value = '';
  const anchorMonth = period.value.from || period.value.to || maxMonth.value;
  year.value = Number(anchorMonth.slice(0, 4));
  open.value = true;
}

function pick(month: string) {
  const { from, to } = draft.value;
  if (!from || to) draft.value = { from: month, to: '' };
  else if (month < from) draft.value = { from: month, to: from };
  else draft.value = { from, to: month };
}

function apply(value: CatalogPeriodRange) {
  open.value = false;
  period.value = { ...value };
  trigger.value?.focus();
}

const presets = computed(() => {
  const current = now.value;
  return [
    { key: 'thisYear', label: t(defaultMessages.periodThisYear), value: { from: `${current.slice(0, 4)}-01`, to: current } },
    { key: 'last12', label: t(defaultMessages.periodLast12Months), value: { from: shiftMonth(current, -11), to: current } },
    { key: 'last5', label: t(defaultMessages.periodLast5Years), value: { from: `${Number(current.slice(0, 4)) - 4}-01`, to: current } },
  ];
});

function focusPanel(panel: HTMLElement) {
  panel.querySelector<HTMLElement>('[data-edge="true"], button[data-month]:not([disabled])')?.focus();
}
</script>

<template>
  <span :class="styles.root" data-filter="period">
    <button
      ref="trigger"
      type="button"
      :class="[styles.pill, isActive && styles.active, open && styles.open]"
      aria-haspopup="dialog"
      :aria-expanded="open"
      :aria-label="isActive ? `${t(defaultMessages.period)}: ${pillText}` : t(defaultMessages.period)"
      @click="open ? (open = false) : show()"
    >
      <Icon name="calendar" size="sm" :class="styles.icon" />
      <span :class="[styles.text, !isActive && styles.dimension]">{{ pillText }}</span>
      <Icon name="chevron-down" size="xs" :class="styles.chevron" />
    </button>
    <input type="hidden" :name="`${name}From`" :value="period.from" />
    <input type="hidden" :name="`${name}To`" :value="period.to" />

    <Popover v-model:open="open" :anchor="trigger" :label="t(defaultMessages.period)" width="22rem" @opened="focusPanel">
      <div :class="styles.panel">
        <p :class="styles.heading">{{ t(defaultMessages.period) }}</p>

        <div :class="styles.presets">
          <button
            v-for="preset in presets"
            :key="preset.key"
            type="button"
            :class="styles.preset"
            :data-preset="preset.key"
            @click="apply(preset.value)"
          >
            {{ preset.label }}
          </button>
        </div>

        <div :class="styles.yearNav">
          <button
            type="button"
            :class="styles.navButton"
            :disabled="year <= minYear"
            :aria-label="t(defaultMessages.periodPreviousYear)"
            @click="year -= 1"
          >
            <Icon name="arrow-left" size="sm" />
          </button>
          <strong :class="styles.year" aria-live="polite">{{ year }}</strong>
          <button
            type="button"
            :class="styles.navButton"
            :disabled="year >= maxYear"
            :aria-label="t(defaultMessages.periodNextYear)"
            @click="year += 1"
          >
            <Icon name="arrow-right" size="sm" />
          </button>
        </div>

        <div :class="styles.months" @mouseleave="hovered = ''">
          <button
            v-for="item in months"
            :key="item.month"
            type="button"
            :class="[styles.month, item.inRange && styles.inRange, item.edge && styles.edge]"
            :disabled="item.disabled"
            :aria-label="item.fullLabel"
            :aria-pressed="item.edge"
            :data-month="item.month"
            :data-edge="item.edge || undefined"
            @click="pick(item.month)"
            @mouseenter="hovered = item.month"
            @focus="hovered = item.month"
          >
            {{ item.label }}
          </button>
        </div>

        <p :class="styles.summary" aria-live="polite">{{ summary }}</p>
        <p :class="styles.note">{{ t(defaultMessages.periodNote) }}</p>

        <div :class="styles.footer">
          <button type="button" :class="styles.clear" @click="apply({ from: '', to: '' })">{{ t(defaultMessages.periodClear) }}</button>
          <button type="button" :class="styles.apply" :disabled="!draft.from" @click="apply(draft)">
            {{ t(defaultMessages.periodApply) }}
          </button>
        </div>
      </div>
    </Popover>
  </span>
</template>
