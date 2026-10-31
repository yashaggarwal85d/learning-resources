# Fact-check: Deduplication keys and idempotent consumers (de.deduplication-idempotent-consumers)

## Claims table

| Claim | Status | Source |
|---|---|---|
| A receiver can be designed to safely receive the same message multiple times (idempotent receiver), via explicit de-duping or idempotent message semantics | Confirmed | Enterprise Integration Patterns |
| Pub/Sub supports exactly-once delivery based on a unique message id, and a redelivery retains the same id | Confirmed | Google Cloud Pub/Sub docs |
| A client-generated idempotency key lets a server recognize retries of the same request | Confirmed | Stripe API reference |
| An idempotency key can be pruned after a bounded TTL (24 hours), after which a reused key is treated as a new request | Confirmed | Stripe API reference |
| A Bloom filter never produces a false negative; it can produce a bounded false-positive rate | Confirmed (measured directly in this topic's own `examples.py`, not cited) | — |
| A deterministic id computed from a derived event's own inputs lets a downstream consumer deduplicate it the same way | Confirmed (direct construction, measured in `examples.py`) | — |

## Red-team

**Predict step 3 (redelivery after the window passes)** — the tempting wrong answer is "yes,
still caught," since the id was genuinely seen before. The whole point of a bounded window is
that it deliberately forgets — `TTLDedupStore._evict_expired` actively removes an id past its
TTL, and the toy run's own `store.process("evt-1", clock=25)` returns `"new"`, not `"duplicate"`,
confirming the window's boundary is enforced, not just assumed.

**Predict step 6 (which direction can a Bloom filter be wrong?)** — the tempting wrong answer is
"it can also miss a real duplicate." A Bloom filter's bit array can only ever gain set bits, never
lose them, so every inserted id's bits are always still set — `bf.might_contain` is unconditionally
true for every id in `inserted`, confirmed by the assert. A false positive (flagging something
never inserted) is the only error direction, confirmed by measuring a nonzero
`false_positive_rate` against ids genuinely never added.

**Toy measurements (`examples.py`)** — `TTLDedupStore`, `TinyBloomFilter`, and
`deterministic_id` are simplified standalone models, not ports of any production dedup system or
of Chapter 5's own Bloom-filter material (used by reference, not reimplemented identically here).
The false-positive rate (~2.5% on 5000 unseen ids against 500 inserted, a 4000-bit array, 4 hash
functions) is this run's own real measurement, not a citation — a different size/hash-count
choice would measure a different rate, which is the whole point of the trade-off being shown.

## Corrections

No single primary source was found naming a "watermark-relative" dedup bound by that exact
phrase; CHAPTER.md's own scope line notes the watermark variant becomes available once a later
chapter topic (watermarks) exists. This topic teaches the watermark bound as the logical
counterpart to a wall-clock TTL bound — same trade-off, different clock — without claiming an
independent citation for the watermark variant specifically; see SOURCES.md's closing note.
