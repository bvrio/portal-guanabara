import type { CatalogEntryItem } from '../../src/Journeys/Catalog/types';

/** Sample Catalog data for tests and stories (shaped like the real workbook rows). */
export const projectEntry: CatalogEntryItem = {
  ref: 1,
  kind: 'project',
  name: 'Pescando Resíduos',
  objective:
    'Remunerar pescadores artesanais pela coleta de resíduos sólidos nas ilhas e manguezais do interior da Baía de Guanabara.',
  status: 'active',
  start: { date: '2021-12-01', precision: 'month' },
  end: null,
  ongoing: true,
  municipalities: ['Rio de Janeiro'],
  sectors: [{ code: 'interior', label: 'Interior', href: '/catalog/list?sector=interior' }],
  keywords: [
    { code: 'macrolixo', label: 'Macrolixo', href: '/catalog/list?keyword=macrolixo' },
    { code: 'pesca-artesanal', label: 'Pesca artesanal', href: '/catalog/list?keyword=pesca-artesanal' },
  ],
  publicationYears: [2024, 2025, 2026],
  href: '/catalog/1',
};

export const studyEntry: CatalogEntryItem = {
  ref: 36,
  kind: 'study',
  name: 'Microplastic in the sediments of a highly eutrophic tropical estuary (Marine Pollution Bulletin)',
  objective: 'Quantificar e descrever os microplásticos nos sedimentos sublitorais da Baía de Guanabara.',
  status: null,
  start: { date: '2017-03-01', precision: 'month' },
  end: { date: '2017-12-01', precision: 'month' },
  ongoing: false,
  municipalities: ['São Gonçalo', 'Rio de Janeiro'],
  sectors: [
    { code: 'transicao', label: 'Transição', href: '/catalog/list?sector=transicao' },
    { code: 'entrada', label: 'Entrada', href: '/catalog/list?sector=entrada' },
  ],
  keywords: [
    { code: 'microplastico', label: 'Microplástico', href: '/catalog/list?keyword=microplastico' },
    { code: 'sedimento-estuarino', label: 'Sedimento estuarino', href: '/catalog/list?keyword=sedimento-estuarino' },
  ],
  publicationYears: [2019],
  href: '/catalog/36',
};

export const totals = {
  entries: 41,
  projects: 24,
  studies: 17,
  activeProjects: 10,
  institutions: 63,
  municipalities: 8,
};

export const keywordBuckets = [
  { id: 'macrolixo', label: 'Macrolixo', value: 28, href: '/catalog/list?keyword=macrolixo' },
  { id: 'estuario', label: 'Estuário', value: 13, href: '/catalog/list?keyword=estuario' },
  { id: 'microplastico', label: 'Microplástico', value: 12, href: '/catalog/list?keyword=microplastico' },
  { id: 'pesca-artesanal', label: 'Pesca artesanal', value: 8, href: '/catalog/list?keyword=pesca-artesanal' },
  { id: 'litoral', label: 'Litoral', value: 7, href: '/catalog/list?keyword=litoral' },
  { id: 'fauna', label: 'Fauna', value: 6, href: '/catalog/list?keyword=fauna' },
  { id: 'rio', label: 'Rio', value: 6, href: '/catalog/list?keyword=rio' },
  { id: 'manguezal', label: 'Manguezal', value: 5, href: '/catalog/list?keyword=manguezal' },
  { id: 'sedimento-estuarino', label: 'Sedimento estuarino', value: 5, href: '/catalog/list?keyword=sedimento-estuarino' },
  { id: 'saneamento', label: 'Saneamento', value: 2, href: '/catalog/list?keyword=saneamento' },
];

export const filterOptions = {
  kinds: [
    { value: 'project' as const, count: 24 },
    { value: 'study' as const, count: 17 },
  ],
  statuses: [
    { value: 'active' as const, count: 10 },
    { value: 'ended' as const, count: 2 },
  ],
  period: { first: '1984-01', last: '2026-11' },
  keywords: keywordBuckets.map(({ id, label, value }) => ({ value: id, label, count: value })),
  municipalities: [
    { value: 'rio-de-janeiro', label: 'Rio de Janeiro', count: 22 },
    { value: 'niteroi', label: 'Niterói', count: 11 },
    { value: 'sao-goncalo', label: 'São Gonçalo', count: 11 },
    { value: 'guapimirim', label: 'Guapimirim', count: 0 },
  ],
  sectors: [
    { value: 'interior', label: 'Interior', count: 13 },
    { value: 'entrada', label: 'Entrada', count: 10 },
  ],
  mechanisms: [
    { value: 'transacional', label: 'Transacional', count: 7 },
    { value: 'limpeza', label: 'Limpeza', count: 5 },
  ],
  institutions: [
    { value: 'uff', label: 'UFF', count: 11 },
    { value: 'inea', label: 'INEA', count: 5 },
    { value: 'prefeitura-de-niteroi', label: 'Prefeitura de Niterói', count: 3 },
  ],
};

export const partyGroups = [
  {
    role: 'executor' as const,
    parties: [
      { name: 'Instituto BVRio', kind: 'institution' as const, code: 'instituto-bvrio', note: null },
      { name: 'COOPAMA', kind: 'institution' as const, code: 'coopama', note: null },
    ],
  },
  { role: 'funder' as const, parties: [{ name: 'Ogyre', kind: 'institution' as const, code: 'ogyre', note: null }] },
  {
    role: 'coordinator' as const,
    parties: [{ name: 'Maria Silva', kind: 'person' as const, code: null, note: 'coordenação do projeto' }],
  },
];

export const sources = [
  {
    url: 'https://doi.org/10.1016/j.marpolbul.2019.06.042',
    doi: '10.1016/j.marpolbul.2019.06.042',
    note: null,
    sourceType: 'Artigo científico',
    venue: 'Marine Pollution Bulletin',
    publishedYear: 2019,
  },
];

/** The catalogue's controlled vocabulary, as the Listas tab names it. */
export const sectorVocabulary = [
  { code: 'interior', label: 'Interior', count: 13 },
  { code: 'transicao', label: 'Transição', count: 1 },
  { code: 'entrada', label: 'Entrada', count: 10 },
  { code: 'baia-inteira', label: 'Baía inteira', count: 8 },
  { code: 'fora-da-baia', label: 'Fora da Baía', count: 3 },
];

export const keywordVocabulary = [
  {
    category: 'Tipo de resíduo',
    keywords: [
      { code: 'macrolixo', label: 'Macrolixo' },
      { code: 'microplastico', label: 'Microplástico' },
      { code: 'contaminantes', label: 'Contaminantes' },
      { code: 'lixo-nautico', label: 'Lixo náutico' },
    ],
  },
  {
    category: 'Ambiente',
    keywords: [
      { code: 'rio', label: 'Rio' },
      { code: 'sedimento-de-rio', label: 'Sedimento de rio' },
      { code: 'manguezal', label: 'Manguezal' },
      { code: 'sedimento-de-manguezal', label: 'Sedimento de manguezal' },
      { code: 'estuario', label: 'Estuário' },
      { code: 'sedimento-estuarino', label: 'Sedimento estuarino' },
      { code: 'litoral', label: 'Litoral' },
      { code: 'plataforma-continental', label: 'Plataforma continental' },
      { code: 'sedimento-marinho', label: 'Sedimento marinho' },
    ],
  },
  {
    category: 'Biota',
    keywords: [
      { code: 'fauna', label: 'Fauna' },
      { code: 'flora', label: 'Flora' },
    ],
  },
  { category: 'Processos físicos', keywords: [{ code: 'hidrodinamica', label: 'Hidrodinâmica' }] },
  {
    category: 'Dimensão socioambiental',
    keywords: [
      { code: 'pesca-artesanal', label: 'Pesca artesanal' },
      { code: 'cadeia-da-reciclagem', label: 'Cadeia da reciclagem' },
      { code: 'saneamento', label: 'Saneamento' },
      { code: 'restauracao-ecologica', label: 'Restauração ecológica' },
    ],
  },
];
