import { defineEventHandler, getRequestURL, sendRedirect } from 'h3';

/**
 * Routes that moved (v0.5): the catalog list was `/catalog/list` and is now
 * `/catalog`. Shared links keep working, filters included.
 */
const MOVED: Record<string, string> = {
  '/catalog/list': '/catalog',
};

export default defineEventHandler((event) => {
  const url = getRequestURL(event);
  const target = MOVED[url.pathname.replace(/\/+$/, '')];
  if (target) return sendRedirect(event, `${target}${url.search}`, 301);
});
