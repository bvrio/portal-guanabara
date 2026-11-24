/**
 * Column names of the workbook's "Geral" tab, as written by the mapping team.
 * The importer fails when one of them is missing, so a renamed column is
 * caught on the next import instead of silently emptying a field.
 */
export const GERAL = {
  id: 'ID',
  name: 'Nome',
  keywords: 'Palavras-chave (lista)',
  objective: 'Objetivo',
  sector: 'Setor da Baía de Guanabara (lista)',
  municipality: 'Município (lista)',
  locality: 'Bairro ou localidade (lista)',
  river: 'Rios (lista)',
  conservationUnit: 'Unidade de conservação (lista)',
  fishingColony: 'Colônia de pesca (lista)',
  siteType: 'Tipo de local (lista)',
  periodicity: 'Periodicidade (lista)',
  startDate: 'Data de início',
  endDate: 'Data de fim',
  status: 'Status (lista)',
  mechanism: 'Mecanismo de atuação (lista)',
  executingInstitutions: 'Instituições Executoras (lista)',
  institutionType: 'Tipo de instituição (lista)',
  funders: 'Financiadoras (lista)',
  funderType: 'Tipo de financiador (lista)',
  partners: 'Parceiras (lista)',
  executors: 'Executores (lista)',
  coordinator: 'Coordenador Geral',
  authors: 'Autores (estudos)',
  sourceType: 'Tipo de fonte (lista)',
  venue: 'Veículo ou periódico (string)',
  publicationYear: 'Ano de publicação',
  links: 'DOI ou link',
  results: 'Resultados gerados',
  indicator: 'Variável quantitativa e unidade (lista)',
  dataAvailability: 'Dados disponíveis',
  details: 'Detalhes',
} as const;

export type GeralColumnKey = keyof typeof GERAL;

/** Column names of the "Listas" tab (one controlled list per column). */
export const LISTAS = {
  keyword: 'Palavra-chave',
  keywordCategory: 'Categoria da palavra-chave',
  sector: 'Setor da Baía de Guanabara',
  municipality: 'Município',
  locality: 'Bairro ou localidade',
  river: 'Rios',
  conservationUnit: 'Unidade de conservação',
  fishingColony: 'Colônia de pesca',
  siteType: 'Tipo de local',
  periodicity: 'Periodicidade',
  status: 'Status',
  mechanism: 'Mecanismo de atuação',
  institutionType: 'Tipo de organização',
  actor: 'Atores (organizações e grupos sociais)',
  funderType: 'Tipo de financiador',
  sourceType: 'Tipo de fonte',
  venue: 'Veículo ou periódico',
  indicator: 'Variável quantitativa e unidade',
} as const;

export type ListasColumnKey = keyof typeof LISTAS;

/** Geral list columns checked against a Listas column ("every value exists in Listas"). */
export const LIST_COLUMNS: ReadonlyArray<readonly [GeralColumnKey, ListasColumnKey]> = [
  ['keywords', 'keyword'],
  ['sector', 'sector'],
  ['municipality', 'municipality'],
  ['locality', 'locality'],
  ['river', 'river'],
  ['conservationUnit', 'conservationUnit'],
  ['fishingColony', 'fishingColony'],
  ['siteType', 'siteType'],
  ['periodicity', 'periodicity'],
  ['status', 'status'],
  ['mechanism', 'mechanism'],
  ['executingInstitutions', 'actor'],
  ['institutionType', 'institutionType'],
  ['funders', 'actor'],
  ['funderType', 'funderType'],
  ['partners', 'actor'],
  ['executors', 'actor'],
  ['sourceType', 'sourceType'],
  ['indicator', 'indicator'],
];
