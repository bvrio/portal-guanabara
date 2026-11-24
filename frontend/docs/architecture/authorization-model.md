# Authorization Model

## Core model

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

## User Types

```text
Interested
Holder
Partner
Backoffice
Engineer
```

User Types identify broad product classifications.

## Capabilities

Capabilities are business-defined classifications or qualifications.

Examples:

```text
accreditation-partner
captation-partner
negotiation-partner
holder-premium
holder-diamond
buyer-3p
```

## Feature Management

The Frontend asks for Feature Management for a Journey.

The BFF derives User Type and Capabilities from authenticated context and resolves the Journey Manifest access requirements.

The Frontend consumes the resulting decisions.

## Feature Flags

Feature Flags remain separate temporary engineering controls in the Frontend monorepo.

## In Portal Guanabara today

- Access requirements are declared in the Journey Manifests (`docs/architecture/journey-manifest.md`).
- The mock BFF (`apps/clients-webapp/server`) derives the authorization context from its session cookie and resolves decisions with the same rules a real BFF must follow.
- Seeded personas (password `teste1234`):

| E-mail | User Type | Capabilities |
|---|---|---|
| `interessado@teste.com` | interested | — |
| `titular@teste.com` | holder | — |
| `premium@teste.com` | holder | holder-premium |

In DEV the toolbar (bottom-left) switches persona without logging in again.
