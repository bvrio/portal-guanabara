<script lang="ts">
import type { MapSector } from '../types';

/**
 * The bay's sectors as a list beside the map (v0.8): name, initiatives ×
 * studies and the count. Sectors with a zone on the map are marked with a
 * dashed swatch; "Baía inteira", which is not one area, only appears here.
 * Each row is a button that emits `select`; hovering or focusing a row
 * highlights its zone through `v-model:highlighted`.
 */
export interface BaySectorListProps {
  /** In the map's order: from the bay's head to the open sea. */
  sectors: readonly MapSector[];
  headingLevel?: 2 | 3 | 4;
}
</script>

<script setup lang="ts">
import { computed } from 'vue';
import { useIntl } from 'vue-intl';

import Icon from '../../../Shared/foundations/Icon/Icon.vue';
import { formatMessage } from '../../../Shared/foundations/i18n/formatMessage';
import MapKindCounts from '../MapKindCounts/MapKindCounts.vue';

import { defaultMessages } from './BaySectorList.messages';
import styles from './BaySectorList.module.scss';

const { sectors, headingLevel = 3 } = defineProps<BaySectorListProps>();

const highlighted = defineModel<string | null>('highlighted', { default: null });

const emit = defineEmits<{ select: [sector: MapSector] }>();

const intl = useIntl();
const rows = computed(() => sectors.filter((sector) => sector.entries > 0));
</script>

<template>
  <ol :class="styles.root" data-sector-list>
    <li v-for="sector in rows" :key="sector.code">
      <button
        type="button"
        :class="[styles.row, sector.code === highlighted && styles.highlighted]"
        :aria-label="formatMessage(intl, defaultMessages.open, { name: sector.name })"
        :data-sector="sector.code"
        @click="emit('select', sector)"
        @mouseenter="highlighted = sector.code"
        @mouseleave="highlighted = null"
        @focus="highlighted = sector.code"
        @blur="highlighted = null"
      >
        <span :class="[styles.swatch, sector.geometry ? styles.swatchZone : styles.swatchWhole]" aria-hidden="true" data-swatch />
        <span :class="styles.text">
          <component :is="`h${headingLevel}`" :class="styles.name">{{ sector.name }}</component>
          <MapKindCounts :projects="sector.projects" :studies="sector.studies" />
        </span>
        <span :class="styles.count">
          <strong>{{ intl.formatNumber(sector.entries) }}</strong>
          <Icon name="chevron-right" size="xs" :class="styles.chevron" />
        </span>
      </button>
    </li>
  </ol>
</template>
