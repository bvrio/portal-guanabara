import { GERAL, type GeralColumnKey, LISTAS, type ListasColumnKey } from '../importer/columns.ts';
import type { WorkbookData } from '../importer/workbook.ts';

/** Listas used by the fixtures: a small, realistic subset of the real tab. */
export const FIXTURE_LISTS: Partial<Record<ListasColumnKey, string[]>> = {
  keyword: ['Macrolixo', 'Microplástico', 'Manguezal', 'não encontrado'],
  keywordCategory: ['Tipo de resíduo', 'Tipo de resíduo', 'Ambiente'],
  sector: ['Entrada', 'Interior', 'Não confirmado', 'não encontrado', 'não se aplica'],
  municipality: ['Rio de Janeiro', 'Niterói', 'São Gonçalo', 'Não confirmado'],
  locality: ['Ilha do Governador', 'Jurujuba'],
  river: ['Iguaçu'],
  conservationUnit: ['APA de Guapimirim'],
  fishingColony: ['Z-8'],
  siteType: ['Praia', 'Manguezal'],
  periodicity: ['Contínua', 'Periódica', 'Pontual', 'não encontrado', 'não se aplica'],
  status: ['Ativa', 'Em implantação', 'Encerrada', 'Não confirmado', 'Publicado', 'Em andamento', 'não se aplica'],
  mechanism: ['Limpeza', 'Transacional', 'Educativa', 'não encontrado', 'não se aplica'],
  institutionType: ['Acadêmica', 'Terceiro setor', 'Poder público', 'não encontrado'],
  actor: ['UFF', 'UFRJ', 'Instituto BVRio', 'CNPq', 'Prefeitura de Niterói', 'Pescadores artesanais', 'Abrelpe'],
  funderType: ['Agência de fomento à pesquisa', 'Terceiro setor', 'não encontrado', 'não se aplica'],
  sourceType: ['Artigo científico', 'Reportagem', 'Site institucional'],
  venue: ['Marine Pollution Bulletin', 'Agência Brasil'],
  indicator: ['Massa (t)', 'Itens por massa (itens/kg ou itens/g)', 'Sem dado quantitativo'],
};

export type FixtureRow = Partial<Record<GeralColumnKey, string | number>>;

/** An initiative row with every column filled the way the mapping team does. */
export function projectRow(overrides: FixtureRow = {}): FixtureRow {
  return {
    id: 1,
    name: 'Pescando Resíduos',
    keywords: 'Macrolixo, Manguezal',
    objective: 'Remunerar pescadores pela coleta de resíduos na baía.',
    sector: 'Interior',
    municipality: 'Rio de Janeiro',
    locality: 'Ilha do Governador',
    river: 'sem informação',
    conservationUnit: 'sem informação',
    fishingColony: 'Z-8',
    siteType: 'Manguezal',
    periodicity: 'Contínua',
    startDate: '2021-12-DD',
    endDate: 'em curso',
    status: 'Ativa',
    mechanism: 'Transacional, Limpeza',
    executingInstitutions: 'Instituto BVRio',
    institutionType: 'Terceiro setor',
    funders: 'CNPq',
    funderType: 'Agência de fomento à pesquisa',
    partners: 'não encontrado',
    executors: 'Pescadores artesanais',
    coordinator: 'Maria Silva (coordenação do projeto)',
    authors: 'não se aplica',
    sourceType: 'Site institucional',
    venue: 'não se aplica',
    publicationYear: '2025',
    links: 'https://www.bvrio.org/pescando',
    results: 'Mais de 600 t de resíduos retirados.',
    indicator: 'Massa (t)',
    dataAvailability: 'Totais por ano no site do programa.',
    details: 'Local: Ilha do Governador\nFinanciadoras: linha Ogyre',
    ...overrides,
  };
}

/** A study row (Mecanismo "não se aplica" is what marks a study). */
export function studyRow(overrides: FixtureRow = {}): FixtureRow {
  return {
    ...projectRow(),
    id: 2,
    name: 'Microplastic in the sediments of an estuary',
    keywords: 'Microplástico',
    objective: 'Quantificar microplásticos nos sedimentos.',
    sector: 'Entrada',
    municipality: 'Niterói',
    locality: 'Jurujuba',
    fishingColony: 'sem informação',
    siteType: 'Praia',
    periodicity: 'Pontual',
    startDate: '2017-03-DD',
    endDate: '2017-12-DD',
    status: 'não se aplica',
    mechanism: 'não se aplica',
    executingInstitutions: 'UFF, UFRJ',
    institutionType: 'Acadêmica',
    funders: 'CNPq',
    partners: 'não se aplica',
    executors: 'não se aplica',
    coordinator: 'não se aplica',
    authors: 'Alves, V. E. N.; Figueiredo, G. M.',
    sourceType: 'Artigo científico',
    venue: 'Marine Pollution Bulletin',
    publicationYear: '2019',
    links: 'https://doi.org/10.1016/j.marpolbul.2019.06.042',
    results: 'De 160 a 1.000 itens/kg.',
    indicator: 'Itens por massa (itens/kg ou itens/g)',
    dataAvailability: 'Itens/kg',
    details: 'Local: quatro pontos sublitorais',
    ...overrides,
  };
}

/** Builds an in-memory workbook with Geral and Listas tabs. */
export function workbookFixture(
  rows: FixtureRow[],
  options: { lists?: Partial<Record<ListasColumnKey, string[]>>; dropColumns?: GeralColumnKey[] } = {},
): WorkbookData {
  const columns = (Object.keys(GERAL) as GeralColumnKey[]).filter((key) => !options.dropColumns?.includes(key));
  const lists = { ...FIXTURE_LISTS, ...options.lists };
  const listKeys = Object.keys(LISTAS) as ListasColumnKey[];
  const height = Math.max(...listKeys.map((key) => lists[key]?.length ?? 0));

  return {
    fileName: 'fixture.xlsx',
    sha256: 'f'.repeat(64),
    sheets: {
      Geral: [columns.map((key) => GERAL[key]), ...rows.map((row) => columns.map((key) => row[key] ?? null))],
      Listas: [
        listKeys.map((key) => LISTAS[key]),
        ...Array.from({ length: height }, (_, index) => listKeys.map((key) => lists[key]?.[index] ?? null)),
      ],
    },
  };
}
