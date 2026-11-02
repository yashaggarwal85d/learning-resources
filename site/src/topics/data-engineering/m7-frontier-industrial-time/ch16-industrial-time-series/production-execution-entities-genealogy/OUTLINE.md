# OUTLINE: Production execution entities and genealogy (`de.production-execution-entities-genealogy`)

## Learning outcomes
1. Model work orders, runs/batches, recipe versions and lots as tables, with a consume/produce edge table connecting lots.
2. State the ISA-88 physical model's six levels and procedural model's four levels, and why a run joins to a recipe *version*, never "the recipe".
3. Answer a forward (exposure) and a backward (cause) genealogy question with a recursive query, cycle-protected with PostgreSQL's built-in `CYCLE` clause.
4. Show, with real executed totals, that one missing consume/produce edge silently understates a recall — and that an unprotected recursive query over a graph with a rework loop never terminates on its own.

## Changes from the chapter plan
CHAPTER.md's hook uses invented figures ("41 found, 58 true, 17 missing") for the contaminated-lot recall. `examples.py` builds a smaller, fully executed synthetic lot DAG (eight consume/produce edges across two plants' worth of raw, intermediate and finished lots, with a genuine merge, a split, and a rework loop) and computes its own true numbers: six lots are truly exposed; dropping one split edge (RM9→INT2) drops it to four, missing `FIN2` and `INT2` from the recall. The mechanism (a missing split edge is invisible to a reachability query) is identical to the plan's; only the illustrative counts differ, per CLAUDE.md's rule that the builder's own `examples.py` replaces the planner's invented figures.

## Reel steps (storyboard)
1. **Hook** — a recall query over a real lot-genealogy table returns fewer finished lots than the truth, and the gap is invisible in the query's own output (nothing errors; it just under-answers).
2. **Reveal: the production objects a lot moves through** — work order (what the business asked for) → run/batch (what actually ran) → lot (material made or consumed together); a run joins to a recipe *version*, never "the recipe" itself. Takeaway.
3. **Reveal: ISA-88's two models, and where they overlap with topic 1's hierarchy** — physical model (enterprise→site→area→process cell→unit→equipment module→control module, Unit never excluded) and procedural model (recipe procedure→unit procedure→operation→phase), named from the standard's own page and Wikipedia's confirmed statement of the model internals, with the correspondence to topic 1's hierarchy stated only as far as supported.
4. **Predict** (within first four steps) — a recursive query follows a consume/produce edge table that contains a rework loop (a reject's material re-enters an earlier lot's later batch). With no protection against revisiting a lot, does the query ever finish on its own?
5. **Reveal: the real, executed answer** — an unprotected recursive query capped at a depth of several hundred is still producing new rows when the cap stops it, proving it would never finish unaided; PostgreSQL's own `CYCLE` clause, added so the recursive term can track visited lots and stop itself. Takeaway.
6. **Reveal: forward genealogy, real totals** — from one contaminated raw lot, the real, executed set of every downstream lot (the recall list).
7. **Reveal: the missing-edge gap, real totals** — the identical query with one split edge removed returns a smaller, wrong set; the two lots a real recall would miss, named exactly, with no error or warning anywhere in the query's own output. Takeaway.
8. **Recap**.
9. **Prove it** — a recall process re-runs the same forward query and gets a different, larger answer the second time, after someone notices a lot went unlisted and manually adds the missing edge. Does a bigger second answer mean the first one was merely incomplete-but-safe, or something worse?

## Post-notes headings
- **Outcomes**: the production-entity ledger, ISA-88's two models, the real cycle-protected recursive query, the real missing-edge recall gap.
- **Lab**: `examples.py`'s own executed SQL against this sandbox's PostgreSQL 16 cluster.
- **Production**: a recall process that "just re-runs the query and checks if the count changed" as a false sense of completeness (Prove-it's scenario).
- **Frontier**: the syllabus's own pointer to §17.4 (graph as operational backend, skipped) as the alternative to a recursive CTE at larger scale.
- **Where this goes next**: hands off to topic 3 (quality data and SPC).

## Examples to execute and assert
`examples.py`: builds an eight-edge consume/produce DAG (merge, split, rework loop) in PostgreSQL; runs the cycle-protected forward and backward recursive queries (`CYCLE ... SET is_cycle USING path`) and asserts their exact lot sets; removes one split edge and asserts the exact smaller set and the exact two missing lots; runs an unprotected, depth-capped version of the same query and asserts it still fills the cap (proving non-termination) rather than converging on its own.

## Bridge and handoff
- **Bridge**: "The hierarchy says where a machine sits and which system owns which data. It says nothing yet about what the machines make. This topic is the objects that move through that hierarchy: work orders, runs, batches, recipes and the lots whose parentage a recall depends on." (Answers topic 1's handoff, per CHAPTER.md.)
- **Handoff**: "A lot has a parentage. It also has a measurement history: the thickness it was inspected at, the limits it had to meet. The next topic is that quality data, and the statistical rules that read it." (Per CHAPTER.md.)

## Concept ledger
- **Introduces**: `work-order-run-batch-lot-model`, `isa88-procedural-physical-models`, `lot-genealogy-forward-backward`, `genealogy-as-reachability-dag`.
- **Uses**: `equipment-hierarchy-dimension`, `hierarchy-as-of-versioning` (topic 1), `recursive-cte-fixpoint`, `bom-explosion`, `graph-reachability-sql`, `cte-cycle-detection`, `directed-acyclic-graph`, `graph-traversal`, `connected-components`, `fact-table-types-transaction-snapshot-accumulating-factless` — confirmed live in `registry.ts` before use (checked by id).
- **Declared**: basic familiarity with a bill of materials.

## Claims list
1. The ISA-88 series' part structure and what Part 1 establishes — ISA's own standard-series page. Confirmed verbatim.
2. The physical model's six levels (enterprise→...→control module, Unit never excluded) and the procedural model's four levels (recipe procedure→unit procedure→operation→phase) — Wikipedia's ISA-88 page, used per CHAPTER.md's own allowance since ISA's public page doesn't itself publish the model internals. Confirmed verbatim, flagged as secondary.
3. A recursive query's general shape (non-recursive term, then UNION/UNION ALL, then recursive term) and the cycle-detection discussion — PostgreSQL 18 docs, `queries-with.html`. Confirmed verbatim.
4. The built-in `CYCLE` clause's syntax and behaviour — same source. Confirmed verbatim.
5. The genealogy totals and the missing-edge gap — this topic's own `examples.py`, executed against PostgreSQL 16 and asserted.
