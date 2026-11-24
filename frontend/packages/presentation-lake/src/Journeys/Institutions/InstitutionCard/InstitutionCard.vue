<script lang="ts">
import type { InstitutionItem } from '../types';

/**
 * One institution in the directory: its official logo (or a monogram), name
 * and type, how many initiatives and studies it takes part in, and in which
 * roles. The whole card is a button: the Page opens the institution's entries
 * (in a drawer) on `select`.
 */
export interface InstitutionCardProps {
  institution: InstitutionItem;
  /** Heading level of the name inside the surrounding page. */
  headingLevel?: 2 | 3;
}
</script>

<script setup lang="ts">
import { computed } from 'vue';

import Emblem from '../../../Shared/components/Emblem/Emblem.vue';
import Icon from '../../../Shared/foundations/Icon/Icon.vue';
import FormattedMessage from '../../../Shared/foundations/i18n/FormattedMessage.vue';
import { institutionRoleMessages } from '../Institutions.messages';

import { defaultMessages } from './InstitutionCard.messages';
import styles from './InstitutionCard.module.scss';

const { institution, headingLevel = 2 } = defineProps<InstitutionCardProps>();

const emit = defineEmits<{ select: [institution: InstitutionItem] }>();

// Orange stripe for initiatives, purple for studies, both when it takes part in both (v0.9).
const STRIPES = { both: styles.stripeBoth, project: styles.stripeProject, study: styles.stripeStudy } as const;
const kinds = computed<keyof typeof STRIPES | undefined>(() => {
  if (institution.projects && institution.studies) return 'both';
  if (institution.projects) return 'project';
  return institution.studies ? 'study' : undefined;
});
const stripe = computed(() => (kinds.value ? STRIPES[kinds.value] : undefined));
</script>

<template>
  <article :class="[styles.root, stripe]" :data-institution="institution.code" :data-kinds="kinds">
    <Emblem :name="institution.name" :src="institution.logo" :size="56" :class="styles.logo" />

    <div :class="styles.body">
      <component :is="`h${headingLevel}`" :class="styles.name">
        <button type="button" :class="styles.open" @click="emit('select', institution)">
          {{ institution.name }}
        </button>
      </component>
      <p :class="styles.type">
        <template v-if="institution.type">{{ institution.type }}</template>
        <FormattedMessage v-else v-bind="defaultMessages.unknownType" />
      </p>

      <ul :class="styles.counts">
        <li v-if="institution.projects" :class="[styles.count, styles.project]" data-count="projects">
          <Icon name="kind-project" size="sm" />
          <FormattedMessage v-bind="defaultMessages.projects" :values="{ count: institution.projects }" />
        </li>
        <li v-if="institution.studies" :class="[styles.count, styles.study]" data-count="studies">
          <Icon name="kind-study" size="sm" />
          <FormattedMessage v-bind="defaultMessages.studies" :values="{ count: institution.studies }" />
        </li>
      </ul>

      <ul v-if="institution.roles.length" :class="styles.roles">
        <li v-for="item in institution.roles" :key="item.role" :class="styles.role" :data-role="item.role">
          <FormattedMessage v-bind="institutionRoleMessages[item.role]" />
          <strong>{{ item.count }}</strong>
        </li>
      </ul>
    </div>

    <Icon name="arrow-right" size="md" :class="styles.arrow" />
  </article>
</template>
