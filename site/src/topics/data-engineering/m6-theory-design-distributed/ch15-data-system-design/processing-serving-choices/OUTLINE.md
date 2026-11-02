# OUTLINE: Processing and serving choices (`de.processing-serving-choices`)

## Learning outcomes
1. For the shop's order analytics, choose the processing engine from state size, latency and team
   skill, and name what the choice gives up.
2. Map four query shapes to four serving stores and say what each store is derived from.
3. Decide pre-aggregate versus compute-on-query from a query's repetition and the freshness SLO.
4. Build the amplification ledger for a design and compare two designs by it.

## Engagement arc
- Hook: step 1 (the eight-second dashboard query, three competing fixes).
- Predict: step 2, within the first four steps (which fix is cheapest, fastest, and which breaks
  tomorrow).
- Takeaways: step 4 (team skill is a real cost, not an afterthought), step 6 (a serving store
  follows the shape of the question, not the data), step 9 (amplified I/O, not logical volume, is
  what a design actually costs).
- Recap: step 10. Prove it: step 11.

## Steps (storyboard)

### 1. Hook
- **fig:** the shop's dashboard query takes eight seconds on the warehouse. Three fixes proposed:
  move it to a real-time OLAP store, build a nightly pre-aggregated table, or add a two-line
  clustering key and leave it.
- **On screen:** one slow query, three proposed fixes, no obvious winner yet.

### 2. Predict
- **fig:** which fix is cheapest, which is fastest, and which one breaks when the question changes
  tomorrow?
- **Options:** (a) the real-time OLAP store always wins, since it's built for exactly this [wrong
  — it's also the most expensive and operationally heaviest of the three]; (b) the clustering-key
  fix is cheapest and often fast enough, but the pre-aggregated table is fastest *and* the one that
  breaks the moment the breakdown changes [correct].

### 3. Reveal — engine choice: state size, latency, team skill
- **fig:** three real drivers for picking a processing engine — does the computation's own state
  fit in memory, what's the shape's own latency floor (topic 3), and can the team actually operate
  and debug this engine on call.
- **Moves:** three gauges filling in for the shop's own query, naming which option each one favors.

### 4. Reveal — team skill as a real, counted cost
- **fig:** an engine nobody on call can debug is drawn as a cost bar, same units as latency and
  compute cost, not a footnote.
- **takeaway:** "An engine nobody on call can debug is a real cost — not an afterthought."

### 5. Reveal — a serving store follows the shape of the question
- **fig:** four question shapes (point lookup, OLAP slice, full-text search, similarity) each
  drawn as an arrow out of the one system-of-record box, landing on a different derived store.
- **Narrator's line of thought:** she follows the question's shape to its store, never the data's
  shape to a store picked by habit.

### 6. Reveal — one dataset, three serving stores
- **fig:** the shop's order data served three ways at once — a key-value lookup, a columnar slice,
  a search index — each one explicitly tagged *derived*, none of them the system of record itself.
- **takeaway:** "A serving store follows the shape of the question, not the shape of the data."

### 7. Reveal — pre-aggregation trades compute at write for compute at read
- **fig:** the same query answered two ways: a pre-aggregated table (instant, stale-bounded, fixed
  shape) against on-query compute (flexible, fresh, costs at every read).
- **Narrator's line of thought:** she ties the choice to how often the query repeats and how fresh
  it must be — not to which one "sounds faster."

### 8. Reveal — the amplification ledger
- **fig:** the three serving options from the hook, each as a stack of bars: logical bytes, then
  replication, then pre-aggregate rewrite, then compaction, summing to physical bytes — the
  multiplier counted up for each option.
- **Narrator's line of thought:** she compares designs by their amplified I/O, never by the
  logical volume that started the stack.

### 9. Reveal — the surprising multiplier
- **fig:** the cheapest-looking option on paper turns out to have the largest physical-bytes bar
  once replication and compaction are counted in.
- **takeaway:** "Compare designs by their amplified I/O — logical volume alone hides the real
  cost."

### 10. Recap
- **fig:** the three-driver engine decision, the question-shape-to-store map, the pre-aggregate
  versus on-query trade, and the amplification ledger that prices all three options honestly.

### 11. Prove it
- **fig:** the executives ask for a new breakdown tomorrow — which of the three original fixes
  survives that change, and what does the amplification ledger say about the survivor's own cost?
- **predict options:** (a) the clustering-key fix survives untouched, since it computes the new
  breakdown on demand, at some ongoing query cost the ledger already counted [correct]; (b) the
  pre-aggregated table survives fine, since adding a breakdown is just adding a column [wrong,
  tempting because it sounds like a small schema change, but a new breakdown usually needs a new
  grouping key, which means rebuilding the aggregate, not extending it].

## Post-notes headings
- **Internals:** none claimed independently — engine internals (Chapters 2, 7, 9) and serving-
  store internals (Chapter 5, Chapter 6 §6.4, Chapter 9's real-time OLAP, Chapter 17's vector and
  graph stores) are each named but not re-derived, per `CHAPTER.md`'s own "Leaves out" line.
- **Lab:** this topic's own `examples.py` — the amplification ledger computed from the shop's own
  constants and topic 2's estimate chain.
- **Production:** the shop's own hook (reaching for a new, heavier store before checking whether a
  two-line index fix already solves it) as the concrete failure mode "engine-shopping before
  measuring" takes in practice.
- **Frontier:** the single-node renaissance (DuckDB, Polars) as the still-growing option topic 2's
  own capacity estimate increasingly justifies for workloads smaller than their reputation.
- **Where this goes next:** hands off to correctness under replay and late data (topic 6), since a
  design chosen for the normal day still has to survive duplicates, late events and reprocessing.

## Concept ledger
- **Introduces:** `engine-choice-by-state-latency-skill`, `serving-store-by-query-shape`,
  `pre-aggregation-vs-on-query`, `amplification-ledger`.
- **Uses:** `data-flow-shape-decision`, `layout-from-dominant-access-path`,
  `system-of-record-vs-derived`, `capacity-estimate-chain` (this chapter), `incremental-view-
  maintenance` (Chapter 2), `arrow-columnar-format`, `polars-lazy-expressions` (Chapter 4),
  `lsm-compaction-rum` (Chapter 5 — now live; was `declared` by topic 2, confirmed live in
  `registry.ts` for this topic).
- **Declared (chapter-plan ids not yet resolvable in `registry.ts` — Chapters 5 §5.5/topic 28, 6,
  7, 9 not live for these):** `analytical-serving-layers`, `cache-patterns-eviction`,
  `redis-valkey-internals` (Chapter 5), `rocksdb-state-backend-sizing` (Chapter 7 §7.4),
  `flink-state-backend-mechanics`, `realtime-olap-ingestion` (Chapter 9 §9.3), `duckdb-single-
  node-renaissance` (Chapter 6 §6.4).

## Changes from the chapter plan
Same pattern as topics 1-4: chapter-plan `uses` ids from Chapters 5 (the specific serving-layers
and cache topics), 6, 7 and 9 moved to `declared` since those specific topics aren't live in
`registry.ts` yet. `lsm-compaction-rum` is the one exception — confirmed live (Chapter 5's own
LSM-compaction topic), so it moves from `declared` (as topic 2 had it) into this topic's `uses`.
No scope cut.

## Claims list (for fact-check)
1. DuckDB's own stated design lineage: in-process, embedded operation adopted deliberately from
   SQLite's own success. — SOURCES.md.
2. DuckDB's own claim of zero external dependencies for build or runtime. — SOURCES.md.
3. Kleppmann's own framing: a database as mutable global state, versus derived views materialized
   from streams as the alternative. — SOURCES.md.
4. Kleppmann's own named trade-off for that approach: simpler code and lower latency gained. —
   SOURCES.md.
5. The amplification-ledger reasoning (comparing designs by physical, not logical, bytes) is this
   chapter's own extension of topic 2's estimate chain, not an independent citation.
