# OUTLINE: E-commerce warehouse with incremental loads (`de.e-commerce-warehouse-incremental`)

## Learning outcomes
1. Produce a design for the shop's orders, inventory and customers warehouse with a grain, a
   model chosen from three alternatives, an incremental load with an SCD policy, the marts
   worth building, and a semantic definition of revenue.
2. Compute the full-versus-incremental crossover from the shop's numbers.
3. Name the three ways an incremental load silently goes wrong and the guard for each.
4. State the next bottleneck at ten times the load.

## Engagement arc
- Hook: step 1 (the nightly rebuild takes nine hours and costs enough that finance asked about
  it; three weeks after switching to incremental, the order count is short because deleted and
  cancelled orders never reappear in an incremental extract).
- Predict: step 2, within the first four steps (the crossover table size, and the silent-failure
  mode the design didn't name).
- Takeaways: step 4 (a deleted row is invisible to a plain incremental extract), step 6 (a fact
  with no dimension yet still has to land), step 8 (the crossover point is a number, not a
  feeling).
- Recap: step 9. Prove it: step 10.

## Steps (storyboard)

### 1. Hook
- **fig:** a nightly rebuild that takes nine hours switches to incremental; three weeks later
  the warehouse's order count is short of the source's, because deleted and cancelled orders
  never reappear in an incremental extract.
- **On screen:** a rebuild time cut sharply, then a silent count gap weeks later.

### 2. Predict
- **fig:** which single risk of incrementalism did the design not name, and at what table size
  does incremental stop being worth it anyway?
- **Options:** (a) the risk is that incremental loads are simply slower under heavy write load,
  which is why the count fell behind [wrong — a slow load produces staleness, not a permanent
  gap; a row that never arrives is a different failure entirely]; (b) the risk is that an
  incremental extract never sees a deleted or cancelled source row unless the design is told to
  look for one [correct].

### 3. Reveal — grain first, three alternatives
- **fig:** an order-line fact, a daily inventory snapshot fact, and customer, product and date
  dimensions, conformed across them; a decision card weighing a wide denormalised table, a Data
  Vault, and the dimensional model, each priced for this workload.
- **Moves:** three model cards lay out, the dimensional model lifting as chosen.

### 4. Reveal — the deleted-source-row hazard
- **fig:** a cancelled order's row vanishes from the source; the incremental extract, built only
  to pull changed-or-new rows, never asks "what's missing," so the row stays in the warehouse
  forever.
- **takeaway:** "A deleted source row is invisible to a plain incremental extract unless the design is told to look for one."

### 5. Reveal — the late-arriving dimension
- **fig:** an order-line fact lands before its customer dimension does; the fact gets an
  inferred, placeholder dimension member rather than being dropped or blocked.
- **Narrator's line of thought:** she treats "land the fact now, backfill the dimension later"
  as the design choice that keeps the pipeline moving without silently losing the fact.

### 6. Reveal — SCD policy and the merge
- **fig:** a customer's address change tracked as a new SCD Type 2 row (history kept) next to a
  phone-number correction applied as a Type 1 overwrite (history not kept); both merged
  idempotently by a stated unique key.
- **takeaway:** "A changed row merges by a stated unique key, or it silently becomes a duplicate."

### 7. Reveal — marts and the semantic layer
- **fig:** a handful of derived marts for the dominant queries, with "revenue" defined once in a
  semantic layer rather than recomputed slightly differently in each mart.
- **Narrator's line of thought:** she treats "which marts earn their keep" as a real cost
  question, not a default yes to every requested mart.

### 8. Reveal — the full-versus-incremental crossover
- **fig:** a crossover chart: cost per run on the vertical axis, table size on the horizontal; a
  full-refresh line rising steeply, an incremental line rising shallowly with a fixed offset,
  their crossing point marked.
- **takeaway:** "The crossover is a number, computed from the shop's own constants, not a feeling about which approach sounds more modern."

### 9. Recap
- **fig:** the grain-first model, the deleted-row and late-dimension hazards each with their
  guard, the SCD-and-merge policy, the marts-and-semantic-layer decision, and the crossover
  chart, side by side.

### 10. Prove it
- **fig:** a second warehouse, a different table, past its own crossover point for over a year
  without anyone computing it; the nightly job now costs more than a full refresh would.
- **predict options:** (a) switch back to a full refresh immediately, since incremental has
  clearly failed [wrong — the direction of the fix depends on which side of the crossover this
  table is actually on now, not on which approach "has failed" by feel]; (b) compute the
  current crossover from this table's own numbers before changing anything, since the right
  answer depends on where it falls today [correct].

## Post-notes headings
- **Internals:** none claimed independently — dimensional-modelling mechanics, SCD
  implementations, merge syntax, and dbt incremental models are each named only as a choice
  pointing to its home chapter (Chapter 3 and Chapter 2); CDC itself is topic 14's.
- **Lab:** none of its own; the full-versus-incremental cost crossover, computed from the shop's
  constants and a measured merge cost, is this topic's executable evidence.
- **Production:** the hook's own nine-hour-rebuild-to-incremental-switch scenario as the
  concrete shape "incrementalism has a hazard nobody named" takes in practice.
- **Frontier:** none claimed — grain-first modelling and incremental merge loads are established
  practice, not an emerging technique.
- **Where this goes next:** an incremental load needs a source of changed rows. The cleanest
  source is the order database's own change log, and reading it means inheriting its own
  hazards: a replication slot that can fill a disk, a snapshot that must hand over to a stream
  without a gap. The next design is CDC from the transactional database into the lakehouse.

## Concept ledger
- **Introduces:** `warehouse-incremental-design`, `full-vs-incremental-crossover`,
  `incremental-load-silent-failures`.
- **Uses:** the method concepts as in topic 12 (`ask-to-slo-translation`,
  `capacity-estimate-chain`, `littles-law-inflight-sizing`, `data-flow-shape-decision`,
  `layout-from-dominant-access-path`, `engine-choice-by-state-latency-skill`,
  `correction-window-late-data`, `replay-backfill-as-first-class-path`,
  `failure-table-blast-radius`, `cost-waterfall-dominant-lever`, `three-alternatives-with-costs`,
  `ten-x-next-bottleneck`), plus `dimensional-design-four-step`, `fact-grain`,
  `fact-table-types-transaction-snapshot-accumulating-factless`, `conformed-dimension`,
  `scd-type-2`, `scd-types-0-1-3-4-5-6-7`, `idempotent-merge-load`, `inferred-dimension-member`,
  `backdated-fact-scd2-mapping`, `bounded-reprocessing-window`, `semantic-layer-metric-compilation`,
  `dbt-incremental-strategies`, `dbt-snapshot-scd2` (Chapter 3), `merge-statement`,
  `upsert-atomicity` (Chapter 2), `incremental-view-maintenance` (Chapter 2),
  `pre-aggregation-vs-on-query`, `amplification-ledger`.
- **Declared:** `iceberg-delta-table-format-tradeoffs` (Chapter 6 §6.3, not yet planned or
  built — same placeholder id topic 12 already introduced for this gap), `cdc-log-based-capture`
  (Chapter 8 §8.2, not yet planned or built — same placeholder id topic 10 already introduced
  for this gap).

## Changes from the chapter plan
Every explicitly named `uses` id (30 total) is confirmed live via `grep` on `introduces` arrays
across `registry.ts`, matching `CHAPTER.md`'s own stated `Declared: none`. `CHAPTER.md`
separately asks this topic to "build on Chapter 6 §6.3 (table-format merge) and Chapter 8 §8.2
(CDC as the changed-row source)" and resolve their `introduces` ids; confirmed both chapters
(data engineering) are themselves entirely unplanned in `registry.ts`, so this topic reuses the
same two placeholder ids topics 10 and 12 already introduced for the identical gaps, rather than
inventing new, inconsistent names for the same missing material. No scope cut — this topic
still leaves out dimensional-modelling mechanics, SCD implementations, merge syntax, dbt
incremental models, CDC itself, the semantic-layer products, and orchestration of the loads, per
`CHAPTER.md`'s own "Leaves out" line.

## Claims list (for fact-check)
1. Without a stated unique key, an incremental load degrades to append-only, producing
   duplicates on any re-run or resend. — SOURCES.md (dbt).
2. A stated unique key lets a changed row replace its old version in a merge instead of
   appending a duplicate. — SOURCES.md (dbt).
3. `MERGE` can delete rows, but only when the statement includes a clause that asks for it —
   an incremental extract that never sends a delete signal never triggers one. — SOURCES.md
   (PostgreSQL).
4. `WHEN NOT MATCHED BY SOURCE` is the named mechanism for detecting a target row with no
   matching source row — the deleted-source-row hazard's own guard. — SOURCES.md (PostgreSQL).
5. The grain-first dimensional model, the three-alternative decision card, and the
   full-versus-incremental crossover are this chapter's own established method (per
   `CHAPTER.md`'s own scope line), not an independent citation.
