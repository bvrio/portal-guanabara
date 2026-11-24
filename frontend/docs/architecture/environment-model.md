# Environment Model

The platform distinguishes three environments.

```text
DEV    → individual local development
CONST  → Construction: collaborative integration and validation
PROD   → controlled production release
```

## Product-oriented URLs

The URL identifies the Product Identity and environment, while the path identifies the Journey and Page.

```text
DEV    http://<product>.dev.com.br/<journey>
CONST  https://<product>.cons.com.br/<journey>
PROD   https://<product>.com.br/<journey>
```

Persona-specific Product Identities may use an additional label:

```text
DEV    http://<product>.<persona>.dev.com.br/<journey>
CONST  https://<product>.<persona>.cons.com.br/<journey>
PROD   https://<product>.<persona>.com.br/<journey>
```

Portal Guanabara DEV identities:

```text
portalguanabara.dev.com.br             → clients-webapp
portalguanabara.parceiros.dev.com.br   → partners-webapp   (planned)
portalguanabara.operacao.dev.com.br    → backoffice-webapp (planned)
```

Product Identity is intentionally distinct from App. A single App may have a public Product Identity whose business name does not match the technical App name.

## DEV

DEV is local and isolated to the developer. It may use local Web Apps, local BFFs, mocks and local development services.

## CONST

CONST means Construction.

```text
PR → review → merge → Construction pipeline → CONST deployment → collaborative validation
```

CONST makes integrated engineering changes easy to validate across Frontend, BFF and Backend.

## PROD

PROD is a controlled release environment. Normal product changes flow through the established release process; emergency changes may use an explicitly governed exception path.

## Local ports

Ports are implementation details and must remain deterministic:

```text
clients-webapp      3000
partners-webapp     3001
backoffice-webapp   3002
```

Nginx maps product-oriented DEV hostnames to these local ports. The port must never become part of the product's canonical route or tracking identity.

## Nuxt runtime

`nuxt build` produces a Node server in `.output/` (Nitro). Deployment targets (Node server, container, serverless preset) are a delivery-infrastructure decision and are configured through Nitro presets, not through application code.
