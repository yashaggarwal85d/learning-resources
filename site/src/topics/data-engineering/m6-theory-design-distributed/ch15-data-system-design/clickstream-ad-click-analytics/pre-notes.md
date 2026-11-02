- **Clickstream**: the raw sequence of click and view events a client emits. *Where you meet
  it:* the hook.
- **Session**: a group of events closed by a gap of inactivity, not a fixed clock window.
  *Where you meet it:* the session-gap reveal.
- **Collector**: the stateless service that receives events from clients and hands them to the
  log. *Where you meet it:* the pipeline-strip reveal.
- **Event id**: a deterministic identifier carried by each event, used to key idempotent
  upserts. *Where you meet it:* the stream-versus-batch reveal.
- **Bot traffic**: non-human clicks, flagged by a classifier with a real false-positive cost.
  *Where you meet it:* the session-gap reveal.
- **Late event**: an event that arrives after the stream's correction window has already fired.
  *Where you meet it:* the late-event-sliver reveal.
- **Reconciliation**: a scheduled batch recompute from the immutable log that overrides the
  streaming figure. *Where you meet it:* the stream-versus-batch reveal.
- **Billing-grade**: a number precise and auditable enough to invoice on. *Where you meet it:*
  the hook and the stream-versus-batch reveal.
