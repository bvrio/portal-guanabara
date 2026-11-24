/**
 * Translations of the catalog's controlled vocabularies (v0.7), by code.
 * Portuguese comes from the workbook's "Listas" tab; these are en, es and fr.
 *
 * A code without a translation falls back to Portuguese, and the test
 * `taxonomyLabels.tests.ts` fails for every code in the snapshot that has none —
 * so a new keyword in the workbook is translated before it ships. When the
 * backend replaces the snapshot, these become the `*_translation` tables
 * (docs/architecture/backend.md).
 */
import type { CatalogLocale } from './catalogLocale.ts';

export type TranslatedLocale = Exclude<CatalogLocale, 'pt-BR'>;
export type LabelTranslations = Readonly<Record<TranslatedLocale, string>>;

export type TaxonomyList =
  | 'keywords'
  | 'mechanisms'
  | 'siteTypes'
  | 'institutionTypes'
  | 'sourceTypes'
  | 'indicators'
  | 'sectors';

export const TAXONOMY_LABELS: Readonly<Record<TaxonomyList, Readonly<Record<string, LabelTranslations>>>> = {
  keywords: {
    macrolixo: { en: 'Macro-litter', es: 'Macrobasura', fr: 'Macrodéchets' },
    microplastico: { en: 'Microplastics', es: 'Microplásticos', fr: 'Microplastiques' },
    contaminantes: { en: 'Contaminants', es: 'Contaminantes', fr: 'Contaminants' },
    'lixo-nautico': { en: 'Nautical litter', es: 'Basura náutica', fr: 'Déchets nautiques' },
    rio: { en: 'River', es: 'Río', fr: 'Rivière' },
    'sedimento-de-rio': { en: 'River sediment', es: 'Sedimento fluvial', fr: 'Sédiment fluvial' },
    manguezal: { en: 'Mangrove', es: 'Manglar', fr: 'Mangrove' },
    'sedimento-de-manguezal': { en: 'Mangrove sediment', es: 'Sedimento de manglar', fr: 'Sédiment de mangrove' },
    estuario: { en: 'Estuary', es: 'Estuario', fr: 'Estuaire' },
    'sedimento-estuarino': { en: 'Estuarine sediment', es: 'Sedimento estuarino', fr: 'Sédiment estuarien' },
    litoral: { en: 'Coast', es: 'Litoral', fr: 'Littoral' },
    'plataforma-continental': { en: 'Continental shelf', es: 'Plataforma continental', fr: 'Plateau continental' },
    'sedimento-marinho': { en: 'Marine sediment', es: 'Sedimento marino', fr: 'Sédiment marin' },
    fauna: { en: 'Fauna', es: 'Fauna', fr: 'Faune' },
    flora: { en: 'Flora', es: 'Flora', fr: 'Flore' },
    hidrodinamica: { en: 'Hydrodynamics', es: 'Hidrodinámica', fr: 'Hydrodynamique' },
    'pesca-artesanal': { en: 'Artisanal fishing', es: 'Pesca artesanal', fr: 'Pêche artisanale' },
    'cadeia-da-reciclagem': { en: 'Recycling chain', es: 'Cadena de reciclaje', fr: 'Filière du recyclage' },
    saneamento: { en: 'Sanitation', es: 'Saneamiento', fr: 'Assainissement' },
    'restauracao-ecologica': { en: 'Ecological restoration', es: 'Restauración ecológica', fr: 'Restauration écologique' },
  },
  mechanisms: {
    contencao: { en: 'Containment', es: 'Contención', fr: 'Rétention' },
    'desenvolvimento-tecnologico': {
      en: 'Technology development',
      es: 'Desarrollo tecnológico',
      fr: 'Développement technologique',
    },
    educativa: { en: 'Educational', es: 'Educativa', fr: 'Éducative' },
    fiscalizacao: { en: 'Enforcement', es: 'Fiscalización', fr: 'Contrôle' },
    'incidencia-politica': { en: 'Policy advocacy', es: 'Incidencia política', fr: 'Plaidoyer' },
    limpeza: { en: 'Clean-up', es: 'Limpieza', fr: 'Nettoyage' },
    monitoramento: { en: 'Monitoring', es: 'Monitoreo', fr: 'Suivi' },
    'reciclagem-e-destinacao': {
      en: 'Recycling and disposal',
      es: 'Reciclaje y disposición final',
      fr: 'Recyclage et élimination',
    },
    transacional: { en: 'Transactional', es: 'Transaccional', fr: 'Transactionnelle' },
    voluntaria: { en: 'Voluntary', es: 'Voluntaria', fr: 'Bénévole' },
  },
  siteTypes: {
    praia: { en: 'Beach', es: 'Playa', fr: 'Plage' },
    ilha: { en: 'Island', es: 'Isla', fr: 'Île' },
    manguezal: { en: 'Mangrove', es: 'Manglar', fr: 'Mangrove' },
    'rio-ou-canal': { en: 'River or canal', es: 'Río o canal', fr: 'Rivière ou canal' },
    'espelho-d-agua': { en: 'Water surface', es: 'Espejo de agua', fr: 'Plan d’eau' },
    fundo: { en: 'Seabed', es: 'Fondo', fr: 'Fond' },
  },
  institutionTypes: {
    academica: { en: 'Academic', es: 'Académica', fr: 'Académique' },
    'associacao-empresarial': {
      en: 'Business association',
      es: 'Asociación empresarial',
      fr: 'Association professionnelle',
    },
    comunitaria: { en: 'Community-based', es: 'Comunitaria', fr: 'Communautaire' },
    cooperativa: { en: 'Cooperative', es: 'Cooperativa', fr: 'Coopérative' },
    'empresa-privada': { en: 'Private company', es: 'Empresa privada', fr: 'Entreprise privée' },
    'empresa-estatal': { en: 'State-owned company', es: 'Empresa estatal', fr: 'Entreprise publique' },
    'pessoa-fisica': { en: 'Individual', es: 'Persona física', fr: 'Personne physique' },
    'poder-publico': { en: 'Government', es: 'Poder público', fr: 'Pouvoirs publics' },
    'terceiro-setor': { en: 'Non-profit', es: 'Tercer sector', fr: 'Secteur associatif' },
  },
  sourceTypes: {
    'artigo-cientifico': { en: 'Scientific article', es: 'Artículo científico', fr: 'Article scientifique' },
    dissertacao: { en: 'Master’s thesis', es: 'Tesis de maestría', fr: 'Mémoire de master' },
    'anais-de-evento': { en: 'Conference proceedings', es: 'Actas de congreso', fr: 'Actes de colloque' },
    'relatorio-tecnico': { en: 'Technical report', es: 'Informe técnico', fr: 'Rapport technique' },
    'divulgacao-cientifica': {
      en: 'Science communication',
      es: 'Divulgación científica',
      fr: 'Vulgarisation scientifique',
    },
    reportagem: { en: 'News report', es: 'Reportaje', fr: 'Reportage' },
    'site-institucional': { en: 'Institutional website', es: 'Sitio web institucional', fr: 'Site institutionnel' },
    blog: { en: 'Blog', es: 'Blog', fr: 'Blog' },
  },
  indicators: {
    'massa-t': { en: 'Mass (t)', es: 'Masa (t)', fr: 'Masse (t)' },
    'massa-por-tempo-t-dia': {
      en: 'Mass over time (t/day)',
      es: 'Masa por tiempo (t/día)',
      fr: 'Masse par unité de temps (t/jour)',
    },
    'volume-m': { en: 'Volume (m³)', es: 'Volumen (m³)', fr: 'Volume (m³)' },
    'itens-por-area-itens-m': {
      en: 'Items per area (items/m²)',
      es: 'Ítems por área (ítems/m²)',
      fr: 'Objets par surface (objets/m²)',
    },
    'itens-por-volume-itens-m': {
      en: 'Items per volume (items/m³)',
      es: 'Ítems por volumen (ítems/m³)',
      fr: 'Objets par volume (objets/m³)',
    },
    'itens-por-massa-itens-kg-ou-itens-g': {
      en: 'Items per mass (items/kg or items/g)',
      es: 'Ítems por masa (ítems/kg o ítems/g)',
      fr: 'Objets par masse (objets/kg ou objets/g)',
    },
  },
  sectors: {
    'baia-inteira': { en: 'Whole bay', es: 'Toda la bahía', fr: 'Toute la baie' },
    entrada: { en: 'Entrance', es: 'Entrada', fr: 'Entrée' },
    'fora-da-baia': { en: 'Outside the bay', es: 'Fuera de la bahía', fr: 'Hors de la baie' },
    interior: { en: 'Inner bay', es: 'Interior', fr: 'Intérieur' },
    transicao: { en: 'Transition', es: 'Transición', fr: 'Transition' },
  },
};

/** The label of a code in a language; undefined when there is none (callers keep Portuguese). */
export function translateTaxonomyLabel(list: TaxonomyList, code: string, locale: CatalogLocale): string | undefined {
  if (locale === 'pt-BR') return undefined;
  return TAXONOMY_LABELS[list][code]?.[locale];
}
