<script setup lang="ts">
/**
 * Sobre nós · Overview (clients-webapp · common · About Journey, v0.8; content
 * v0.9; team v0.9.3). The FAPERJ project behind the portal, the people — the
 * two FAPERJ fellows and the Instituto BVRio team, grouped like BVRio's own
 * "BVRio Group" page — and the two scholarships. Photos are still to come
 * (supplied by the people themselves). Static content — no Hooks or Services.
 */
import { onMounted } from 'vue';
import { useIntl } from 'vue-intl';

import { useHead } from '#imports';
import {
  AboutPersonCard,
  AboutWorkInProgress,
  FormattedMessage,
  formatMessage,
  Icon,
  PageHero,
} from '@portal-guanabara/presentation-lake';

import { useTracking } from '~/shared/hooks/tracking';

import { defaultMessages } from './OverviewPage.messages';
import styles from './OverviewPage.module.scss';

const intl = useIntl();
const tracking = useTracking();

useHead({ title: formatMessage(intl, defaultMessages.documentTitle) });

const facts = [
  { id: 'institution', term: defaultMessages.factInstitution, value: defaultMessages.factInstitutionValue },
  { id: 'funding', term: defaultMessages.factFunding, value: defaultMessages.factFundingValue },
  { id: 'duration', term: defaultMessages.factDuration, value: defaultMessages.factDurationValue },
  { id: 'pilot', term: defaultMessages.factPilot, value: defaultMessages.factPilotValue },
] as const;

/** Partners named in the project sent to FAPERJ; their names stay as they are. */
const partners = [
  { name: 'COOPROMAR', role: defaultMessages.partnerCoopromar },
  { name: 'UFRJ', role: defaultMessages.partnerUfrj },
  { name: 'INEA', role: defaultMessages.partnerInea },
  { name: 'Ogyre', role: defaultMessages.partnerOgyre },
] as const;

/**
 * The people behind the portal, in two groups. Names are proper names (never
 * translated); roles, fields and bios are messages. Photos arrive later.
 */
const teams = [
  {
    id: 'fellows',
    title: defaultMessages.fellowsTitle,
    people: [
      {
        id: 'student',
        name: 'Glauber Amarante e Silva',
        role: defaultMessages.studentRole,
        area: defaultMessages.studentArea,
        description: defaultMessages.studentDescription,
      },
      {
        id: 'doctor',
        name: 'Raissa Celina da Costa Sousa',
        role: defaultMessages.doctorRole,
        area: defaultMessages.doctorArea,
        description: defaultMessages.doctorDescription,
      },
    ],
  },
  {
    id: 'bvrio',
    title: defaultMessages.bvrioTitle,
    people: [
      { id: 'succar', name: 'Pedro Succar', role: defaultMessages.succarRole, description: defaultMessages.succarDescription },
      { id: 'accioly', name: 'Maria Accioly', role: defaultMessages.acciolyRole, description: defaultMessages.acciolyDescription },
      { id: 'miranda', name: 'Juliana Miranda', role: defaultMessages.mirandaRole, description: defaultMessages.mirandaDescription },
      { id: 'bertoche', name: 'Uriel Bertoche', role: defaultMessages.bertocheRole, description: defaultMessages.bertocheDescription },
    ],
  },
] as const;

const scholarships = [
  { id: 'me2', title: defaultMessages.me2Title, focus: defaultMessages.me2Focus },
  { id: 'de2', title: defaultMessages.de2Title, focus: defaultMessages.de2Focus },
] as const;

onMounted(() => {
  for (const feature of ['about.project', 'about.team', 'about.funding'] as const) {
    tracking.featureExposure(feature);
  }
});
</script>

<template>
  <main :class="styles.root">
    <PageHero size="md" description-width="full">
      <template #title><FormattedMessage v-bind="defaultMessages.title" /></template>
      <template #description><FormattedMessage v-bind="defaultMessages.introduction" /></template>
    </PageHero>

    <div :class="styles.content">
      <!-- The project -->
      <section :class="styles.section" aria-labelledby="about-project-title" data-section="project">
        <h2 id="about-project-title" :class="styles.sectionTitle">
          <Icon name="bay" size="lg" :class="styles.sectionIcon" />
          <FormattedMessage v-bind="defaultMessages.projectTitle" />
        </h2>
        <div :class="styles.project">
          <article :class="styles.projectCard">
            <h3 :class="styles.projectName" lang="pt-BR"><FormattedMessage v-bind="defaultMessages.projectName" /></h3>
            <p :class="styles.lead"><FormattedMessage v-bind="defaultMessages.projectObjective" /></p>
            <dl :class="styles.facts">
              <div v-for="fact in facts" :key="fact.id" :class="styles.fact" :data-fact="fact.id">
                <dt><FormattedMessage v-bind="fact.term" /></dt>
                <dd><FormattedMessage v-bind="fact.value" /></dd>
              </div>
            </dl>
          </article>
          <section :class="styles.panel" aria-labelledby="about-partners-title">
            <h3 id="about-partners-title" :class="styles.panelTitle"><FormattedMessage v-bind="defaultMessages.partnersTitle" /></h3>
            <ul :class="styles.partners">
              <li v-for="partner in partners" :key="partner.name" :data-partner="partner.name">
                <strong>{{ partner.name }}</strong>
                <span><FormattedMessage v-bind="partner.role" /></span>
              </li>
            </ul>
          </section>
        </div>
      </section>

      <!-- Team: the FAPERJ fellows, then the Instituto BVRio team -->
      <section :class="styles.section" aria-labelledby="about-team-title" data-section="team">
        <div :class="styles.sectionHeader">
          <h2 id="about-team-title" :class="styles.sectionTitle">
            <Icon name="people" size="lg" :class="styles.sectionIcon" />
            <FormattedMessage v-bind="defaultMessages.teamTitle" />
          </h2>
          <AboutWorkInProgress><FormattedMessage v-bind="defaultMessages.photosPending" /></AboutWorkInProgress>
        </div>
        <section
          v-for="group in teams"
          :key="group.id"
          :class="styles.teamGroup"
          :aria-labelledby="`about-team-${group.id}`"
          :data-team="group.id"
        >
          <h3 :id="`about-team-${group.id}`" :class="styles.teamTitle"><FormattedMessage v-bind="group.title" /></h3>
          <ul :class="styles.team">
            <li v-for="person in group.people" :key="person.id" :data-person-role="person.id">
              <AboutPersonCard :heading-level="4">
                <template #name>{{ person.name }}</template>
                <template #role><FormattedMessage v-bind="person.role" /></template>
                <template v-if="'area' in person" #area>
                  <FormattedMessage v-bind="defaultMessages.areaLabel" :values="{ area: formatMessage(intl, person.area) }" />
                </template>
                <FormattedMessage v-bind="person.description" />
              </AboutPersonCard>
            </li>
          </ul>
        </section>
      </section>

      <!-- Scholarships -->
      <section :class="styles.section" aria-labelledby="about-funding-title" data-section="funding">
        <h2 id="about-funding-title" :class="styles.sectionTitle">
          <Icon name="document" size="lg" :class="styles.sectionIcon" />
          <FormattedMessage v-bind="defaultMessages.fundingTitle" />
        </h2>
        <p :class="styles.sectionDescription"><FormattedMessage v-bind="defaultMessages.fundingBody" /></p>
        <ul :class="styles.scholarships">
          <li v-for="scholarship in scholarships" :key="scholarship.id" :class="styles.scholarship" :data-scholarship="scholarship.id">
            <h3 :class="styles.scholarshipTitle"><FormattedMessage v-bind="scholarship.title" /></h3>
            <p><FormattedMessage v-bind="scholarship.focus" /></p>
          </li>
        </ul>
      </section>
    </div>
  </main>
</template>
