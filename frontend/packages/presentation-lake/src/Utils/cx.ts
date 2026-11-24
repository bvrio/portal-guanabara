export type ClassValue = string | false | null | undefined;

/** Joins truthy class names. Vue templates also accept class arrays natively. */
export function cx(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}
