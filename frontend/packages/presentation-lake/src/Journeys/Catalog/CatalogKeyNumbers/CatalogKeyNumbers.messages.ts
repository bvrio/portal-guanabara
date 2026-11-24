import { defineMessages } from '../../../Shared/foundations/i18n';

export const defaultMessages = defineMessages({
  title: { id: 'presentationLake.catalog.keyNumbers.title', defaultMessage: 'O catálogo em números' },
  activeProjects: { id: 'presentationLake.catalog.keyNumbers.activeProjects', defaultMessage: 'Iniciativas ativas' },
  activeProjectsHint: {
    id: 'presentationLake.catalog.keyNumbers.activeProjectsHint',
    defaultMessage: 'de {projects, plural, one {# iniciativa mapeada} other {# iniciativas mapeadas}}',
  },
  activeProjectsAction: { id: 'presentationLake.catalog.keyNumbers.activeProjectsAction', defaultMessage: 'Ver as ativas' },
  institutions: { id: 'presentationLake.catalog.keyNumbers.institutions', defaultMessage: 'Instituições envolvidas' },
  institutionsHint: {
    id: 'presentationLake.catalog.keyNumbers.institutionsHint',
    defaultMessage: 'executam, financiam, apoiam ou assinam',
  },
  institutionsAction: { id: 'presentationLake.catalog.keyNumbers.institutionsAction', defaultMessage: 'Ver as instituições' },
  municipalities: {
    id: 'presentationLake.catalog.keyNumbers.municipalities',
    defaultMessage: 'Municípios com atuação',
  },
  municipalitiesHint: {
    id: 'presentationLake.catalog.keyNumbers.municipalitiesHint',
    defaultMessage: 'em volta da Baía de Guanabara',
  },
  municipalitiesAction: { id: 'presentationLake.catalog.keyNumbers.municipalitiesAction', defaultMessage: 'Ver no mapa' },
});
