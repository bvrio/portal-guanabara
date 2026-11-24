/** Initials for the header avatar: first letters of the first and second names ("Maria Silva Santos" → "MS"). */
export function initialsOf(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toLocaleUpperCase('pt-BR'))
    .join('');
}

/** `useAsyncData` key of the session, so sign-in and sign-out can refresh it. */
export const SESSION_KEY = 'session:current';
