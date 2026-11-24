import type { KindIconName, SectorIconName, TopicIconName, UiIconName } from '../../../Shared/foundations';
import type { CatalogEntryKind } from '../types';

/** Keyword categories of the catalogue vocabulary, as colour families. */
export type CatalogTopic = 'waste' | 'environment' | 'biota' | 'physical' | 'social' | 'other';

export const catalogKindIcons: Record<CatalogEntryKind, KindIconName> = {
  project: 'kind-project',
  study: 'kind-study',
};

/** Bay sectors by place slug (the codes `/api/catalog` returns). */
export const catalogSectorIcons: Readonly<Record<string, SectorIconName>> = {
  interior: 'sector-inner',
  transicao: 'sector-transition',
  entrada: 'sector-entrance',
  'baia-inteira': 'sector-whole-bay',
  'fora-da-baia': 'sector-outside',
};

export interface CatalogKeywordIconSpec {
  icon: TopicIconName | UiIconName;
  topic: CatalogTopic;
}

/** Keyword code → glyph and category (Listas tab of the mapping workbook). */
export const catalogKeywordIcons: Readonly<Record<string, CatalogKeywordIconSpec>> = {
  macrolixo: { icon: 'topic-macro-litter', topic: 'waste' },
  microplastico: { icon: 'topic-microplastic', topic: 'waste' },
  contaminantes: { icon: 'topic-contaminants', topic: 'waste' },
  'lixo-nautico': { icon: 'topic-nautical-litter', topic: 'waste' },
  rio: { icon: 'topic-river', topic: 'environment' },
  'sedimento-de-rio': { icon: 'topic-river-sediment', topic: 'environment' },
  manguezal: { icon: 'topic-mangrove', topic: 'environment' },
  'sedimento-de-manguezal': { icon: 'topic-mangrove-sediment', topic: 'environment' },
  estuario: { icon: 'topic-estuary', topic: 'environment' },
  'sedimento-estuarino': { icon: 'topic-estuarine-sediment', topic: 'environment' },
  litoral: { icon: 'topic-coast', topic: 'environment' },
  'plataforma-continental': { icon: 'topic-continental-shelf', topic: 'environment' },
  'sedimento-marinho': { icon: 'topic-marine-sediment', topic: 'environment' },
  fauna: { icon: 'topic-fauna', topic: 'biota' },
  flora: { icon: 'topic-flora', topic: 'biota' },
  hidrodinamica: { icon: 'topic-hydrodynamics', topic: 'physical' },
  'pesca-artesanal': { icon: 'topic-artisanal-fishing', topic: 'social' },
  'cadeia-da-reciclagem': { icon: 'topic-recycling-chain', topic: 'social' },
  saneamento: { icon: 'topic-sanitation', topic: 'social' },
  'restauracao-ecologica': { icon: 'topic-ecological-restoration', topic: 'social' },
};

const fallbackKeyword: CatalogKeywordIconSpec = { icon: 'tag', topic: 'other' };

/** A keyword the set does not know yet still gets a neutral tag glyph. */
export function catalogKeywordIcon(code: string): CatalogKeywordIconSpec {
  return catalogKeywordIcons[code] ?? fallbackKeyword;
}

/** A sector the set does not know yet falls back to a map pin. */
export function catalogSectorIcon(code: string): SectorIconName | 'map-pin' {
  return catalogSectorIcons[code] ?? 'map-pin';
}
