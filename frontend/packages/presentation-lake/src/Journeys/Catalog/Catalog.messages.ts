import { defineMessages } from '../../Shared/foundations/i18n';

/** Labels of the Catalog's fixed value lists, shared by the Catalog patterns. */
export const kindMessages = defineMessages({
  project: { id: 'presentationLake.catalog.kind.project', defaultMessage: 'Iniciativa' },
  study: { id: 'presentationLake.catalog.kind.study', defaultMessage: 'Estudo' },
});

export const kindPluralMessages = defineMessages({
  project: { id: 'presentationLake.catalog.kindPlural.project', defaultMessage: 'Iniciativas' },
  study: { id: 'presentationLake.catalog.kindPlural.study', defaultMessage: 'Estudos' },
});

export const statusMessages = defineMessages({
  active: { id: 'presentationLake.catalog.status.active', defaultMessage: 'Ativa' },
  in_implementation: { id: 'presentationLake.catalog.status.inImplementation', defaultMessage: 'Em implantação' },
  ended: { id: 'presentationLake.catalog.status.ended', defaultMessage: 'Encerrada' },
  published: { id: 'presentationLake.catalog.status.published', defaultMessage: 'Publicado' },
  in_progress: { id: 'presentationLake.catalog.status.inProgress', defaultMessage: 'Em andamento' },
});

export const periodicityMessages = defineMessages({
  continuous: { id: 'presentationLake.catalog.periodicity.continuous', defaultMessage: 'Contínua' },
  periodic: { id: 'presentationLake.catalog.periodicity.periodic', defaultMessage: 'Periódica' },
  one_off: { id: 'presentationLake.catalog.periodicity.oneOff', defaultMessage: 'Pontual' },
});

export const placeTypeMessages = defineMessages({
  sector: { id: 'presentationLake.catalog.placeType.sector', defaultMessage: 'Setor da baía' },
  municipality: { id: 'presentationLake.catalog.placeType.municipality', defaultMessage: 'Municípios' },
  locality: { id: 'presentationLake.catalog.placeType.locality', defaultMessage: 'Bairros e localidades' },
  river: { id: 'presentationLake.catalog.placeType.river', defaultMessage: 'Rios' },
  conservation_unit: {
    id: 'presentationLake.catalog.placeType.conservationUnit',
    defaultMessage: 'Unidades de conservação',
  },
  fishing_colony: { id: 'presentationLake.catalog.placeType.fishingColony', defaultMessage: 'Colônias de pesca' },
});

export const roleMessages = defineMessages({
  executor: { id: 'presentationLake.catalog.role.executor', defaultMessage: 'Execução' },
  funder: { id: 'presentationLake.catalog.role.funder', defaultMessage: 'Financiamento' },
  partner: { id: 'presentationLake.catalog.role.partner', defaultMessage: 'Parcerias' },
  coordinator: { id: 'presentationLake.catalog.role.coordinator', defaultMessage: 'Coordenação' },
  author: { id: 'presentationLake.catalog.role.author', defaultMessage: 'Autoria' },
});

/** Keyword categories (Listas tab of the mapping workbook), used to group keywords. */
export const topicMessages = defineMessages({
  waste: { id: 'presentationLake.catalog.topic.waste', defaultMessage: 'Tipo de resíduo' },
  environment: { id: 'presentationLake.catalog.topic.environment', defaultMessage: 'Ambiente' },
  biota: { id: 'presentationLake.catalog.topic.biota', defaultMessage: 'Biota' },
  physical: { id: 'presentationLake.catalog.topic.physical', defaultMessage: 'Processos físicos' },
  social: { id: 'presentationLake.catalog.topic.social', defaultMessage: 'Dimensão socioambiental' },
  other: { id: 'presentationLake.catalog.topic.other', defaultMessage: 'Outras' },
});

/** Every shared Catalog label, e.g. for test catalogs. */
export const catalogLabelMessages = [
  ...Object.values(kindMessages),
  ...Object.values(kindPluralMessages),
  ...Object.values(statusMessages),
  ...Object.values(periodicityMessages),
  ...Object.values(placeTypeMessages),
  ...Object.values(roleMessages),
  ...Object.values(topicMessages),
];
