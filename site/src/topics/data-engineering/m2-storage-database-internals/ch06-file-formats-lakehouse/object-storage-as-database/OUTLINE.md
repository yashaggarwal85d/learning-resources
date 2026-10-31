# Outline — de.object-storage-as-database

1. **Hook.** A single immutable file, Parquet or ORC, still can't answer what "a table" means
   once the storage underneath has no file you can edit in place.
2. **Predict: does S3 still make you wait after a write before a read sees it?**
3. **Reveal: strong read-after-write consistency, since December 2020** — a write's success
   response means any later read (or list) sees it immediately, no wait, no stale read.
4. **Reveal: no atomic rename, for real** — a real copy-then-delete against a live local
   S3-compatible server, stopped after the copy: both the original and the copy exist at once.
5. **Predict: can two writers racing for the same key both "win"?**
6. **Reveal: a real conditional write (If-None-Match: \*) against the same server** — writer A's
   create commits; writer B's conflicting create is rejected with a real 412 Precondition
   Failed, not a simulated one.
7. **Reveal: If-Match is the update side of the same primitive** — a compare-and-swap on the
   current ETag, with a stale-ETag update rejected the same way.
8. **Reveal: LIST isn't free** — a real paginated listing of 250 objects takes 5 separate round
   trips at 50 keys per page, and per-prefix request-rate limits cap how fast those round trips
   can go.
9. **Reveal: what this buys — atomic commits with no external coordinator.** Conditional writes
   turn "whoever writes last wins" into "exactly one writer's commit survives," entirely inside
   object storage's own API.
10. **Recap.**

Predicts at steps 2 and 5 (same early/mid-reel pattern as topics 8 and 9). Takeaways at steps 4,
7, 9 — none immediately after a predict step (3 and 6 are reveals with no takeaway tag, since
they come right after steps 2 and 5's predicts).
