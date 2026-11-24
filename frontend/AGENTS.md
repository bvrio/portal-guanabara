# Root Architectural Contract — Portal Guanabara

## Purpose

This document defines the product architecture, ownership boundaries, and cross-system rules of the repository.

It is the root contract for humans and coding agents. Area-specific contracts define implementation rules for Frontend, BFF, and Backend.

When a local contract and this document appear to conflict, the local contract may refine implementation details but must not contradict the product-level boundaries defined here.

---

# 0. Current scope (BVRio decision, November 2026)

The architecture below was written for several Apps, a BFF per consumer context and logins. For now BVRio decided on a smaller product, and these scope rules take precedence where the sections below mention what does not exist:

```text
One App        clients-webapp (public web app, Nuxt 4). The other Apps are out of scope.
No BFF         The App's own server routes (apps/clients-webapp/server/api) are its consumer-facing API.
Domain         packages/catalog-domain: workbook importer + read services (Core v2.0 database document).
No logins      Core v2.0 D-042. Authentication and User stay as demo Journeys on a DEV mock backend
               until BVRio answers whether to remove them (questionnaire Q20).
```

Read "BFF" below as "the App's server routes" for the Catalog, and as "the DEV mock backend" for the demo Journeys. Data access without a BFF, and everything else still open, is tracked in `docs/architecture/no-bff.md` and in the questions sent to BVRio. Reintroducing an App or a BFF is an architecture change to this section, not a feature task.

---

# 1. Product Architecture

The platform is organized around four primary concepts:

```text
App
  ↓
Journey
  ↓
Feature
  ↓
Page
```

An **App** defines a major product or operational surface.

A **Journey** defines a cohesive user or operational experience.

A **Feature** defines a meaningful capability usage on the product within a Journey.

A **Page** represents a concrete user-facing experience.

A Journey is the central organizational unit connecting the Frontend and its consumer-facing BFF experience.

A Journey is not merely a Page, route, endpoint, component, database entity, or App.

---

# 2. Domain Architecture

A **Domain** is a business ownership boundary and source-of-truth concern.

The Backend owns the authoritative business rules and source-of-truth data for Domains.

A BFF may contain consumer-facing application behavior and BFF-owned concepts, but it must not become the authoritative owner of business rules that belong to a Backend Domain.

Therefore:

```text
Journey
├── Frontend implementation
└── BFF implementation

Domain
├── BFF-facing adaptation / orchestration
└── Backend source of truth
```

The implementation details of these worlds are defined by their respective local contracts.

---

# 3. Applications

The defined Frontend applications are:

```text
Web
├── clients-webapp
├── partners-webapp
└── backoffice-webapp

Mobile
├── clients-app
└── partners-app
```

Bootstrap status (Portal Guanabara v0.3):

```text
clients-webapp      → bootstrapped (Nuxt 4) — the only App in scope
partners-webapp     → out of scope (BVRio, November 2026)
backoffice-webapp   → out of scope
clients-app         → out of scope
partners-app        → out of scope
```

Out-of-scope Apps keep their names and contracts in case they return (§0); they are not created and `pnpm architecture:validate` no longer reports them as pending.

Applications are stable product or operational boundaries.

Do not create a new App merely because a new Journey, Feature, Capability, User Type, permission, or workflow is introduced.

A new App requires an architectural decision that an existing App cannot represent the required major interaction surface.

User Types must not be modeled as one-App-per-user-type.

---

# 4. User Types and Capabilities

A User Type identifies a broad product classification.

Current User Types are:

```text
Interested
Holder
Partner
Backoffice
Engineer
```

A **Capability** is a business-defined subgroup, qualification, or authorization classification within the user's broader context.

Examples:

```text
partner
├── accreditation-partner
├── captation-partner
└── negotiation-partner

holder
├── holder-premium
└── holder-diamond

buyer
└── buyer-3p
```

Do not introduce a generic `Role` abstraction merely to represent these concepts.

Capabilities are part of the authorization model. They are not Feature Flags and are not UI concepts.

---

# 5. Authorization

Authorization determines what an authenticated user may access within an App.

The conceptual flow is:

```text
Authenticated User
      ↓
User Type
      ↓
Capabilities
      ↓
Journey access
      ↓
Feature access
```

Journey access and Feature access are related but distinct.

A user may have access to a Journey while only having access to a subset of its Features.

The BFF is authoritative for authorization decisions relevant to its consumer context.

The Frontend must not reconstruct or invent authorization rules from login data.

---

# 6. Journey Manifest

A Journey Manifest is a declarative contract describing a Journey's structure and access requirements.

At minimum it relates:

```text
Journey
  ↓
Pages
  ↓
Features
  ↓
Access requirements
```

The manifest may also carry ownership and other architecture-approved metadata.

The manifest is intended to serve as structured context for:

```text
Product
Engineering
Runtime
CI
Documentation
Coding Agents
```

The schema is owned by the architecture contracts and must not be invented independently by a feature implementation.

In Portal Guanabara the manifests live in `packages/journey-manifests` (schema version 1, `src/schema.ts`), one file per Journey. They are consumed by the DEV mock backend (Feature Management of the demo Journeys), the Apps (routes with `:param` segments, tracking context, typed Feature keys) and CI (`pnpm architecture:validate`). See `docs/architecture/journey-manifest.md`.

---

# 7. Feature Management

Feature Management resolves declarative Journey and Feature access requirements against the authenticated authorization context.

The Frontend requests the relevant Journey context.

Conceptually:

```text
Frontend
  │ journey = X
  ▼
Relevant BFF
  │
  ├── authenticated context
  ├── User Type
  └── Capabilities
       ↓
Feature Management
       ↓
Journey access + Feature access
       ↓
Frontend decision consumer
```

The Frontend should not send its own Capability as an authority claim.

The BFF derives User Type and Capabilities from the authenticated context available to it.

Feature Management is an experience/access decision.

Actual operation authorization remains enforced by the appropriate BFF/Backend boundaries.

---

# 8. Feature Flags

Feature Flags are temporary engineering and rollout controls.

They are not authorization and must not be modeled as Capabilities.

For the current architecture, frontend Feature Flags live in the Frontend monorepo and must not be propagated to a BFF merely to control frontend rollout.

Do not use Feature Management as an indirect Feature Flag system.

When a user group temporarily must lose access to a Feature for operational reasons, change the declarative access requirement instead of introducing a Feature Flag.

When a new implementation needs temporary rollout control, use a Feature Flag.

---

# 9. Shared Architecture

Shared means deliberate semantic reuse, not generic convenience.

A capability belongs in Shared when it has a meaningful cross-boundary ownership and reuse contract.

Do not create Shared abstractions merely because code is technically reusable.

An equivalent shared semantic responsibility must have one shared implementation.

A genuinely different semantic requirement may begin in its owning architectural area and be promoted to Shared only when cross-Journey reuse is demonstrated.

---

# 10. Ownership

Teams own Journeys.

Apps own the interaction surface in which those Journeys are consumed.

A Journey-owning team may contribute to multiple Apps because the same Journey can be consumed across different interaction surfaces.

Ownership should eventually be represented explicitly in Journey metadata and can later drive repository review automation such as CODEOWNERS or equivalent mechanisms.

Ownership metadata must describe responsibility, not duplicate the dependency graph.

---

# 11. Observability

Observability is cross-cutting and includes:

```text
Tracking
Logs
Metrics
Alerts
Traces
Dashboards
```

These mechanisms have distinct purposes and must not be conflated.

Common product events may include:

```text
page_viewed
feature_exposure
success
error
empty
```

`empty` should be emitted only when the empty result is product-meaningful, not merely whenever an internal collection is temporarily empty.

The architectural context should be derived from existing runtime context whenever possible rather than duplicated manually.

---

# 12. Mobile

Mobile Apps consume the same Journey ecosystem as the Web Apps.

The current mobile strategy is:

```text
clients-app
partners-app
```

The initial mobile architecture may use a native Home and Journey-specific WebViews.

Journey navigation may move between WebViews.

When navigating away from a Journey with unsaved local changes, the user must be warned that those changes will be lost before navigation continues.

Mobile navigation must remain Journey-aware rather than allowing arbitrary uncontrolled WebView-to-URL transitions.

Detailed implementation belongs in the Frontend contract.

---

# 13. Dependency Boundaries

The root dependency principles are:

```text
Frontend
    ≠
Business source of truth

BFF
    ≠
Backend Domain implementation

Backend Domain
    ≠
Client-specific implementation

Journey
    ≠
Another Journey's private implementation
```

Communication between architectural worlds must happen through explicit contracts.

A repository containing multiple architectural worlds does not erase their boundaries.

---

# 14. Agent Governance

The root contract defines product architecture and cross-system boundaries.

Agents must read the most specific applicable contract before changing code.

```text
Root AGENTS.md
      ↓
Area AGENTS.md
      ↓
Local AGENTS.md
      ↓
Code / Manifest / Storybook / Tests
```

Agents must not invent missing architecture silently.

When an implementation requirement conflicts with the current contract, stop and propose the smallest architectural change required.

Architecture changes require explicit review.

---

# 15. Environment Model

The repository recognizes three environments:

```text
DEV
→ local individual development

CONST
→ Construction: collaborative integration and validation

PROD
→ controlled production release
```

Product-oriented hostnames may differ by Product Identity and persona, but the environment convention remains:

```text
<product>.<persona>.dev.com.br
<product>.<persona>.cons.com.br
<product>.<persona>.com.br
```

The exact Product Identity is business-owned and is intentionally distinct from technical App names.

For Portal Guanabara the current DEV Product Identities are:

```text
portalguanabara.dev.com.br             → clients-webapp
portalguanabara.parceiros.dev.com.br   → partners-webapp   (planned)
portalguanabara.operacao.dev.com.br    → backoffice-webapp (planned)
```

Detailed implementation belongs to the Frontend and delivery infrastructure contracts.

---

# 16. Final Principles

```text
Apps define major interaction surfaces.

Journeys define cohesive product experiences.

Teams own Journeys.

Domains define business ownership and source of truth.

The Frontend implements user experience.

The BFF provides consumer-oriented APIs and resolves experience context.

The Backend owns authoritative business behavior.

User Types describe broad user classifications.

Capabilities describe business-defined authorization classifications.

Feature Management resolves experience access.

Feature Flags control temporary implementation rollout.

Shared is deliberate semantic reuse.

Architecture is enforced by tooling wherever practical.

AI operates inside the architecture and does not invent a new one.
```
