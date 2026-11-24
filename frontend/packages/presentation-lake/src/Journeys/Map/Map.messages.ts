import { defineMessages } from '../../Shared/foundations/i18n';

/** Copy shared by the Map Journey's components. */
export const mapMessages = defineMessages({
  entries: {
    id: 'presentationLake.map.entries',
    defaultMessage: '{count, plural, one {# entrada} other {# entradas}}',
  },
  /** Stacked counts in the Mapa's lists: a number even for none (0 iniciativas), so they line up. */
  projects: {
    id: 'presentationLake.map.projects',
    defaultMessage: '{count, plural, =0 {0 iniciativas} one {# iniciativa} other {# iniciativas}}',
  },
  studies: {
    id: 'presentationLake.map.studies',
    defaultMessage: '{count, plural, =0 {0 estudos} one {# estudo} other {# estudos}}',
  },
  /** The word after a big number in the map's caption (v0.9.13): “6” + “iniciativas”. */
  projectsLabel: {
    id: 'presentationLake.map.projectsLabel',
    defaultMessage: '{count, plural, =0 {iniciativas} one {iniciativa} other {iniciativas}}',
  },
  studiesLabel: {
    id: 'presentationLake.map.studiesLabel',
    defaultMessage: '{count, plural, =0 {estudos} one {estudo} other {estudos}}',
  },
  kinds: {
    id: 'presentationLake.map.kinds',
    defaultMessage:
      '{projects, plural, =0 {nenhuma iniciativa} one {# iniciativa} other {# iniciativas}} · {studies, plural, =0 {nenhum estudo} one {# estudo} other {# estudos}}',
  },
});
