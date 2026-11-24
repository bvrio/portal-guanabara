# Journey Manifests

Declarative Journey contracts for Portal Guanabara. Read `AGENTS.md` first.

```ts
import { userManifest, type FeatureKeyOf } from '@portal-guanabara/journey-manifests';

type UserFeature = FeatureKeyOf<typeof userManifest>;
// 'user.profile-details' | 'user.profile-edit' | 'user.change-password' | ...
```

## Manifests

| Journey | Access | Pages (clients-webapp) | Features |
|---|---|---|---|
| About (v0.8) | public | overview (`/about`) | testimonial, team, funding |
| Authentication | public | login, registration, reset-password | login, registration, password-reset |
| Catalog | public | list (`/catalog`), details (`/catalog/:id`) | search, entry-details, person-names |
| Home | public | home (`/`) | guided-tour, catalog-summary, catalog-sectors, catalog-distributions, catalog-highlights, catalog-drawer (`journey-shortcuts` removed in v0.8) |
| Institutions | public | list (`/institutions`) | directory, drawer, logos |
| Map | public | explore (`/map`) | municipalities, sectors (v0.8), drawer |
| User | authenticated · interested, holder | overview, details, management | profile-details, profile-edit, change-password, communication-preferences (holder), premium-benefits (holder-premium / holder-diamond) |

## Adding a Journey

1. Create `src/journeys/<key>.manifest.ts` with `defineJourneyManifest({...})`.
2. Register it in `journeyManifests` (`src/index.ts`).
3. Create the route files and Page implementations the manifest declares.
4. Run `pnpm architecture:validate` — it fails until manifest and filesystem agree.
