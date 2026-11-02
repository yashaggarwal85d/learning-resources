- **Duplicate (event)**: the same event delivered more than once — assumed vocabulary this topic
  doesn't re-derive the delivery mechanics of. *Where you meet it:* named in the predict's own
  framing.
- **Late event**: an event that arrives after the result it belongs to was already published.
  *Where you meet it:* the watermark reveal.
- **Watermark**: a heuristic assertion that input is complete up to some point in time — not a
  guarantee. *Where you meet it:* the watermark reveal.
- **Replay**: re-running a pipeline from an earlier point in its own retained history. *Where you
  meet it:* the hook and the replayed-twice reveal.
- **Idempotent (write)**: a write keyed so that repeating it has no further effect beyond doing
  it once. *Where you meet it:* the deterministic-and-idempotent reveal.
- **Deterministic (transform)**: a transform whose output depends only on its input, never on
  wall-clock time or arrival order. *Where you meet it:* the deterministic-and-idempotent reveal.
