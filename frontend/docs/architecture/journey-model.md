# Journey Model

A Journey is a cohesive product experience and the central unit connecting Frontend and BFF.

A Journey may have:

```text
Pages
Hooks
Services
Presentation patterns
Feature requirements
BFF operations
```

A Journey is not itself an App, Page, endpoint, component, or Domain.

## Frontend

Pages, Hooks and Services are organized inside the App and grouped by User Type context where that classification applies.

## BFF

A BFF exposes consumer-oriented Journey operations.

## Presentation Lake

The Presentation Lake identifies presentation by Journey without needing to know which User Type consumes it.
