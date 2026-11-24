<script lang="ts">
import type { CatalogPartyRole } from '../types';

export interface CatalogPartyItem {
  name: string;
  kind: 'institution' | 'person';
  /** Institution filter code; with `selectable`, the institution becomes a button. */
  code?: string | null;
  note: string | null;
}

export interface CatalogPartyGroupView {
  role: CatalogPartyRole;
  parties: readonly CatalogPartyItem[];
}

/**
 * Who takes part, grouped by role (Core v2.0 roles). Person names arrive only
 * when the Page may show them; `personsHidden` adds a note that they exist.
 */
export interface CatalogEntryPartiesProps {
  groups: readonly CatalogPartyGroupView[];
  personsHidden?: boolean;
  /**
   * Institutions become buttons that emit `select` (v0.9) — e.g. to open their
   * entries in the side drawer, as on the Instituições tab.
   */
  selectable?: boolean;
  /** Official logos by institution code (from the App); a monogram otherwise. */
  logos?: Readonly<Record<string, string>>;
}
</script>

<script setup lang="ts">
import Emblem from '../../../Shared/components/Emblem/Emblem.vue';
import Icon from '../../../Shared/foundations/Icon/Icon.vue';
import FormattedMessage from '../../../Shared/foundations/i18n/FormattedMessage.vue';
import { roleMessages } from '../Catalog.messages';

import { defaultMessages } from './CatalogEntryParties.messages';
import styles from './CatalogEntryParties.module.scss';

const { groups, personsHidden = false, selectable = false, logos } = defineProps<CatalogEntryPartiesProps>();

const emit = defineEmits<{ select: [party: CatalogPartyItem] }>();
</script>

<template>
  <div :class="styles.root">
    <p v-if="!groups.length" :class="styles.note">
      <FormattedMessage v-bind="defaultMessages.empty" />
    </p>

    <section v-for="group in groups" :key="group.role" :class="styles.group" :data-role="group.role">
      <h3 :class="styles.role"><FormattedMessage v-bind="roleMessages[group.role]" /></h3>
      <ul :class="styles.list">
        <li
          v-for="party in group.parties"
          :key="party.name"
          :class="styles.party"
          :data-party-kind="party.kind"
          :data-party="party.code ?? undefined"
        >
          <Emblem
            v-if="party.kind === 'institution'"
            :name="party.name"
            :src="party.code ? logos?.[party.code] : undefined"
            :size="24"
            :class="styles.emblem"
          />
          <Icon v-else name="people" size="xs" :class="styles.partyIcon" />
          <button
            v-if="selectable && party.kind === 'institution' && party.code"
            type="button"
            aria-haspopup="dialog"
            :class="[styles.name, styles.open]"
            @click="emit('select', party)"
          >
            {{ party.name }}
            <Icon name="chevron-right" size="xs" :class="styles.chevron" />
          </button>
          <span v-else :class="styles.name">{{ party.name }}</span>
          <span v-if="party.note" :class="styles.partyNote">{{ party.note }}</span>
        </li>
      </ul>
    </section>

    <p v-if="personsHidden" :class="styles.note" data-testid="persons-hidden">
      <FormattedMessage v-bind="defaultMessages.personsHidden" />
    </p>
  </div>
</template>
