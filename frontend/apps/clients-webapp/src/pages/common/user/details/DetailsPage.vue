<script setup lang="ts">
import { useRoute } from '#imports';
import { Alert, BasicData, FormattedMessage, Link, PageTitle } from '@portal-guanabara/presentation-lake';

import { useGetUser } from '~/hooks/common/user';
import { useFeatureManagement } from '~/shared/hooks/feature-management';
import { goToJourneyDenied, routePaths } from '~/shared/hooks/navigation';

import styles from './DetailsPage.module.scss';
import { defaultMessages } from './DetailsPage.messages';

const route = useRoute();

const userAccess = await useFeatureManagement('user');
if (!userAccess.granted.value) {
  await goToJourneyDenied(userAccess.reason.value, route.fullPath);
}

const { data: user, error } = await useGetUser();
</script>

<template>
  <main :class="styles.root">
    <div :class="styles.content">
      <PageTitle>
        <FormattedMessage v-bind="defaultMessages.title" />
      </PageTitle>

      <Alert v-if="error" variant="error">
        <FormattedMessage v-bind="defaultMessages.loadError" />
      </Alert>

      <section v-else-if="user && userAccess.isFeatureEnabled('user.profile-details')" :class="styles.section">
        <BasicData mode="view" :initial-values="user" />
      </section>

      <nav :class="styles.links">
        <Link :href="routePaths.userOverview">
          <FormattedMessage v-bind="defaultMessages.backToOverview" />
        </Link>
        <Link v-if="userAccess.isFeatureEnabled('user.profile-edit')" :href="routePaths.userManagement">
          <FormattedMessage v-bind="defaultMessages.manage" />
        </Link>
      </nav>
    </div>
  </main>
</template>
