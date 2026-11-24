<script lang="ts">
import type { CatalogPeriodValue, CatalogTagItem } from '../types';

export type CatalogEntryKeyFact = 'when' | 'municipalities' | 'sectors' | 'reference';

/**
 * The answers most visitors look for first, in one strip (v0.9): when
 * (the period, or the publication years of a study), where (municipalities and
 * bay sectors) and the workbook ID. Long lists keep the first three and say how
 * many more. `parts` picks which (v0.9.1: the entry page shows only where, on
 * top of its mini map — when and the ID are in the header).
 */
export interface CatalogEntryKeyFactsProps extends Partial<CatalogPeriodValue> {
  refId?: number;
  parts?: readonly CatalogEntryKeyFact[];
  /**
   * `strip` (one line with rules, default), `stack` (one fact per line) or
   * `row` (side by side without rules, wrapping when they do not fit — the
   * entry page's map card, v0.9.14).
   */
  layout?: 'strip' | 'stack' | 'row';
  municipalities: readonly string[];
  sectors: readonly CatalogTagItem[];
  /** Studies: the years of publication, shown instead of the period when given. */
  publicationYears?: readonly number[];
}
</script>

<script setup lang="ts">
import { computed } from 'vue';
import { useIntl } from 'vue-intl';

import Icon from '../../../Shared/foundations/Icon/Icon.vue';
import FormattedMessage from '../../../Shared/foundations/i18n/FormattedMessage.vue';
import { formatMessage } from '../../../Shared/foundations/i18n/formatMessage';
import CatalogPeriod from '../CatalogPeriod/CatalogPeriod.vue';

import { defaultMessages } from './CatalogEntryKeyFacts.messages';
import styles from './CatalogEntryKeyFacts.module.scss';

const props = withDefaults(defineProps<CatalogEntryKeyFactsProps>(), {
  parts: () => ['when', 'municipalities', 'sectors', 'reference'],
  layout: 'strip',
});
const shows = (part: CatalogEntryKeyFact) => props.parts.includes(part);

const intl = useIntl();
const SHOWN = 3;

function listOf(names: readonly string[]): string {
  if (names.length <= SHOWN) return intl.formatList([...names], { type: 'conjunction' });
  const more = formatMessage(intl, defaultMessages.more, { count: names.length - SHOWN });
  return `${names.slice(0, SHOWN).join(', ')} ${more}`;
}

const municipalities = computed(() => listOf(props.municipalities));
const sectors = computed(() => listOf(props.sectors.map((sector) => sector.label)));
const years = computed(() => [...(props.publicationYears ?? [])].sort((a, b) => a - b).join(', '));
</script>

<template>
  <dl :class="[styles.root, props.layout !== 'strip' && styles[props.layout]]" :data-layout="props.layout" data-key-facts>
    <div v-if="shows('when')" :class="styles.fact" data-fact="when">
      <dt :class="styles.term">
        <Icon :name="years ? 'document' : 'calendar'" size="sm" />
        <span :class="styles.visuallyHidden">
          <FormattedMessage v-bind="years ? defaultMessages.published : defaultMessages.period" />
        </span>
      </dt>
      <dd :class="styles.value">
        <template v-if="years"><FormattedMessage v-bind="defaultMessages.publishedIn" :values="{ years }" /></template>
        <CatalogPeriod v-else :start="props.start ?? null" :end="props.end ?? null" :ongoing="props.ongoing ?? false" />
      </dd>
    </div>
    <div v-if="shows('municipalities') && props.municipalities.length" :class="styles.fact" data-fact="municipalities">
      <dt :class="styles.term">
        <Icon name="map-pin" size="sm" />
        <span :class="styles.visuallyHidden"><FormattedMessage v-bind="defaultMessages.municipalities" /></span>
      </dt>
      <dd :class="styles.value">{{ municipalities }}</dd>
    </div>
    <div v-if="shows('sectors') && props.sectors.length" :class="styles.fact" data-fact="sectors">
      <dt :class="styles.term">
        <Icon name="bay" size="sm" />
        <span :class="styles.visuallyHidden"><FormattedMessage v-bind="defaultMessages.sectors" /></span>
      </dt>
      <dd :class="styles.value">{{ sectors }}</dd>
    </div>
    <div v-if="shows('reference') && props.refId !== undefined" :class="[styles.fact, styles.reference]" data-fact="reference">
      <dt :class="styles.visuallyHidden"><FormattedMessage v-bind="defaultMessages.referenceTerm" /></dt>
      <dd :class="styles.value"><FormattedMessage v-bind="defaultMessages.reference" :values="{ ref: props.refId }" /></dd>
    </div>
  </dl>
</template>
