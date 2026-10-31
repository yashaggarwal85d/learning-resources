# OUTLINE: Managed ingestion tools and build-vs-buy (`de.managed-ingestion-tools-build`)

## Learning outcomes
1. Compare the five tools on what they own, how they price and how they handle drift.
2. Compute a MAR-priced bill for a given change pattern.
3. Decide, with numbers, whether to build or buy a connector for a given source.

## Engagement arc
- Hook: step 1 (a managed pipeline's bill triples after a harmless-looking backfill, because
  every re-touched row counts as active).
- Predict: step 2, within the first four steps (whether a bigger table or a smaller, more
  volatile one costs more on a per-row-active pricing model, for an identical backfill).
- Takeaways: step 4 (a key is billed once per month no matter how many times it changes, so a
  small hot table can cost more than a huge quiet one), step 6 (dlt's four schema-contract modes
  each trade a different kind of silent loss for a different kind of loud failure), step 8 (the
  dozen failure modes a hand-built connector owns are exactly what a managed tool's price is
  actually buying).
- Recap: step 9. Prove it: step 10 (apply the decision rule to a new, concrete source).

## Steps (storyboard)

### 1. Hook
- **fig:** a managed pipeline's monthly bill triples after what looked like a routine backfill;
  the figure is a MAR counter racing up against a row count that barely moved.
- **On screen:** a small table's row count staying flat while its billed-rows counter climbs.

### 2. Predict
- **fig:** two tables get an identical backfill this month: a small table with every row
  rewritten once, and a much larger table that is almost never touched. Which one costs more
  under MAR pricing?
- **Options:** (a) the larger table, because it simply has more rows in total [wrong — MAR
  bills only the rows that were actually active that month, not the table's total size]; (b)
  the smaller table, because the backfill touches every one of its rows while the larger
  table's own rows mostly sit untouched [correct].

### 3. Reveal — how a key gets billed at all
- **fig:** a key is counted once it's touched this month, no matter how many separate updates
  land on it before the month ends.
- **Moves:** one key lighting up once, staying lit through several more touches, never adding
  to the count again.

### 4. Reveal — the two tables, measured
- **fig:** the real run: the small table's full-reprocess backfill against the large table's
  ordinary trickle of changes, both billed by the identical rule.
- **takeaway:** "A key is billed once it's touched this month, however many times it changes — so a small, fully reprocessed table can cost more than a huge, quiet one."

### 5. Reveal — four ways to meet a new column
- **fig:** the identical drifted record, met four different ways: let it through, reject the
  whole batch, drop just the bad row, or drop just the bad field.
- **Narrator's line of thought:** she treats these four as one trade, stated four different
  ways — each one swaps a different kind of silent loss for a different kind of loud failure.

### 6. Reveal — all four modes, measured
- **fig:** the real run: the identical row with its new field met by evolve, freeze,
  discard-row and discard-value in turn.
- **takeaway:** "Evolve accepts everything; freeze rejects everything; discarding a row or a value sacrifices one or the other to keep the rest moving."

### 7. Reveal — what a hand-built connector actually owns
- **fig:** the dozen named failure modes this chapter's own topics each solved by hand, counted
  up as one list.
- **Narrator's line of thought:** she treats this list as the real content of a managed tool's
  price tag — not a feature list, but every one of these problems, already solved, for every
  connector the tool supports.

### 8. Reveal — the failure-mode count, measured
- **fig:** the real count: twelve distinct problems from topics two through seven, each one a
  separate thing a hand-built connector has to get right on its own.
- **takeaway:** "A managed tool's price is mostly a dozen solved problems, not a feature — the question is whether your source is common enough that someone already solved them."

### 9. Recap
- **fig:** the MAR pricing rule, the four schema-contract modes, and the dozen failure modes,
  side by side with the one decision they all feed into.

### 10. Prove it
- **fig:** a new source shows up: a proprietary, regulated feed from a core banking system, low
  volume, with a strict data-sovereignty requirement. Build or buy?
- **predict options:** (a) buy, because the volume is low enough that a managed tool's price
  would be small [wrong — a sovereignty requirement rules a managed, often cross-border, tool
  out regardless of price or volume]; (b) build, because the sovereignty requirement overrides
  every other factor in the decision [correct].

## Post-notes headings
- **Internals:** none claimed independently — this topic measures Fivetran's own documented MAR
  rule and dlt's own documented contract modes directly; Kafka Connect's `errors.tolerance` and
  dead-letter-queue configuration, and Airbyte's and Meltano's own sync-mode and state models,
  are named in prose from their own documentation without being re-measured here.
- **Lab:** none of its own, per `CHAPTER.md` — the 8.1 chapter lab's hand-built extractors
  (topics 2 through 7) are themselves the "build" side of this topic's own comparison.
- **Production:** the hook's own scenario (a harmless-looking backfill tripling a managed bill)
  as the concrete shape a MAR-based pricing model can spring on a team that doesn't know the
  rule.
- **Frontier:** none claimed — usage-based pricing, schema contracts and connector frameworks
  are each established, long-documented practice.
- **Where this goes next:** one failure this whole section kept returning to has no fix inside a
  cursor: a row that was deleted, or changed twice between runs. The source database already
  records every change, in order, for its own recovery. Reading that record instead opens the
  next section.

## Concept ledger
- **Introduces:** `ingestion-build-vs-buy`.
- **Uses:** `high-watermark-cursor` (topic 3), `keyset-pagination-consistency`,
  `rate-limit-backoff-ingestion` (topic 4), `object-store-commit-protocols` (topic 5),
  `exactly-once-effect-recipe` (topic 6), `raw-layer-replay-metadata` (topic 7),
  `data-contract-specification` (Chapter 3 topic 22) — all confirmed live via the
  registry-parsing script.
- **Declared:** none beyond topic 7.

## Changes from the chapter plan
None. All seven named `uses` ids resolve live in `registry.ts`.

## Claims list (for fact-check)
1. "MAR is the number of distinct rows synced from the source system to your destination system
   in a given calendar month," counted "separately... by account, destination, connection,
   table, activation, and activation sync," and "once a row is active, it is only counted once
   per month." — SOURCES.md (Fivetran docs).
2. "Fivetran... today announced the completion of its merger with dbt Labs" (1 June 2026). —
   SOURCES.md (Fivetran press release).
3. dlt's four schema-contract modes — `evolve`, `freeze`, `discard_row`, `discard_value` — and
   their documented behaviour. — SOURCES.md (dlt docs).
4. A small, fully reprocessed table can cost more under MAR pricing than a much larger table
   that is rarely touched, because MAR bills distinct active keys, not total row count. —
   measured directly in `examples.py`.
5. The identical set of keys billed once this month costs the same whether touched once or many
   times that month. — measured directly in `examples.py`.
6. The four schema-contract modes applied to the identical drifted record produce four distinct
   outcomes: keep everything, load nothing, drop the row, or drop the field. — measured directly
   in `examples.py`.
7. A hand-built connector covering this chapter's own topics 2 through 7 must separately solve
   twelve distinct, named failure modes. — measured directly in `examples.py` (a direct count,
   not a citation).
8. A sovereignty requirement overrides volume, latency need and source commonness in the
   build-versus-buy decision. — measured directly in `examples.py`, applied to three concrete
   scenarios.
