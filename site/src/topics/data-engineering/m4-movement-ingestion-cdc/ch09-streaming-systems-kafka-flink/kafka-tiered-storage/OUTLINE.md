# Storyboard: Kafka tiered storage (de.kafka-tiered-storage)

10 steps, matching CHAPTER.md's hook/visual idea.

1. **Hook** — a compliance team wants two years of retained events at broker-disk prices; the bill
   is absurd. Tiering closed segments to object storage keeps the same two years readable at a
   fraction of the cost.
2. **Setup** — the partition strip with a boundary: segments to the left (older) drawn as remote
   (object storage), to the right (newer) as local disk.
3. **Predict** — does a segment wait for local retention to expire before it's copied to remote,
   or does copying start the moment it rolls?
4. **Reveal** — copying starts the moment a segment rolls (RLM leader task), independent of local
   retention; local retention only controls when the *local* copy is deleted afterward.
5. **Predict** — can a consumer tell, from the read API alone, whether an offset came from local
   disk or from object storage?
6. **Reveal** — no: the fetch API is identical either way; only the latency differs, measured.
7. **Reveal** — local retention and total retention are two independent knobs: local bounds local
   disk time, total bounds how long the data exists anywhere.
8. **Reveal** — compacted topics can't be tiered: compaction rewrites segments in place, which
   breaks the remote copy's immutability assumption RLM depends on.
9. **Prove it** — the toy run: segment placement, read-path cost comparison, and the
   compacted-topic rejection, all from this topic's own `examples.py`.
10. **Recap** — closed segments move to cheap storage automatically; local/total retention are
    independent; reads are transparent but not free; compaction and tiering don't mix.

Prerequisites panel (CHAPTER.md): topics 1, 6, 7. Bridge from topic 7's handoff; handoff into
topic 9 (delivery semantics).
