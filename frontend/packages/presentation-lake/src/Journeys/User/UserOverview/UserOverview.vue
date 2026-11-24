<script lang="ts">
export interface UserOverviewProps {
  fullName: string;
  detailsHref: string;
  managementHref: string;
  /** Rendered only when the Page received the Feature decision. */
  showPremiumBenefits?: boolean;
  loggingOut?: boolean;
}
</script>

<script setup lang="ts">
import { computed } from 'vue';

import Button from '../../../Shared/components/Button/Button.vue';
import { Card } from '../../../Shared/components/Card';
import Link from '../../../Shared/components/Link/Link.vue';
import FormattedMessage from '../../../Shared/foundations/i18n/FormattedMessage.vue';
import Typography from '../../../Shared/foundations/Typography/Typography.vue';

import { defaultMessages } from './UserOverview.messages';
import styles from './UserOverview.module.scss';

const {
  fullName,
  detailsHref,
  managementHref,
  showPremiumBenefits = false,
  loggingOut = false,
} = defineProps<UserOverviewProps>();

const emit = defineEmits<{
  logout: [];
}>();

const firstName = computed(() => fullName.trim().split(/\s+/)[0] ?? '');
</script>

<template>
  <section :class="styles.root">
    <header :class="styles.header">
      <div>
        <Typography as="h1" variant="title" :message="defaultMessages.greeting" :values="{ firstName }" />
        <Typography variant="subtitle" :class="styles.subtitle" :message="defaultMessages.subtitle" />
      </div>

      <Button variant="ghost" size="sm" :loading="loggingOut" @click="emit('logout')">
        <FormattedMessage v-bind="defaultMessages.logout" />
      </Button>
    </header>

    <div :class="styles.cards">
      <Card size="md" data-card="details">
        <div :class="styles.card">
          <h2 :class="styles.cardTitle">
            <Link :href="detailsHref">
              <FormattedMessage v-bind="defaultMessages.detailsTitle" />
            </Link>
          </h2>
          <p :class="styles.cardDescription">
            <FormattedMessage v-bind="defaultMessages.detailsDescription" />
          </p>
        </div>
      </Card>

      <Card size="md" data-card="management">
        <div :class="styles.card">
          <h2 :class="styles.cardTitle">
            <Link :href="managementHref">
              <FormattedMessage v-bind="defaultMessages.managementTitle" />
            </Link>
          </h2>
          <p :class="styles.cardDescription">
            <FormattedMessage v-bind="defaultMessages.managementDescription" />
          </p>
        </div>
      </Card>

      <Card v-if="showPremiumBenefits" variant="secondary" size="md" data-card="premium-benefits">
        <div :class="styles.card">
          <h2 :class="styles.cardTitle">
            <FormattedMessage v-bind="defaultMessages.premiumTitle" />
          </h2>
          <p :class="styles.cardDescription">
            <FormattedMessage v-bind="defaultMessages.premiumDescription" />
          </p>
        </div>
      </Card>
    </div>
  </section>
</template>
