# Storyboard: Deduplication keys and idempotent consumers (de.deduplication-idempotent-consumers)

10 steps. Covers event ids assigned once at the source, a dedup window bounded by TTL or
watermark, approximate dedup with a real measured Bloom filter, and deterministic ids for derived
events propagating dedup through a second stage. No lab leg of its own, per CHAPTER.md.

1. **Hook** — a consumer remembering every event id forever runs out of memory; a TTL-bounded
   window with a Bloom filter underneath holds memory flat, at a small measured cost.
2. **Setup** — a deterministic id made one specific kind of write idempotent; this topic
   generalizes it to any consumer, with no transaction and no special sink.
3. **Predict** — a redelivery of the exact same event id arrives, but after the dedup window has
   already passed. Does the consumer still catch it as a duplicate?
4. **Reveal** — no: a bounded window forgets old ids on purpose, trading unlimited memory for a
   stated, accepted gap — a redelivery that old is no longer deduplicated.
5. **Reveal** — the same pattern names two bound choices: wall-clock TTL (Stripe's own 24-hour
   idempotency-key pruning) or a stream-relative watermark bound, the same trade-off either way.
6. **Predict** — a Bloom filter says an id "might be present." Can that ever be wrong, and in
   which direction?
7. **Reveal** — only one direction: a Bloom filter never misses an id that was actually inserted,
   but can occasionally flag a genuinely new id as a duplicate — a real, measured, bounded rate.
8. **Reveal** — a derived event given a deterministic id (computed from its own inputs) lets the
   next consumer downstream deduplicate it exactly the way the first stage deduplicates raw
   events — propagating idempotence one hop further.
9. **Prove it** — the toy run: a redelivery caught inside the window and missed outside it, the
   Bloom filter's real false-positive rate on 5000 unseen ids, and a derived id recomputed
   identically and caught by a downstream store.
10. **Recap** — source-assigned event ids, a bounded dedup window, a Bloom filter's one-directional
    error, and deterministic ids propagating dedup downstream.

Prerequisites panel (CHAPTER.md): topics 10, 12, Chapter 5 §5.6 (Before this). Bridge from topic
12's handoff; handoff into topic 14 (dead-letter and retry topics).
