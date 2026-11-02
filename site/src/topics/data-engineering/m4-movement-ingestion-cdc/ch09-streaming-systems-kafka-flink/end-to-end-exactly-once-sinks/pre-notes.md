- **Two-phase commit**: a protocol that stages a write durably before finalizing it, so the
  finalize step can always succeed. *Where you meet it:* the setup, and the crash predict/reveal.
- **Pre-commit**: the staging step — the data is durable but not yet visible to anyone reading
  the sink. *Where you meet it:* the crash predict/reveal.
- **Idempotent upsert**: a write keyed by an id derived from the data itself, so a retry
  overwrites instead of duplicating. *Where you meet it:* the upsert reveal.
- **Deterministic id**: an id computed the same way every time from the same input, not a
  counter. *Where you meet it:* the upsert reveal.
- **Side effect**: an action outside any database or transaction — an email, an API call — that
  nothing can roll back. *Where you meet it:* the breaks predict/reveal.
- **Transaction timeout**: how long a sink's broker-side transaction stays open before it is
  expired and aborted. *Where you meet it:* the hook, and the breaks reveal.
