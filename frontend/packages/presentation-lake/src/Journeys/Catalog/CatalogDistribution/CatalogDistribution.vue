<script lang="ts">
import type { BarListItem } from '../../../Shared/components/BarList/BarList.vue';
import type { IconName } from '../../../Shared/foundations/Icon';

/** A bar of the distribution; `projects` + `studies` split it by kind. */
export interface CatalogDistributionItem extends BarListItem {
  projects?: number;
  studies?: number;
}

/**
 * Colour of the bars (v0.8): `kinds` splits each bar into initiatives (orange)
 * and studies (purple) with a legend; `project` / `study` paint a chart that
 * only counts one kind; `neutral` keeps the single data hue.
 */
export type CatalogDistributionTone = 'neutral' | 'kinds' | 'project' | 'study';

/**
 * How catalog entries spread over one dimension (keyword, municipality, …).
 * Entries without a confirmed value are never a bar (Core v2.0, D-032): they
 * are counted in a note under the chart.
 */
export interface CatalogDistributionProps {
  items: readonly CatalogDistributionItem[];
  /** Bars shown; the rest is summarized as "+N". */
  limit?: number;
  unknownCount?: number;
  /** Icon before the title. */
  icon?: IconName;
  /** Draw each bar's keyword, sector or mechanism icon before its label. */
  itemIcons?: 'keyword' | 'sector' | 'mechanism';
  /** Bars emit `select` instead of linking (see BarList). */
  selectable?: boolean;
  tone?: CatalogDistributionTone;
  /** Where the header (icon and title, description, legend) sits: `start` (default) or `center` (Início, v0.9.18). */
  headerAlign?: 'start' | 'center';
}
</script>

<script setup lang="ts">
import { computed, useId } from 'vue';
import { useIntl } from 'vue-intl';

import BarList from '../../../Shared/components/BarList/BarList.vue';
import Icon from '../../../Shared/foundations/Icon/Icon.vue';
import FormattedMessage from '../../../Shared/foundations/i18n/FormattedMessage.vue';
import { formatMessage } from '../../../Shared/foundations/i18n/formatMessage';
import { kindPluralMessages } from '../Catalog.messages';

import CatalogIcon from '../CatalogIcon/CatalogIcon.vue';
import CatalogMechanismIcon from '../CatalogMechanismIcon/CatalogMechanismIcon.vue';

import { defaultMessages } from './CatalogDistribution.messages';
import styles from './CatalogDistribution.module.scss';

const {
  items,
  limit = 8,
  unknownCount = 0,
  icon,
  itemIcons,
  selectable = false,
  tone = 'neutral',
  headerAlign = 'start',
} = defineProps<CatalogDistributionProps>();

const emit = defineEmits<{ select: [item: BarListItem] }>();

const KIND_COLOR = { project: 'var(--color-kind-project)', study: 'var(--color-kind-study)' } as const;

const intl = useIntl();
const titleId = useId();
// The card's top stripe says which kinds it counts (v0.9).
const stripe = computed(() =>
  ({ kinds: styles.stripeBoth, project: styles.stripeProject, study: styles.stripeStudy, neutral: undefined })[tone],
);
const barColor = computed(() => (tone === 'project' || tone === 'study' ? KIND_COLOR[tone] : undefined));

/** In `kinds` tone each bar carries its two parts, in colour and in words. */
const shown = computed<BarListItem[]>(() =>
  items.slice(0, limit).map((item) => {
    if (tone !== 'kinds') return item;
    const projects = item.projects ?? 0;
    const studies = item.studies ?? Math.max(item.value - projects, 0);
    return {
      ...item,
      segments: [
        { value: projects, color: KIND_COLOR.project, label: formatMessage(intl, defaultMessages.projects, { count: projects }) },
        { value: studies, color: KIND_COLOR.study, label: formatMessage(intl, defaultMessages.studies, { count: studies }) },
      ],
    };
  }),
);
const hidden = computed(() => Math.max(items.length - limit, 0));
</script>

<template>
  <section :class="[styles.root, stripe]" :aria-labelledby="titleId" :data-tone="tone">
    <header :class="[styles.header, headerAlign === 'center' && styles.headerCenter]">
      <h3 :id="titleId" :class="styles.title">
        <Icon v-if="icon" :name="icon" size="sm" :class="styles.titleIcon" />
        <slot name="title" />
      </h3>
      <p v-if="$slots.description" :class="styles.description"><slot name="description" /></p>
      <ul v-if="tone === 'kinds'" :class="styles.legend" data-distribution-legend>
        <li><span :class="[styles.swatch, styles.swatchProject]" /><FormattedMessage v-bind="kindPluralMessages.project" /></li>
        <li><span :class="[styles.swatch, styles.swatchStudy]" /><FormattedMessage v-bind="kindPluralMessages.study" /></li>
      </ul>
    </header>

    <BarList
      :items="shown"
      :selectable="selectable"
      :color="barColor"
      :aria-labelledby="titleId"
      @select="emit('select', items.find((item) => item.id === $event.id) ?? $event)"
    >
      <template v-if="itemIcons" #icon="{ item }">
        <CatalogIcon v-if="itemIcons === 'keyword'" :keyword="item.id" size="sm" framed :class="styles.itemIcon" />
        <CatalogMechanismIcon v-else-if="itemIcons === 'mechanism'" :code="item.id" :name="item.label" :size="26" />
        <CatalogIcon v-else :sector="item.id" size="md" />
      </template>
      <template #empty>
        <p :class="styles.note"><FormattedMessage v-bind="defaultMessages.empty" /></p>
      </template>
    </BarList>

    <footer v-if="hidden || unknownCount || $slots.footer" :class="styles.footer">
      <p v-if="hidden" :class="styles.note">
        <FormattedMessage v-bind="defaultMessages.more" :values="{ count: hidden }" />
      </p>
      <p v-if="unknownCount" :class="styles.note" data-testid="distribution-unknown">
        <FormattedMessage v-bind="defaultMessages.unknown" :values="{ count: unknownCount }" />
      </p>
      <slot name="footer" />
    </footer>
  </section>
</template>
