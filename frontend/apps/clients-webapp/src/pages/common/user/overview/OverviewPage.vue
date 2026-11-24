<script setup lang="ts">
import { computed, onMounted } from 'vue';

import { clearNuxtData, useRoute } from '#imports';
import { Alert, FormattedMessage, UserOverview } from '@portal-guanabara/presentation-lake';

import { useLogout } from '~/hooks/common/authentication';
import { useGetUser } from '~/hooks/common/user';
import { useFeatureManagement } from '~/shared/hooks/feature-management';
import { goToJourneyDenied, goToRoute, routePaths } from '~/shared/hooks/navigation';
import { refreshSession } from '~/shared/hooks/session';
import { useTracking } from '~/shared/hooks/tracking';

import styles from './OverviewPage.module.scss';
import { defaultMessages } from './OverviewPage.messages';

const route = useRoute();
const tracking = useTracking();

// The Page reacts to the BFF access decision for the User Journey.
const userAccess = await useFeatureManagement('user');
if (!userAccess.granted.value) {
  await goToJourneyDenied(userAccess.reason.value, route.fullPath);
}

// Page → Hook → Service → BFF
const { data: user, error } = await useGetUser();
const { execute: logout, pending: loggingOut } = useLogout();

const showPremiumBenefits = computed(() => userAccess.isFeatureEnabled('user.premium-benefits'));

onMounted(() => {
  if (showPremiumBenefits.value) tracking.featureExposure('user.premium-benefits');
});

async function handleLogout() {
  await logout();
  tracking.success('authentication.logout');
  clearNuxtData();
  await refreshSession();
  await goToRoute('home');
}
</script>

<template>
  <main :class="styles.root">
    <div :class="styles.content">
      <Alert v-if="error" variant="error">
        <FormattedMessage v-bind="defaultMessages.loadError" />
      </Alert>

      <UserOverview
        v-else-if="user"
        :full-name="user.fullName"
        :details-href="routePaths.userDetails"
        :management-href="routePaths.userManagement"
        :show-premium-benefits="showPremiumBenefits"
        :logging-out="loggingOut"
        @logout="handleLogout"
      />
    </div>
  </main>
</template>
