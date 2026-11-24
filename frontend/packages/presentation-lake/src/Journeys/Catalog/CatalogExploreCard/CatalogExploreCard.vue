<script lang="ts">
/** The four ways into the catalogue, each with its colour (v0.9.20). */
export type CatalogExploreTone = 'project' | 'study' | 'institution' | 'place';

/**
 * A large link card into the catalogue (Início, v0.9.20): a stripe on top and
 * a tinted icon tile in its tone's colour, the title and a short line, the
 * count, an arrow. Initiatives in orange, studies in purple, institutions in
 * grey, the map (municipalities) in green — one design for the four. The whole
 * card is the link; it follows its own width (container query).
 */
export interface CatalogExploreCardProps {
  tone: CatalogExploreTone;
  href: string;
  count: number;
  /** Heading level of the title. */
  headingLevel?: 2 | 3;
}
</script>

<script setup lang="ts">
import { inject } from 'vue';
import { useIntl } from 'vue-intl';

import { LINK_COMPONENT_KEY } from '../../../Shared/components/Link/linkComponent';
import Icon from '../../../Shared/foundations/Icon/Icon.vue';
import CatalogIcon from '../CatalogIcon/CatalogIcon.vue';

import styles from './CatalogExploreCard.module.scss';

const { tone, href, count, headingLevel = 2 } = defineProps<CatalogExploreCardProps>();

const intl = useIntl();
const linkComponent = inject(LINK_COMPONENT_KEY, null);
</script>

<template>
  <component :is="linkComponent ?? 'a'" :href="href" :class="[styles.card, styles[tone]]" :data-explore="tone">
    <span :class="styles.body">
      <CatalogIcon v-if="tone === 'project' || tone === 'study'" :kind="tone" size="xl" framed :class="styles.icon" />
      <span v-else :class="[styles.icon, styles.tile]" data-explore-icon>
        <Icon :name="tone === 'institution' ? 'institution' : 'map'" size="xl" />
      </span>
      <span :class="styles.text">
        <component :is="`h${headingLevel}`" :class="styles.title"><slot name="title" /></component>
        <span v-if="$slots.line" :class="styles.line"><slot name="line" /></span>
      </span>
      <span :class="styles.count">{{ intl.formatNumber(count) }}</span>
      <Icon name="arrow-right" size="md" :class="styles.arrow" />
    </span>
  </component>
</template>
