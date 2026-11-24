<script lang="ts">
import type { MapMunicipality } from '../types';

/**
 * The municipalities with entries as a list beside the map (v0.7): the same
 * colour as on the map (by entries, green since v0.9.5), the name, the count
 * and initiatives over studies. Each row
 * is a button that emits `select`; hovering or focusing a row highlights the
 * municipality on the map through `v-model:highlighted`. It is also the map's
 * text alternative.
 */
export interface MunicipalityListProps {
  /** Shown in the order given (the Mapa: around the bay); neighbours without entries are left out. */
  municipalities: readonly MapMunicipality[];
  headingLevel?: 2 | 3 | 4;
  /**
   * `list` (default): one municipality per line. `grid` (v0.9.8): the
   * horizontal variation — compact tiles side by side, wrapping into rows
   * (under the map on the Mapa).
   */
  layout?: 'list' | 'grid';
}
</script>

<script setup lang="ts">
import { computed } from 'vue';
import { useIntl } from 'vue-intl';

import Icon from '../../../Shared/foundations/Icon/Icon.vue';
import { formatMessage } from '../../../Shared/foundations/i18n/formatMessage';
import MapKindCounts from '../MapKindCounts/MapKindCounts.vue';
import { binOf, mapBins, mapLevelFill } from '../scale';

import { defaultMessages } from './MunicipalityList.messages';
import styles from './MunicipalityList.module.scss';

const { municipalities, headingLevel = 3, layout = 'list' } = defineProps<MunicipalityListProps>();

const highlighted = defineModel<string | null>('highlighted', { default: null });

const emit = defineEmits<{ select: [municipality: MapMunicipality] }>();

const intl = useIntl();
const rows = computed(() => {
  const withEntries = municipalities.filter((item) => item.entries > 0);
  const bins = mapBins(Math.max(0, ...withEntries.map((item) => item.entries)));
  return withEntries.map((municipality) => ({ municipality, level: binOf(municipality.entries, bins)?.level }));
});
</script>

<template>
  <ol :class="[styles.root, layout === 'grid' && styles.grid]" :data-layout="layout" data-municipality-list>
    <li v-for="row in rows" :key="row.municipality.code">
      <button
        type="button"
        :class="[styles.row, row.municipality.code === highlighted && styles.highlighted]"
        :aria-label="formatMessage(intl, defaultMessages.open, { name: row.municipality.name })"
        :data-municipality="row.municipality.code"
        @click="emit('select', row.municipality)"
        @mouseenter="highlighted = row.municipality.code"
        @mouseleave="highlighted = null"
        @focus="highlighted = row.municipality.code"
        @blur="highlighted = null"
      >
        <span :class="styles.swatch" :style="{ '--map-fill': row.level ? mapLevelFill[row.level] : undefined }" aria-hidden="true" />
        <span :class="styles.text">
          <component :is="`h${headingLevel}`" :class="styles.name" :title="row.municipality.shortName ? row.municipality.name : undefined">
            {{ row.municipality.shortName ?? row.municipality.name }}
          </component>
          <MapKindCounts :projects="row.municipality.projects" :studies="row.municipality.studies" />
        </span>
        <span :class="styles.count">
          <strong>{{ intl.formatNumber(row.municipality.entries) }}</strong>
          <Icon name="chevron-right" size="xs" :class="styles.chevron" />
        </span>
      </button>
    </li>
  </ol>
</template>
