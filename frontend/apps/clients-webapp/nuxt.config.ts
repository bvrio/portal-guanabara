import { defaultFeatureFlags } from './src/shared/hooks/feature-flag/featureFlags';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',

  /**
   * Folder convention (kept identical to the React/Next.js template):
   *
   *   src/app/     → routing layer (thin route files only)   [Nuxt "pages" dir]
   *   src/pages/   → Page implementations (orchestration)    [plain folder]
   *   src/hooks/   → Hooks (Vue composables) per Journey
   *   src/services → Journey Service facades (HTTP)
   *   server/api/  → the App's own API (Catalog read services) — see server/README.md
   *   server/      → also the DEV mock backend of the demo Journeys
   *
   * Nuxt's default routing folder is called `pages/`, which would collide with
   * our Page layer, so the routing directory is renamed to `app/`.
   */
  srcDir: 'src',
  dir: {
    pages: 'app',
  },

  /**
   * Explicit imports everywhere. Architecture boundaries
   * (Page → Hook → Service) must be visible in import statements.
   */
  imports: {
    autoImport: false,
  },
  components: {
    dirs: [],
  },

  css: ['~/app/globals.scss'],

  /**
   * The API is same-origin (`/api`, BVRio Q-B1). In production CloudFront
   * routes `/api/*` to core-bvrio. Locally the App's own `server/api` answers;
   * set API_PROXY_TARGET (e.g. http://localhost:8080) to send `/api/**` to a
   * running Spring service instead — still same origin for the browser.
   */
  routeRules: process.env.API_PROXY_TARGET
    ? { '/api/**': { proxy: `${process.env.API_PROXY_TARGET.replace(/\/$/, '')}/api/**` } }
    : {},

  runtimeConfig: {
    // Server-only. NUXT_MOCK_BFF_ENABLED=false turns /mock-bff/* off.
    mockBff: {
      enabled: true,
    },
    public: {
      // Used for tracking context and manifest lookups.
      appName: 'clients-webapp',
      // NUXT_PUBLIC_MOCK_BFF_BASE_URL — DEV mock of the demo Journeys.
      mockBffBaseUrl: '/mock-bff',
      // NUXT_PUBLIC_FEATURE_FLAGS_<FLAG_NAME>=true|false
      featureFlags: defaultFeatureFlags(),
    },
  },

  // The mark as the tab icon (v0.9.26): the G and its water on the header's blue.
  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  // Development defaults (`nuxt dev` only).
  $development: {
    runtimeConfig: {
      public: {
        featureFlags: { catalogPersonNames: true, contributionForms: true },
      },
    },
  },

  // Equivalent of Next.js `transpilePackages`.
  build: {
    transpile: ['@portal-guanabara/presentation-lake', '@portal-guanabara/journey-manifests'],
  },

  vite: {
    // Pre-bundled up front so the first page load does not trigger a reload.
    optimizeDeps: {
      include: ['@formatjs/intl', 'vue-intl'],
    },
    server: {
      // Equivalent of Next.js `allowedDevOrigins`: Product Identity hostnames
      // served through the local Nginx layer (see dev/nginx).
      allowedHosts: ['portalguanabara.dev.com.br'],
    },
  },

  devtools: { enabled: true },

  typescript: {
    strict: true,
  },
});
