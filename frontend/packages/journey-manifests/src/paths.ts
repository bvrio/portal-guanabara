/**
 * Page path patterns.
 *
 * A Page path is a sequence of static kebab-case segments and parameters
 * (`:camelCase`), each a whole segment: `/catalog/:id`. In the Nuxt routing
 * folder a parameter segment becomes a bracketed folder: `src/app/catalog/[id]`.
 */
const STATIC_SEGMENT = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const PARAM_SEGMENT = /^:[a-z][A-Za-z0-9]*$/;

export type PathParams = Record<string, string | number>;

function segmentsOf(path: string): string[] {
  return path.split('/').filter(Boolean);
}

/** Null when valid; otherwise why the pattern is not a valid Page path. */
export function pathPatternError(pattern: string): string | null {
  if (!pattern.startsWith('/')) return 'path must start with "/"';
  if (pattern.length > 1 && pattern.endsWith('/')) return 'path must not end with "/"';

  const params = new Set<string>();
  for (const segment of segmentsOf(pattern)) {
    if (PARAM_SEGMENT.test(segment)) {
      if (params.has(segment)) return `parameter ${segment} is declared twice`;
      params.add(segment);
    } else if (!STATIC_SEGMENT.test(segment)) {
      return `segment "${segment}" must be kebab-case or a :camelCase parameter`;
    }
  }
  return null;
}

export function pathParamNames(pattern: string): string[] {
  return segmentsOf(pattern)
    .filter((segment) => segment.startsWith(':'))
    .map((segment) => segment.slice(1));
}

/** Parameters of `path` when it matches `pattern`, otherwise null. */
export function matchPagePath(pattern: string, path: string): Record<string, string> | null {
  const expected = segmentsOf(pattern);
  const actual = segmentsOf(path.split(/[?#]/)[0] ?? '');
  if (expected.length !== actual.length) return null;

  const params: Record<string, string> = {};
  for (const [index, segment] of expected.entries()) {
    const value = actual[index]!;
    if (segment.startsWith(':')) {
      params[segment.slice(1)] = decodeURIComponent(value);
    } else if (segment !== value) {
      return null;
    }
  }
  return params;
}

/** `/catalog/:id` + `{ id: 36 }` → `/catalog/36`. Throws when a parameter is missing. */
export function buildPagePath(pattern: string, params: PathParams = {}): string {
  const path = segmentsOf(pattern)
    .map((segment) => {
      if (!segment.startsWith(':')) return segment;
      const value = params[segment.slice(1)];
      if (value === undefined || value === '') throw new Error(`Missing path parameter "${segment.slice(1)}" for ${pattern}`);
      return encodeURIComponent(String(value));
    })
    .join('/');
  return `/${path}`;
}

/** Folder of the route file inside the App routing directory: `catalog/[id]`. */
export function routeFolderOf(pattern: string): string {
  return segmentsOf(pattern)
    .map((segment) => (segment.startsWith(':') ? `[${segment.slice(1)}]` : segment))
    .join('/');
}
