# OUTLINE: Storage, layout and lifecycle decisions (`de.storage-layout-lifecycle-decisions`)

## Learning outcomes
1. For a dataset, name the system of record and its derived stores.
2. Choose a table format and a partition-and-cluster layout from the dominant access path, and
   estimate the files and bytes pruned.
3. Define hot, warm and cold tiers with a retention period for each class.
4. Show the layout change erasure requires if it was not planned, and say what it costs.

## Engagement arc
- Hook: step 1 (the customer-id partition that seemed reasonable, two failures a year later).
- Predict: step 2, within the first four steps (which single design-time decision prevents both).
- Takeaways: step 4 (the dominant access path, not instinct, picks the partition key), step 6
  (tiering is a retention period attached to a class of data, not a storage-tier label), step 8
  (erasure designed in costs a key strategy; retrofitted costs a full rewrite).
- Recap: step 9. Prove it: step 10.

## Steps (storyboard)

### 1. Hook
- **fig:** the shop partitions its events table by customer id "for fast lookups." A year later the
  nightly revenue job (which scans by date) is crawling, and legal asks for one customer's data to
  be deletable within thirty days — the same layout makes both painful.
- **On screen:** one layout, two symptoms: a slow nightly job, an expensive deletion request.

### 2. Predict
- **fig:** which single design-time decision would have prevented both symptoms?
- **Options:** (a) a bigger cluster would have absorbed the slow job, and deletion is a separate,
  unrelated problem [wrong — more compute doesn't fix a layout that forces a full-table scan, and
  deletion difficulty comes from the same layout choice]; (b) the partition key itself — picked
  from the dominant access path, not from "lookups" in general [correct].

### 3. Reveal — system of record vs. derived stores
- **fig:** every dataset is either the one authoritative copy or rebuildable from it; the shop's
  orders table (system of record) versus a derived daily-revenue rollup (rebuildable, not backed
  up the same way).
- **Moves:** two tags, "source of truth" and "derived, rebuildable," attached to two datasets.

### 4. Reveal — choosing a layout from the dominant access path
- **fig:** the dominant access path (the one query shape that accounts for most of the cost) picks
  the partition key; the shop's nightly revenue job scans by date, so partition by date, not by
  customer id.
- **takeaway:** "The dominant access path picks the partition key — not whatever felt intuitive."

### 5. Reveal — the band crossing the layout, two ways
- **fig:** the same date-range query drawn as a band across two layouts: partitioned by customer
  id, the band crosses many thin slivers (most of them touched, little pruned); partitioned by
  date, the band covers a few thick blocks and the rest is pruned (dimmed), the pruned fraction
  counted.
- **Narrator's line of thought:** she counts the pruned fraction as the real, measurable payoff of
  matching the layout to the access path — not an abstract principle.

### 6. Reveal — hot, warm, cold tiers, each with its own retention
- **fig:** three shelves (hot, warm, cold) holding progressively older data on progressively
  cheaper storage, each shelf with a retention clock naming how long its class of data is kept.
- **takeaway:** "A tier is a retention period attached to a class of data — not just a cheaper
  place to put old files."

### 7. Reveal — storage limitation names the clock
- **fig:** the GDPR's own "storage limitation" principle — data kept in identifiable form no longer
  than its purpose requires — is the clock on each shelf, stated as a legal requirement, not an
  engineering nicety.
- **Narrator's line of thought:** she treats the law as the reason a retention period must exist at
  all, not as a vague compliance gesture.

### 8. Predict
- **fig:** a customer asks to be deleted. On the date-partitioned layout, do their rows sit in one
  place, or are they scattered across every date partition they ever appeared in?
- **Options:** (a) scattered across every date partition — deleting them means touching every
  shelf the layout has [correct]; (b) still together, since partitioning by date doesn't change
  which customer a row belongs to [wrong, tempting because the row's data is unchanged, but the
  question is where it physically sits].
- **takeaway:** "Erasure designed in costs a key strategy chosen up front; retrofitted, it costs a
  rewrite of every shelf the layout has."

### 9. Recap
- **fig:** the system-of-record tag, the dominant-access-path layout with its pruned fraction, the
  three tiers each with a retention clock, and the erasure thread running through all of them.

### 10. Prove it
- **fig:** a second dataset (session logs) has a dominant access path that's a point lookup by
  session id, not a date range — what does that change about the partition key, and does the same
  erasure problem appear?
- **predict options:** (a) partition by session id instead, and the same erasure cost appears if a
  user's sessions are scattered across many session-id partitions rather than keyed together
  [correct]; (b) a point-lookup access path means partitioning doesn't matter at all, since an
  index handles it [wrong, tempting because indexes do help point lookups, but an unpruned
  partition layout still forces scanning every partition's own index].

## Post-notes headings
- **Internals:** none claimed independently — table-format and partitioning mechanics are
  Chapter 6 and Chapter 2's own subject, named but not re-derived here (see "Changes from the
  chapter plan").
- **Lab:** this topic's own `examples.py` — the file-count and bytes-pruned arithmetic for the two
  layouts, computed from the shop's own constants.
- **Production:** the shop's own hook (customer-id partitioning chosen "for fast lookups" without
  naming the actual dominant access path) as the concrete failure mode "wrong partition key" takes
  in practice.
- **Frontier:** none claimed — system-of-record/derived-store reasoning, access-path-driven
  partitioning, and privacy-by-design retention are all settled, decades-old (partitioning) or
  years-old (GDPR, 2018) practice, not emerging techniques.
- **Where this goes next:** hands off to processing and serving choices (topic 5), which read the
  layout this topic chose.

## Concept ledger
- **Introduces:** `system-of-record-vs-derived`, `layout-from-dominant-access-path`,
  `tiering-retention-designed-up-front`.
- **Uses:** `data-flow-shape-decision` (topic 3, this chapter), `capacity-estimate-chain` (topic 2,
  this chapter), `fact-grain`, `fact-table-types-transaction-snapshot-accumulating-factless`,
  `medallion-bronze-silver-gold` (Chapter 3), `partition-pruning-plan-vs-run-time`,
  `partition-overhead`, `block-range-summary-pruning`, `composite-index-column-order` (Chapter 2),
  `object-storage-billing-model` (Chapter 1).
- **Declared (chapter-plan ids not yet resolvable in `registry.ts` — Chapters 6 and 13 not live for
  these):** `erasure-vs-time-travel-snapshot-expiry`, `per-subject-crypto-shredding-cost`,
  `sensitivity-tier-and-category` (Chapter 13), `iceberg-delta-hudi-table-format-mechanics`,
  `parquet-row-group-encoding`, `small-files-problem` (Chapter 6).

## Changes from the chapter plan
Same pattern as topics 1-3: chapter-plan `uses` ids from Chapters 6 and 13 moved to `declared`
since neither chapter has these ids live in `registry.ts` yet. No scope cut — this topic still
leaves out table-format internals (Chapter 6) and partition/pruning mechanics (Chapter 2 §2.4) per
`CHAPTER.md`'s own "Leaves out" line, teaching only the *decision* (which format, which key, which
tier) from the access path and the law, not the mechanics each decision rests on.

A step was added after the storyboard draft above (between what's numbered step 4 and step 5
here): "Reveal: a table format, picked by its one decisive cost," because the "table format and
file layout" syllabus clause had no step covering it — the original 10-step draft folded format
choice into the access-path reveal without actually naming it. The reel now has 11 steps; no
other step numbering below changed.

## Claims list (for fact-check)
1. GDPR Art. 5: personal data must not be kept, in identifiable form, longer than its processing
   purpose requires ("storage limitation"). — SOURCES.md.
2. GDPR Art. 25(1): protective measures must be designed in "at the time of the determination of
   the means for processing," not retrofitted. — SOURCES.md.
3. GDPR Art. 25(2): storage period and accessibility are named explicitly among what must default
   to the minimum necessary. — SOURCES.md.
4. The dominant-access-path reasoning (partition on what prunes the most data for the query that
   costs the most) is this chapter's own established pattern, not an independent citation.
