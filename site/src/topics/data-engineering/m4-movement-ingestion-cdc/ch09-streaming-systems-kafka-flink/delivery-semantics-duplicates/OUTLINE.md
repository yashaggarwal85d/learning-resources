# Storyboard: Delivery semantics and where duplicates arise (de.delivery-semantics-duplicates)

10 steps, matching CHAPTER.md's hook (two engineers arguing over "exactly-once", a live toy
simulation showing both crash windows producing real duplicates).

1. **Hook** — two engineers argue whether their pipeline is "exactly-once"; neither can name which
   of two crash windows they've actually closed. A toy run shows both producing real duplicates.
2. **Setup** — three semantics stated as promises about the *effect*, not about delivery attempts.
3. **Predict** — a producer sends a batch, the ack is lost on the way back. What happens next,
   without idempotence?
4. **Reveal** — the producer, seeing no ack, retries; without idempotence, the retry duplicates
   the write.
5. **Predict** — a consumer processes a record and crashes before committing its offset. What
   happens on restart?
6. **Reveal** — on restart it reprocesses the same record, duplicating the downstream effect
   unless that effect is itself idempotent.
7. **Reveal** — "my broker is exactly-once" is incomplete: the broker alone can't make a whole
   pipeline exactly-once if the sink isn't idempotent or transactional.
8. **Reveal** — effect-count framing: at-most-once can drop to zero, at-least-once can double up,
   exactly-once always lands at one, even across a crash.
9. **Prove it** — the toy run: both crash windows and the effect-count table, from this topic's
   own `examples.py`.
10. **Recap** — three semantics, two crash windows, and why "exactly-once" is an end-to-end claim,
    not a broker feature.

Prerequisites panel (CHAPTER.md): topics 2, 5, 8. Bridge from topic 8's handoff; handoff into
topic 10 (idempotent producer, the first of the fixes).
