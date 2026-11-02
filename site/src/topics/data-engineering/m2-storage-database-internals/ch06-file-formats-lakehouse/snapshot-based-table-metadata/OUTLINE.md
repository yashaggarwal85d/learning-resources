# Outline — de.snapshot-based-table-metadata

10-step storyboard. Predicts at steps 2 and 5. Takeaways at steps 4, 7, 9 (never on the step
right after a predict: steps 3 and 6 are reveals).

1. **Hook** — topic 11 broke a directory listing as table state. This topic is the fix: an
   explicit, immutable snapshot plus one pointer.
2. **Predict: if a snapshot is immutable, how does a table ever change?** — options: a new
   snapshot is written and the pointer moves / the existing snapshot file is edited in place.
3. **Reveal: a snapshot is a whole, self-contained file list** — Iceberg's own definition: a
   snapshot is the complete set of data files at some point in time, reused manifests aside.
4. **Reveal: the commit is one atomic pointer swap, not a directory listing** — Iceberg's own
   "atomic swap of one table metadata file for another." Takeaway: a table version is a fact
   written once, never edited — the pointer, not the listing, says what's current.
5. **Predict: can a reader pinned to an old snapshot ever see a concurrent commit's files?** —
   options: no, the pinned snapshot never changes / yes, if the commit lands while it's reading.
6. **Reveal: reproduced for real — a pinned reader is provably unaffected** — the real demo: a
   reader's pinned snapshot file read twice, before and after a second writer's commit, identical
   both times, directly undoing topic 11's reproduced partial read.
7. **Reveal: the commit protocol is optimistic — and that's Iceberg's own word for it** —
   writers stage files, then race to swap the pointer; the loser just finds it's moved. Takeaway:
   optimistic concurrency means writers never block each other to write — only to commit.
8. **Reveal: reproduced for real — exactly one of two racing writers wins** — the real
   compare-and-swap demo: two writers try to claim the same version slot; one wins, one gets a
   real error and retries against the new base.
9. **Reveal: Delta's own protocol describes the identical shape** — a serial history of atomic,
   monotonically increasing versions, readers using the transaction log, not a listing. Takeaway:
   Iceberg and Delta reach the same design from the same problem — an explicit, versioned history
   beats a directory listing every time.
10. **Recap** — a snapshot is immutable, a commit is one atomic pointer swap, and optimistic
    concurrency lets exactly one of two racing writers win without ever blocking a reader.
