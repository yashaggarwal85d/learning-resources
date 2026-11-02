# OUTLINE: Concurrent-writer lakehouse with time travel (`de.concurrent-writer-lakehouse-time`)

## Learning outcomes
1. Design a multi-writer lakehouse for the shop (CDC merge, nightly backfill, compaction, a
   schema migration) with an SLO set, a partition-writers plan that keeps the conflict rate low,
   and a retry-and-fail policy per writer.
2. State a schema-evolution policy and a snapshot-retention policy that reconciles audit with
   erasure, and a maintenance schedule.
3. Simulate the conflict rate under two writer layouts.
4. State the next bottleneck at ten times.

## Engagement arc
- Hook: step 1 (the compaction job and the CDC merge rewrite the same partitions and collide
  every few nights; separately, an auditor's fourteen-month-old request hits a snapshot expired
  at a fixed retention for an erasure policy).
- Predict: step 2, within the first four steps (the writer-partition plan, and the retention
  class and tag).
- Takeaways: step 4 (every commit is one atomic swap of a single pointer), step 6 (a retention
  policy and a legal-hold tag coexist without changing each other), step 8 (maintenance is a
  writer too, and it can starve the writers it's supposed to help).
- Recap: step 9. Prove it: step 10.

## Steps (storyboard)

### 1. Hook
- **fig:** the compaction job and the CDC merge both rewrite the same partitions and collide
  with a commit conflict every few nights; separately, an auditor's request for a fourteen-month-old
  table state hits a snapshot already expired at a fixed retention window.
- **On screen:** a conflict marker recurring every few nights; an expired snapshot an auditor needed.

### 2. Predict
- **fig:** which one design decision, taken once, would have made both of these non-events?
- **Options:** (a) a faster retry loop on every writer, so conflicts simply resolve themselves
  before anyone notices [wrong — retries don't make conflicting writers touch different files,
  they just repeat the collision until one gives up]; (b) a writer-partition plan that keeps
  conflicting writers on disjoint files, plus a retention class and a tag for the snapshot the
  audit needed [correct].

### 3. Reveal — every commit is one atomic swap
- **fig:** three writer lanes (CDC merge, backfill, compaction), each ending in an attempt to
  swap the same single metadata pointer; a swap either lands or it doesn't.
- **Moves:** the three lanes converge on one pointer; a successful swap flashes, a failed one holds.

### 4. Reveal — partition writers so conflicts are rare
- **fig:** the CDC merge and the compaction job both touch the same partitions, colliding; a
  re-layout moves one of them onto disjoint partitions, and the collision marker vanishes.
- **takeaway:** "Every commit is one atomic swap of a single pointer — writers succeed, retry, or fail by whether they touched the same files."

### 5. Reveal — schema evolution as a written decision
- **fig:** a column added by one writer under a stated review gate, absorbed by every other
  writer still running the old schema, rather than breaking on the next commit it makes.
- **Narrator's line of thought:** she treats "who may change the schema, and under which review"
  as a decision that has to be written down, not a default every writer quietly assumes.

### 6. Reveal — the retention-and-audit collision
- **fig:** a snapshot chain with an expiry line sweeping in from the left; a legal-hold tag
  pins one snapshot, which survives the sweep while every other snapshot around it expires.
- **takeaway:** "A retention policy and a legal-hold tag coexist without changing each other — the tag survives expiry; the policy still runs on everything else."

### 7. Reveal — maintenance is a writer too
- **fig:** compaction, snapshot expiry, and orphan-file removal each shown as a lane converging
  on the same pointer as the ingest writers, not as background housekeeping outside the picture.
- **Narrator's line of thought:** she treats a maintenance job that starves ingest as a design
  failure, not an acceptable cost of keeping the table tidy.

### 8. Reveal — scheduling maintenance against ingest
- **fig:** a maintenance schedule sized against the file-count growth of the CDC stream,
  timed so a compaction run never overlaps the ingest writers it would otherwise starve.
- **takeaway:** "Maintenance is a writer too, and scheduling it against the writers it serves is the design decision, not an afterthought."

### 9. Recap
- **fig:** the atomic-swap commit protocol, the partition-writers plan with its conflict drop,
  the schema-evolution policy, the retention-and-tag collision resolved, and the maintenance
  schedule, side by side.

### 10. Prove it
- **fig:** a new writer joins the table — a second CDC connector backfilling a different
  region's orders — on the same partitions the existing compaction job already uses.
- **predict options:** (a) let it run and see whether conflicts actually happen before changing
  anything, since adding writers doesn't guarantee a collision [wrong — the design's own method
  is to check the partition overlap before a new writer ships, not to wait for a conflict in
  production to find out]; (b) check this new writer's partition overlap against every existing
  writer before it ships, using the same disjoint-partitioning check this topic already applied
  [correct].

## Post-notes headings
- **Internals:** none claimed independently — the commit protocols, snapshot structures, catalog
  implementations and maintenance procedures (Chapter 6 §6.3) are each named only as a choice
  pointing to its home chapter; erasure itself is Chapter 13 topic 9's; the optimistic-versus-
  pessimistic concurrency theory is Chapter 5 topic 15's; the CDC merge itself is topic 14's.
- **Lab:** none of its own; the writer-conflict simulation (conflict rate for overlapping versus
  disjoint partition layouts, with a retry policy) and the retention-cost estimate for a pinned
  history are this topic's executable evidence.
- **Production:** the hook's own recurring-commit-conflict and expired-audit-snapshot scenario
  as the concrete shape "one decision, taken once, prevents both" takes in practice.
- **Frontier:** none claimed — optimistic concurrency via atomic metadata swap and tag-based
  retention are established lakehouse practice (Iceberg and Delta both ship them), not an
  emerging technique.
- **Where this goes next:** one of those writers is about to be the biggest the table has seen:
  a reprocessing of five years of history. It must not break the production readers, starve the
  live ingest, or leave the table half-rewritten if it dies. The next design is a resumable
  multi-terabyte historical backfill.

## Concept ledger
- **Introduces:** `multi-writer-lakehouse-design`, `partition-writers-to-avoid-conflicts`,
  `snapshot-retention-audit-vs-erasure`, `maintenance-as-conflicting-writer`.
- **Uses:** the method concepts as in topic 12 (`ask-to-slo-translation`,
  `capacity-estimate-chain`, `littles-law-inflight-sizing`, `data-flow-shape-decision`,
  `layout-from-dominant-access-path`, `engine-choice-by-state-latency-skill`,
  `correction-window-late-data`, `replay-backfill-as-first-class-path`,
  `failure-table-blast-radius`, `cost-waterfall-dominant-lever`, `three-alternatives-with-costs`,
  `ten-x-next-bottleneck`), plus `occ-vs-pcc`, `snapshot-isolation` and `serializability-2pl-ssi`
  (Chapter 5), `data-contract-specification`, `open-data-contract-standard`,
  `cdc-lakehouse-design` and `merge-stall-to-slot-growth-interaction` (topic 14) — all confirmed
  live via `grep` on `introduces` arrays across `registry.ts`.
- **Declared:** `table-commit-as-cas`, `zookeeper-etcd-guarantees` and
  `strict-serializability-definition` (Chapter 14, not yet planned or built —
  `table-commit-as-cas` is the same placeholder id topic 14 already introduced for this exact
  gap), `erasure-vs-time-travel-snapshot-expiry` and `delete-files-until-compaction` (Chapter 13,
  same placeholder ids topics 13/14 already introduced), `erasure-proof-retention-as-code`
  (Chapter 13, not yet planned or built).

## Changes from the chapter plan
`CHAPTER.md` names Chapter 5, 6, 11, 13 and 14 ids for `uses`/`declared`. Checked each via
`grep` on `introduces` arrays: Chapter 5's concurrency-theory ids and both of topic 14's own
introduced ids are confirmed live. Chapter 13 and Chapter 14 (data-engineering) are both
confirmed entirely unplanned in `registry.ts` (zero topics under either chapter number); their
six named ids move to `declared`, reusing the exact placeholder ids topics 13 and 14 already
introduced for the same gaps (`table-commit-as-cas`, `erasure-vs-time-travel-snapshot-expiry`,
`delete-files-until-compaction`) and adding one new placeholder (`erasure-proof-retention-as-code`)
plus two more for Chapter 14's coordination-services ids (`zookeeper-etcd-guarantees`,
`strict-serializability-definition`), since no prior topic this chapter had referenced them.
Chapter 11 §11.4 (contract enforcement in CI) is referenced by `CHAPTER.md` only as a named
concept the schema-evolution-review reveal points at, not pulled into `uses`, since this topic's
own scope line treats it as a choice "under which review" rather than a mechanic this topic
builds on directly; Chapter 11 is itself confirmed unplanned, so no new placeholder was
introduced for it since no step's claim depends on a specific Chapter-11-introduced id. No scope
cut — this topic still leaves out the commit protocols, snapshot structures, maintenance
procedures and catalog implementations, erasure itself, the CDC merge, and the
optimistic-versus-pessimistic concurrency theory, per `CHAPTER.md`'s own "Leaves out" line.

## Claims list (for fact-check)
1. Every change to table state replaces the old metadata file with a new one through an atomic
   swap, and that swap is what provides the basis for serializable isolation. — SOURCES.md
   (Iceberg specification).
2. A tag can retain an important historical snapshot specifically for auditing purposes, past
   whatever general expiry policy the table otherwise runs. — SOURCES.md (Iceberg branching and
   tagging).
3. A concurrent operation that adds files in the same partition your own operation reads throws
   a named conflict exception (`ConcurrentAppendException`), regardless of which statement
   (`INSERT`, `DELETE`, `UPDATE`, or `MERGE`) caused it. — SOURCES.md (Delta Lake).
4. Partitioning a table by the same columns used in two operations' own conditions can make
   their file sets disjoint, avoiding the conflict those operations would otherwise cause. —
   SOURCES.md (Delta Lake).
5. The partition-writers plan, the maintenance-as-conflicting-writer framing, and the
   writer-conflict simulation are this chapter's own established method and this topic's own
   derived design, not an independent citation beyond claims 1–4.
