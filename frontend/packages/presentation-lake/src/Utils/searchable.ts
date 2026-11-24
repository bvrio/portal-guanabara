/** Accent- and case-insensitive form of a text, for client-side matching (pt-BR). */
export function searchable(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('pt-BR');
}
