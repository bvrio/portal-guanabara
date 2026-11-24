<script lang="ts">
import type { CatalogPeriodicity, CatalogPeriodValue, CatalogPlaceType, CatalogTagItem } from '../types';

/**
 * What, where and when of an entry, as a description list whose terms carry
 * icons. Bay sectors and keywords are chips with their own icons.
 */
export interface CatalogEntryFactsProps extends CatalogPeriodValue {
  periodicity: readonly CatalogPeriodicity[];
  mechanisms: readonly CatalogTagItem[];
  siteTypes: readonly CatalogTagItem[];
  keywords: readonly CatalogTagItem[];
  indicators: readonly string[];
  places: readonly { type: CatalogPlaceType; names: readonly string[] }[];
  /** Bay sectors with their slugs; when given, they replace the sector group of `places`. */
  sectors?: readonly CatalogTagItem[];
  /**
   * Which facts (v0.9): `all` (default), `where` — sectors, places and site
   * types — or `what` — mechanisms, keywords, indicators and periodicity. The
   * groups drop the period, which the entry header already shows, and stack
   * terms over values so two groups fit side by side.
   */
  group?: 'all' | 'where' | 'what';
}
</script>

<script setup lang="ts">
import { computed } from 'vue';

import DescriptionList from '../../../Shared/components/DescriptionList/DescriptionList.vue';
import DescriptionListItem from '../../../Shared/components/DescriptionList/DescriptionListItem.vue';
import Tag from '../../../Shared/components/Tag/Tag.vue';
import Icon from '../../../Shared/foundations/Icon/Icon.vue';
import FormattedMessage from '../../../Shared/foundations/i18n/FormattedMessage.vue';
import { periodicityMessages, placeTypeMessages } from '../Catalog.messages';
import CatalogMechanismIcon from '../CatalogMechanismIcon/CatalogMechanismIcon.vue';
import CatalogPeriod from '../CatalogPeriod/CatalogPeriod.vue';
import CatalogTag from '../CatalogTag/CatalogTag.vue';

import { defaultMessages } from './CatalogEntryFacts.messages';
import styles from './CatalogEntryFacts.module.scss';

const props = withDefaults(defineProps<CatalogEntryFactsProps>(), { sectors: undefined, group: 'all' });

const where = computed(() => props.group !== 'what');
const what = computed(() => props.group !== 'where');

const otherPlaces = computed(() =>
  props.sectors?.length ? props.places.filter((group) => group.type !== 'sector') : props.places,
);
</script>

<template>
  <DescriptionList :layout="props.group === 'all' ? 'columns' : 'stacked'" :data-facts="props.group">
    <DescriptionListItem v-if="props.group === 'all'">
      <template #term><span :class="styles.term"><Icon name="calendar" size="xs" /><FormattedMessage v-bind="defaultMessages.period" /></span></template>
      <CatalogPeriod :start="props.start" :end="props.end" :ongoing="props.ongoing" />
    </DescriptionListItem>

    <DescriptionListItem v-if="what && props.periodicity.length">
      <template #term><span :class="styles.term"><Icon name="clock" size="xs" /><FormattedMessage v-bind="defaultMessages.periodicity" /></span></template>
      <span v-for="(value, index) in props.periodicity" :key="value">
        <template v-if="index">, </template>
        <FormattedMessage v-bind="periodicityMessages[value]" />
      </span>
    </DescriptionListItem>

    <DescriptionListItem v-if="where && props.sectors?.length" data-place-type="sector">
      <template #term><span :class="styles.term"><Icon name="bay" size="xs" /><FormattedMessage v-bind="placeTypeMessages.sector" /></span></template>
      <ul :class="styles.tags">
        <li v-for="item in props.sectors" :key="item.code">
          <CatalogTag :item="item" dimension="sector" size="md" />
        </li>
      </ul>
    </DescriptionListItem>

    <DescriptionListItem v-for="group in where ? otherPlaces : []" :key="group.type" :data-place-type="group.type">
      <template #term><span :class="styles.term"><Icon :name="group.type === 'sector' ? 'bay' : 'map-pin'" size="xs" /><FormattedMessage v-bind="placeTypeMessages[group.type]" /></span></template>
      {{ group.names.join(', ') }}
    </DescriptionListItem>

    <DescriptionListItem v-if="where && props.siteTypes.length">
      <template #term><span :class="styles.term"><Icon name="map-pin" size="xs" /><FormattedMessage v-bind="defaultMessages.siteTypes" /></span></template>
      {{ props.siteTypes.map((item) => item.label).join(', ') }}
    </DescriptionListItem>

    <DescriptionListItem v-if="what && props.mechanisms.length">
      <template #term><span :class="styles.term"><Icon name="target" size="xs" /><FormattedMessage v-bind="defaultMessages.mechanisms" /></span></template>
      <ul :class="styles.tags">
        <li v-for="item in props.mechanisms" :key="item.code" :class="styles.mechanism">
          <CatalogMechanismIcon :code="item.code" :name="item.label" :size="22" />
          <Tag size="sm" variant="outline" :href="item.href">{{ item.label }}</Tag>
        </li>
      </ul>
    </DescriptionListItem>

    <DescriptionListItem v-if="what && props.keywords.length">
      <template #term><span :class="styles.term"><Icon name="tag" size="xs" /><FormattedMessage v-bind="defaultMessages.keywords" /></span></template>
      <ul :class="styles.tags">
        <li v-for="item in props.keywords" :key="item.code">
          <CatalogTag :item="item" dimension="keyword" size="md" />
        </li>
      </ul>
    </DescriptionListItem>

    <DescriptionListItem v-if="what && props.indicators.length">
      <template #term><span :class="styles.term"><Icon name="info" size="xs" /><FormattedMessage v-bind="defaultMessages.indicators" /></span></template>
      {{ props.indicators.join(', ') }}
    </DescriptionListItem>
  </DescriptionList>
</template>
