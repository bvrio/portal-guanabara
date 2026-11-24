<script lang="ts">
/**
 * The entry's prose, as the source describes it: results, available data and
 * other details. Figures here are text, not totals (Core v2.0, D-045).
 *
 * `part` (v0.9) splits it for the compact details page: `results` is the
 * reported results as a highlighted box; `notes` puts the available data and
 * the mapping notes behind one "Ver detalhes do mapeamento" disclosure,
 * closed by default. `all` (default) shows everything, open.
 */
export interface CatalogEntryNarrativeProps {
  resultsSummary: string | null;
  dataAvailability: string | null;
  detailNotes: readonly { label: string | null; text: string }[];
  part?: 'all' | 'results' | 'notes';
  /** Colours the results callout: orange for an initiative, purple for a study. */
  kind?: 'project' | 'study';
}
</script>

<script setup lang="ts">
import { computed } from 'vue';

import DescriptionList from '../../../Shared/components/DescriptionList/DescriptionList.vue';
import DescriptionListItem from '../../../Shared/components/DescriptionList/DescriptionListItem.vue';
import Icon from '../../../Shared/foundations/Icon/Icon.vue';
import FormattedMessage from '../../../Shared/foundations/i18n/FormattedMessage.vue';
import { CATALOG_CONTENT_LANG } from '../types';

import { defaultMessages } from './CatalogEntryNarrative.messages';
import styles from './CatalogEntryNarrative.module.scss';

const { resultsSummary, dataAvailability, detailNotes, part = 'all', kind = 'project' } = defineProps<CatalogEntryNarrativeProps>();

const showResults = computed(() => part !== 'notes' && Boolean(resultsSummary));
const hasNotes = computed(() => Boolean(dataAvailability) || detailNotes.length > 0);
</script>

<template>
  <div :class="styles.root" :lang="CATALOG_CONTENT_LANG" :data-part="part">
    <section
      v-if="showResults"
      :class="[styles.section, part === 'results' && styles.callout]"
      :data-kind="part === 'results' ? kind : undefined"
      data-section="results"
    >
      <h3 :class="styles.title">
        <Icon v-if="part === 'results'" name="star" size="sm" :class="styles.titleIcon" />
        <FormattedMessage v-bind="defaultMessages.results" />
      </h3>
      <p :class="styles.text">{{ resultsSummary }}</p>
    </section>

    <template v-if="part !== 'results' && hasNotes">
      <details v-if="part === 'notes'" :class="styles.disclosure" data-section="notes">
        <summary :class="styles.summary">
          <Icon name="chevron-right" size="sm" :class="styles.summaryIcon" />
          <FormattedMessage v-bind="defaultMessages.moreDetails" />
        </summary>
        <div :class="styles.notes">
          <section v-if="dataAvailability" :class="styles.section" data-section="data">
            <h3 :class="styles.title"><FormattedMessage v-bind="defaultMessages.data" /></h3>
            <p :class="styles.text">{{ dataAvailability }}</p>
          </section>
          <section v-if="detailNotes.length" :class="styles.section" data-section="details">
            <h3 :class="styles.title"><FormattedMessage v-bind="defaultMessages.details" /></h3>
            <DescriptionList layout="stacked">
              <template v-for="(note, index) in detailNotes" :key="index">
                <DescriptionListItem v-if="note.label" :term="note.label">{{ note.text }}</DescriptionListItem>
                <p v-else :class="styles.text">{{ note.text }}</p>
              </template>
            </DescriptionList>
          </section>
        </div>
      </details>

      <template v-else>
        <section v-if="dataAvailability" :class="styles.section" data-section="data">
          <h3 :class="styles.title"><FormattedMessage v-bind="defaultMessages.data" /></h3>
          <p :class="styles.text">{{ dataAvailability }}</p>
        </section>
        <section v-if="detailNotes.length" :class="styles.section" data-section="details">
          <h3 :class="styles.title"><FormattedMessage v-bind="defaultMessages.details" /></h3>
          <DescriptionList layout="stacked">
            <template v-for="(note, index) in detailNotes" :key="index">
              <DescriptionListItem v-if="note.label" :term="note.label">{{ note.text }}</DescriptionListItem>
              <p v-else :class="styles.text">{{ note.text }}</p>
            </template>
          </DescriptionList>
        </section>
      </template>
    </template>
  </div>
</template>
