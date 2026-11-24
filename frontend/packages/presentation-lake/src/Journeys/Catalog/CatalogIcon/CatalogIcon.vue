<script lang="ts">
import type { IconSize } from '../../../Shared/foundations';
import type { CatalogEntryKind } from '../types';

/**
 * A catalogue concept as an icon in its meaning colour. Pass exactly one of:
 *
 * - `kind`    the research / field-action duo (`study` indigo, `project` orange)
 * - `sector`  a bay sector slug — the sector's zone highlighted on the bay
 * - `keyword` a keyword code — its glyph in the keyword category's colour
 */
export interface CatalogIconProps {
  kind?: CatalogEntryKind;
  sector?: string;
  keyword?: string;
  size?: IconSize;
  /** Tinted tile behind the glyph (cards, heroes, stat tiles). */
  framed?: boolean;
  /** Accessible name; omit when a visible label sits next to the icon. */
  label?: string;
}
</script>

<script setup lang="ts">
import { computed } from 'vue';

import { Icon, type IconName } from '../../../Shared/foundations';

import { catalogKeywordIcon, catalogKindIcons, catalogSectorIcon } from './catalogIcons';
import styles from './CatalogIcon.module.scss';

const { kind, sector, keyword, size = 'md', framed = false, label } = defineProps<CatalogIconProps>();

const resolved = computed((): { name: IconName; tone: string } => {
  if (kind) return { name: catalogKindIcons[kind], tone: kind };
  if (sector !== undefined) return { name: catalogSectorIcon(sector), tone: 'sector' };
  const spec = catalogKeywordIcon(keyword ?? '');
  return { name: spec.icon, tone: spec.topic };
});

const large = computed(() => size === 'lg' || size === 'xl');
</script>

<template>
  <span
    :class="[styles.root, styles[resolved.tone], framed && styles.framed, framed && large && styles.framedLarge]"
    :data-tone="resolved.tone"
  >
    <Icon :name="resolved.name" :size="size" :label="label" />
  </span>
</template>
