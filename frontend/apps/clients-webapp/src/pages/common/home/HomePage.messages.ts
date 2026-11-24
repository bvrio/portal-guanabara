import { defineMessages } from '@portal-guanabara/presentation-lake';

export const defaultMessages = defineMessages({
  documentTitle: { id: 'clients.homePage.documentTitle', defaultMessage: 'Portal Guanabara' },
  title: {
    id: 'clients.homePage.title',
    description:
      'Rich text: <study> is drawn in the research purple, <act> in the action orange; each <line> is one line of the title (break after "pela").',
    defaultMessage:
      '<line>Quem <study>estuda</study> e quem <act>atua</act> pela</line> <line>Baía de Guanabara, em um só lugar</line>',
  },
  brand: {
    id: 'clients.homePage.brand',
    description: 'The brand name over the large mark in the hero; never translated.',
    defaultMessage: 'Portal Guanabara',
  },
  introduction: {
    id: 'clients.homePage.introduction',
    defaultMessage:
      'O mapeamento da BVRio reúne as iniciativas que limpam, coletam e restauram a baía e os estudos que medem o lixo no mar, nos rios e nos manguezais. Veja abaixo onde e sobre o que atuam — e clique em qualquer setor, tema, mecanismo ou universidade para ver as entradas ao lado.',
  },
  explore: { id: 'clients.homePage.explore', defaultMessage: 'Explorar o catálogo' },
  exploreInstitutionsTitle: { id: 'clients.homePage.explore.institutionsTitle', defaultMessage: 'Instituições' },
  exploreInstitutionsLine: {
    id: 'clients.homePage.explore.institutionsLine',
    defaultMessage: 'Executam, financiam, apoiam ou assinam',
  },
  exploreMunicipalitiesTitle: { id: 'clients.homePage.explore.municipalitiesTitle', defaultMessage: 'Municípios' },
  exploreMunicipalitiesLine: {
    id: 'clients.homePage.explore.municipalitiesLine',
    defaultMessage: 'Com atuação em volta da Baía de Guanabara',
  },
  tour: { id: 'clients.homePage.tour', defaultMessage: 'Começar o tour' },
  tourHint: {
    id: 'clients.homePage.tourHint',
    defaultMessage: 'Novo por aqui? Faça um tour pelas principais funcionalidades.',
  },
  updated: { id: 'clients.homePage.updated', defaultMessage: 'Dados atualizados em {date}' },
  loadError: { id: 'clients.homePage.loadError', defaultMessage: 'Não foi possível carregar o panorama do catálogo agora.' },
  retry: { id: 'clients.homePage.retry', defaultMessage: 'Tentar de novo' },

  sectorsTitle: { id: 'clients.homePage.sectorsTitle', defaultMessage: 'Onde atuam, por setor da baía' },
  sectorsDescription: {
    id: 'clients.homePage.sectorsDescription',
    defaultMessage: 'Do interior da baía até a entrada e o mar aberto. Clique em um setor para ver as entradas ao lado.',
  },
  distributionsTitle: {
    id: 'clients.homePage.distributionsTitle',
    defaultMessage: 'Temas, formas de atuação e academia',
  },
  distributionsDescription: {
    id: 'clients.homePage.distributionsDescription',
    defaultMessage:
      'Clique em uma barra para ver as entradas daquele recorte. Uma entrada pode aparecer em mais de uma categoria; entradas sem informação confirmada são contadas à parte, nunca como categoria.',
  },
  keywordsTitle: { id: 'clients.homePage.keywordsTitle', defaultMessage: 'Palavras-chave' },
  mechanismsTitle: { id: 'clients.homePage.mechanismsTitle', defaultMessage: 'Mecanismos de atuação' },
  mechanismsDescription: {
    id: 'clients.homePage.mechanismsDescription',
    defaultMessage: 'Somente iniciativas; estudos não têm mecanismo de atuação.',
  },
  academiaTitle: { id: 'clients.homePage.academiaTitle', defaultMessage: 'Estudos por academia' },
  academiaDescription: {
    id: 'clients.homePage.academiaDescription',
    defaultMessage: 'Universidades e centros de pesquisa, pelo número de estudos de que participam.',
  },
  highlightsTitle: { id: 'clients.homePage.highlightsTitle', defaultMessage: 'Destaques' },

  tourNavigationTitle: { id: 'clients.homePage.tour.navigationTitle', defaultMessage: 'Cinco abas para explorar' },
  tourNavigationBody: {
    id: 'clients.homePage.tour.navigationBody',
    defaultMessage: 'Início resume, Catálogo lista tudo, Instituições mostra quem faz, Mapa mostra onde e Sobre nós conta quem somos.',
  },
  tourOptionsTitle: { id: 'clients.homePage.tour.optionsTitle', defaultMessage: 'Idioma e zoom' },
  tourOptionsBody: {
    id: 'clients.homePage.tour.optionsBody',
    defaultMessage: 'Em Opções, leia o portal em outro idioma ou aumente o zoom.',
  },
  // One step for the four explore cards (v0.9.28; the kinds and the numbers were two steps).
  tourExploreTitle: { id: 'clients.homePage.tour.exploreTitle', defaultMessage: 'Quatro portas para o catálogo' },
  tourExploreBody: {
    id: 'clients.homePage.tour.exploreBody',
    defaultMessage: 'Iniciativas atuam na baía; estudos pesquisam a baía. Clique em um cartão para ver o que ele conta.',
  },
  // v0.9.29: the Mapa, between the explore cards and the sectors; shown on the Mapa page since v0.9.31.
  tourMapTitle: { id: 'clients.homePage.tour.mapTitle', defaultMessage: 'O mapa da baía' },
  tourMapBody: {
    id: 'clients.homePage.tour.mapBody',
    defaultMessage: 'Navegue pelo mapa: passe o mouse ou toque em um município ou setor para ver o resultado compilado.',
  },
  // v0.9.32: passing balloons between pages, and the entry the tour ends on.
  tourToMapTitle: { id: 'clients.homePage.tour.toMapTitle', defaultMessage: 'Abrindo o Mapa…' },
  tourToHomeTitle: { id: 'clients.homePage.tour.toHomeTitle', defaultMessage: 'Vamos voltar para o Início' },
  tourEntryTitle: { id: 'clients.homePage.tour.entryTitle', defaultMessage: 'Clique em uma entrada' },
  tourEntryBody: {
    id: 'clients.homePage.tour.entryBody',
    defaultMessage: 'Cada cartão abre a ficha completa da iniciativa ou do estudo.',
  },
  tourToEntryTitle: { id: 'clients.homePage.tour.toEntryTitle', defaultMessage: 'Abrindo a ficha…' },
  tourDetailsTitle: { id: 'clients.homePage.tour.detailsTitle', defaultMessage: 'A ficha da entrada' },
  tourDetailsBody: {
    id: 'clients.homePage.tour.detailsBody',
    defaultMessage: 'Onde, o quê, quem participa e as fontes: tudo sobre a entrada em uma página.',
  },
  // v0.9.33: the tour ends back on Início.
  tourGoodbyeTitle: { id: 'clients.homePage.tour.goodbyeTitle', defaultMessage: 'Boa pesquisa!' },
  tourGoodbyeBody: {
    id: 'clients.homePage.tour.goodbyeBody',
    defaultMessage: 'Agora é com você. Para rever o caminho, comece o tour de novo por aqui.',
  },
  tourSectorsTitle: { id: 'clients.homePage.tour.sectorsTitle', defaultMessage: 'Onde atuam na baía' },
  tourSectorsBody: {
    id: 'clients.homePage.tour.sectorsBody',
    defaultMessage: 'Clique em um setor para ver as entradas ao lado.',
  },
  // v0.9.28: the charts, a row, and the drawer the row opens (the Catálogo step is gone).
  tourChartsTitle: { id: 'clients.homePage.tour.chartsTitle', defaultMessage: 'Temas, mecanismos e academias' },
  tourChartsBody: {
    id: 'clients.homePage.tour.chartsBody',
    defaultMessage: 'Cada gráfico mostra quantas iniciativas e estudos há em cada recorte.',
  },
  tourRowTitle: { id: 'clients.homePage.tour.rowTitle', defaultMessage: 'Clique em uma linha' },
  tourRowBody: {
    id: 'clients.homePage.tour.rowBody',
    defaultMessage: 'A linha abre as entradas dela ao lado, sem sair da página.',
  },
  tourDrawerTitle: { id: 'clients.homePage.tour.drawerTitle', defaultMessage: 'As entradas, ao lado' },
  tourDrawerBody: {
    id: 'clients.homePage.tour.drawerBody',
    defaultMessage: 'Aqui estão as iniciativas e os estudos da linha; clique em um para ver a ficha.',
  },
  tourFilterTitle: { id: 'clients.homePage.tour.filterTitle', defaultMessage: 'Filtre como preferir' },
  tourFilterBody: {
    id: 'clients.homePage.tour.filterBody',
    defaultMessage: 'Crie suas próprias análises utilizando diversos filtros.',
  },
});
