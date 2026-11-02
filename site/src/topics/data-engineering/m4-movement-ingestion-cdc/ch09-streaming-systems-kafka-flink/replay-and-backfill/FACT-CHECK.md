# Fact-check — Replay and backfill

| Claim | Source | Status |
|---|---|---|
| `offsetsForTimes` returns the earliest offset whose timestamp is ≥ the target timestamp | KafkaConsumer 4.4.0 Javadoc | Confirmed, quoted verbatim |
| A partition before message format 0.10.0 (no timestamps) returns null from `offsetsForTimes` | KafkaConsumer 4.4.0 Javadoc | Confirmed, quoted verbatim |
| `seek` overrides the fetch offset used on the next `poll`, and repeated calls use the latest | KafkaConsumer 4.4.0 Javadoc | Confirmed, quoted verbatim |
| A replay can be scoped to one partition or a bounded time range | CHAPTER.md's own scope line; modeled directly in `examples.py`'s `ScopedReplay` | Confirmed by the toy model's own real run |
| Data aged out of the hot log may still be in tiered storage (topic 8) within total retention, or must come from the lakehouse otherwise | CHAPTER.md; topic 8's own already-sourced tiered-storage material (used by name) | Confirmed by topic 8's prior sourcing; modeled in `examples.py`'s `BackfillSourceChooser` |
| An idempotent sink or a versioned output makes a replay safe to run twice | CHAPTER.md; topics 12/13's own already-sourced idempotent-sink/dedup machinery (used by name); Stripe idempotency docs (secondary, general pattern) | Confirmed by topics 12/13's prior sourcing and this topic's own `VersionedSink` model |
| A replayed record's external side effect can be suppressed via a flag the downstream consumer checks | CHAPTER.md's own scope line; modeled in `examples.py`'s `SideEffectGatedConsumer` | Confirmed by the toy model's own real run |

## Red-team

- **Is `offsetsForTimes` actually the mechanism, or is this conflating it with a raw offset
  reset?** No — the javadoc explicitly separates `offsetsForTimes` (timestamp → offset lookup)
  from `seek` (applying an offset). The reel teaches both: look up the offset by time, then seek
  to it, matching the real two-step API.
- **Does "versioned output" mean something more specific in a real lakehouse (e.g. table
  versioning, time travel)?** The reel teaches the general pattern (a new, separately labeled
  output rather than an overwrite) without claiming a specific table-format mechanism (Delta/
  Iceberg time travel), since CHAPTER.md's scope line doesn't name one for this topic.
- **Is the Stripe idempotency quote being overclaimed as a Kafka mechanism?** No — SOURCES.md
  discloses it explicitly as a secondary, general-pattern source, not a Kafka API reference.

## Corrections

None. All claims trace either to this topic's own two primary sources (Kafka 4.4 Javadoc) or to
already-sourced material from topics 8, 12, and 13, named rather than re-cited per CHAPTER.md's
own "Leaves out" note.
