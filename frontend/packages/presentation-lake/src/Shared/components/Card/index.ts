import CardCell from './CardCell.vue';
import CardRoot from './Card.vue';
import CardRow from './CardRow.vue';

/**
 * Compound component: use <Card>, <Card.Row> and <Card.Cell> in templates
 * (Vue supports namespaced components imported in <script setup>).
 */
export const Card = Object.assign(CardRoot, {
  Row: CardRow,
  Cell: CardCell,
});

export { CardCell, CardRow };

export type { CardProps, CardSize, CardVariant } from './Card.vue';
export type { CardColumnSize, CardGap, CardRowProps } from './CardRow.vue';
