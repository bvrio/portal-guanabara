# Observability Model

Observability consists of distinct mechanisms:

```text
Tracking
Logs
Metrics
Alerts
Traces
Dashboards
```

## Product tracking

Common events may include:

```text
page_viewed
feature_exposure
success
error
empty
```

`empty` should represent a meaningful product state, not a transient internal collection state.

## Technical observability

Logs, metrics, traces, and alerts serve operational/system purposes and must not be substituted for product tracking.

Architectural context should be derived from existing runtime information wherever possible.
