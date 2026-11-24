import { defineMessages } from '../../../Shared/foundations/i18n';

export const defaultMessages = defineMessages({
  label: {
    id: 'presentationLake.map.municipalityMap.label',
    defaultMessage: 'Mapa dos municípios e dos setores da Baía de Guanabara',
  },
  municipality: {
    id: 'presentationLake.map.municipalityMap.municipality',
    defaultMessage: '{name}: {count, plural, one {# entrada} other {# entradas}}',
  },
  sector: {
    id: 'presentationLake.map.municipalityMap.sector',
    defaultMessage: 'Setor {name}: {count, plural, one {# entrada} other {# entradas}}',
  },
  hint: {
    id: 'presentationLake.map.municipalityMap.hint',
    defaultMessage: 'Passe o mouse ou toque em um município colorido ou em um setor da baía.',
  },
  legendEntries: { id: 'presentationLake.map.municipalityMap.legendEntries', defaultMessage: 'Entradas' },
  legendProjects: { id: 'presentationLake.map.municipalityMap.legendProjects', defaultMessage: 'Iniciativas' },
  legendStudies: { id: 'presentationLake.map.municipalityMap.legendStudies', defaultMessage: 'Estudos' },
  legendRange: {
    id: 'presentationLake.map.municipalityMap.legendRange',
    defaultMessage: '{from, number}–{to, number}',
  },
  legendSingle: { id: 'presentationLake.map.municipalityMap.legendSingle', defaultMessage: '{from, number}' },
  legendNone: { id: 'presentationLake.map.municipalityMap.legendNone', defaultMessage: 'Sem entradas' },
  legendWater: { id: 'presentationLake.map.municipalityMap.legendWater', defaultMessage: 'Baía e mar' },
  legendSectors: { id: 'presentationLake.map.municipalityMap.legendSectors', defaultMessage: 'Setores da baía' },
});
