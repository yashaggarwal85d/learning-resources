# Outline: Version garbage collection and long snapshots (`rust.version-garbage-collection-long`)

Chapter 23, topic 61 (third and last of three, closes Chapter 23 and Milestone 4). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Build a real garbage-collection pass over a version chain, driven by the oldest currently open snapshot's own horizon: a superseded version is reclaimable only once its deleting transaction predates every open snapshot.
2. Measure that a real long-lived reader's snapshot genuinely blocks every single reclaim on an identical workload, not only of the one version it reads directly.
3. Measure that, on the identical workload, closing that same reader instead genuinely frees its previously-pinned dead versions for reclaim.
4. Measure that a long-lived reader retains genuinely more versions than a short-lived one, on the identical workload.
5. State, from PostgreSQL's own documentation, the real coupling between VACUUM, the xmin horizon, and a long-running open transaction.

## Changes from the chapter plan

None. All claims are measured directly against a real, deterministic version chain and a real garbage-collection pass built from plain Rust data structures; nothing here needs root access, real file I/O, or hardware the sandbox lacks.

## Reel steps (storyboard)

1. **"A reader opens a snapshot, then a row gets updated four more times while that reader stays open. Does any of those four now-dead versions ever become reclaimable while the reader is still open?"** (predict, hook) — `fig`: one open reader, four further updates. Options: yes, the ones the reader itself never reads / no, not one of them, for as long as the reader stays open (correct) / only the single version the reader doesn't actually use.
2. **"Measured: not one of the four, for as long as that reader stays open"** — `fig`: the real, measured result, every dead version still retained. NO takeaway (this is the reel's own "from" step for the phone swipe test, per `QUALITY.md` #64; the point — a long-lived reader blocks reclaim of everything newer than it, not only what it reads — is stated directly in the step's own body instead).
3. **"That same reader now closes instead, on the identical workload. Do those same four now-dead versions become reclaimable?"** (predict) — `fig`: the reader closing, the identical four updates already applied. Options: no, only the version the reader itself read / yes, genuinely, all of them (correct) / only if a fresh VACUUM pass is run twice.
4. **"Measured: yes, genuinely; closing the reader freed every one of its previously-pinned dead versions"** — `fig`: the real, measured result, the dead versions reclaimed. Takeaway: "A version becomes reclaimable the moment no open snapshot could still need it, and closing a reader is exactly what removes that need."
5. **"Run the identical workload twice: once with that reader staying open the whole time, once with it closing early. Does the long-lived run genuinely retain more versions than the short-lived one?"** (predict) — `fig`: the identical workload, two different reader lifetimes. Options: no, both runs end up retaining the same count / yes, genuinely, the long-lived run retains more (correct) / only if the reader actually reads every version along the way.
6. **"Measured: the long-lived run genuinely retained far more versions than the short-lived run, on the identical workload"** — `fig`: the real, measured counts, compared directly. Takeaway: "One long-running reader turns into a real, measurable storage-growth problem, on a workload that would otherwise stay small."
7. **"PostgreSQL's own documentation states this coupling directly. Does it name finishing a long-running open transaction as something that frees up space VACUUM alone cannot?"** (predict) — `fig`: PostgreSQL's own words on long-running transactions, shown directly. Options: no, VACUUM alone handles it regardless / yes, genuinely; it tells administrators to end those transactions directly (correct) / only for transactions older than a fixed, hard-coded limit.
8. **"Measured, in PostgreSQL's own words: end long-running open transactions directly, since VACUUM alone can't reclaim past them"** — `fig`: PostgreSQL's own words, shown directly. Takeaway: "The real fix for this isn't a smarter VACUUM; it's ending the long-running transaction that's pinning the horizon."
9. **"PostgreSQL's own documentation also names exactly what that horizon is made of: what does a backend's own xmin horizon, visible in its own system view, actually represent?"** — `fig`: PostgreSQL's own words on the xmin horizon, shown directly. NO new predict (continues directly from step seven's own question, to the real system's own name for exactly what this topic's own horizon measures). NO takeaway (a connecting step restating the real system's own words, not a new kind of claim).
10. **Recap** — a version becomes reclaimable only once no open snapshot could still need it, so one long-running reader genuinely blocks every reclaim newer than it, not just what it reads, turning into a real, measurable storage-growth problem that ending the transaction, not a smarter VACUUM, is what actually fixes.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7 (PostgreSQL's own guidance to end long-running transactions directly; step 9 continues from it directly, with no new predict, to the real system's own name for the xmin horizon).
- Surprising fact: step 9 (the real system's own documentation naming exactly what this topic's own measured horizon is).
- Takeaways: steps 4, 6, 8 (three — step 2 deliberately has none, being the reel's own "from" step for the phone swipe test; step 9 deliberately has none too, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| the current backend's xmin horizon (its own value in PostgreSQL's pg_stat_activity view) | PostgreSQL Docs: 27.2.3. pg_stat_activity (quoted) |
| a row version must not be deleted while it is still potentially visible to other transactions | PostgreSQL Docs: 24.1. Routine Vacuuming (quoted) |
| an outdated or deleted row version is no longer of interest to any transaction eventually, and its space must then be reclaimed to avoid unbounded growth of disk space requirements | PostgreSQL Docs: 24.1. Routine Vacuuming (quoted) |
| the standard form of VACUUM removes dead row versions in tables and indexes and marks the space available for future reuse | PostgreSQL Docs: 24.1. Routine Vacuuming (quoted) |
| end long-running open transactions directly, found by checking pg_stat_activity for rows where age(backend_xid) or age(backend_xmin) is large | PostgreSQL Docs: 24.1. Routine Vacuuming (quoted) |
| a long-lived reader's snapshot genuinely blocks every single reclaim on an identical workload, not only of the one version it reads directly | `examples/runtime-demo/src/version_gc_coupled_to_snapshot_lifetime.rs` (executed, measured) |
| closing that same reader instead genuinely frees its previously-pinned dead versions for reclaim, on the identical workload | `examples/runtime-demo/src/version_gc_coupled_to_snapshot_lifetime.rs` (executed, measured) |
| the long-lived reader retains genuinely more versions than the short-lived one, on the identical workload | `examples/runtime-demo/src/version_gc_coupled_to_snapshot_lifetime.rs` (executed, measured) |

## Concept ledger

- `introduces`: `version-gc-coupled-to-snapshot-lifetime` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `snapshot-visibility-version-chain` (topic 59), `isolation-level-permitted-anomaly` (topic 60)
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused: "An isolation level draws the line on which histories are allowed; it says nothing about how long the versions those histories created are allowed to stick around afterward."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "This chapter measured what a storage engine owes a concurrent reader: a consistent version to see, a precise rule on which histories are allowed, and a real cost for every version kept around until nothing could still need it; the next chapter turns to a different layout question entirely, how storing values column by column instead of row by row changes what a scan and a point update each cost."
