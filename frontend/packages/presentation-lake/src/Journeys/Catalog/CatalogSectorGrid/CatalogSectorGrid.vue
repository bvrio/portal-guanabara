<script lang="ts">
export interface CatalogSectorTile {
  code: string;
  label: string;
  count: number;
  href?: string;
}

/**
 * Where the catalogue acts, by bay sector: one tile per sector with its map
 * icon, in the bay's own order (north → mouth → outside), not by count, so
 * the grid reads like the bay. Since v0.9.22 the five tiles sit in two rows
 * (three, then two centred), as tall as Início's explore cards, with the
 * glyph in a 68px tile like theirs; since v0.9.23 each keeps its one-row width
 * (a fifth of the row) with 32px between them.
 */
export interface CatalogSectorGridProps {
  items: readonly CatalogSectorTile[];
  /** Entries with no confirmed sector (never a tile). */
  unknownCount?: number;
  /** Tiles become buttons that emit `select` (e.g. to open a preview drawer); `href` is ignored. */
  selectable?: boolean;
}

const bayOrder = ['interior', 'transicao', 'entrada', 'baia-inteira', 'fora-da-baia'];
</script>

<script setup lang="ts">
import { computed, inject } from 'vue';

import { LINK_COMPONENT_KEY } from '../../../Shared/components/Link/linkComponent';
import FormattedMessage from '../../../Shared/foundations/i18n/FormattedMessage.vue';
import CatalogIcon from '../CatalogIcon/CatalogIcon.vue';

import { defaultMessages } from './CatalogSectorGrid.messages';
import styles from './CatalogSectorGrid.module.scss';

const { items, unknownCount = 0, selectable = false } = defineProps<CatalogSectorGridProps>();

const emit = defineEmits<{ select: [tile: CatalogSectorTile] }>();

const linkComponent = inject(LINK_COMPONENT_KEY, null);

const ordered = computed(() => {
  const rank = (code: string) => (bayOrder.includes(code) ? bayOrder.indexOf(code) : bayOrder.length);
  return [...items].sort((a, b) => rank(a.code) - rank(b.code));
});
</script>

<template>
  <div :class="styles.root">
    <ul :class="styles.grid">
      <li v-for="item in ordered" :key="item.code" :data-sector="item.code">
        <button
          v-if="selectable"
          type="button"
          aria-haspopup="dialog"
          :class="[styles.tile, styles.link, styles.button]"
          @click="emit('select', item)"
        >
          <CatalogIcon :sector="item.code" size="xl" framed :class="styles.icon" />
          <span :class="styles.label">{{ item.label }}</span>
          <span :class="styles.count"><FormattedMessage v-bind="defaultMessages.count" :values="{ count: item.count }" /></span>
        </button>
        <component :is="item.href ? (linkComponent ?? 'a') : 'div'" v-else :href="item.href" :class="[styles.tile, item.href && styles.link]">
          <CatalogIcon :sector="item.code" size="xl" framed :class="styles.icon" />
          <span :class="styles.label">{{ item.label }}</span>
          <span :class="styles.count"><FormattedMessage v-bind="defaultMessages.count" :values="{ count: item.count }" /></span>
        </component>
      </li>
    </ul>
    <p v-if="unknownCount" :class="styles.note" data-testid="sector-unknown">
      <FormattedMessage v-bind="defaultMessages.unknown" :values="{ count: unknownCount }" />
    </p>
  </div>
</template>
