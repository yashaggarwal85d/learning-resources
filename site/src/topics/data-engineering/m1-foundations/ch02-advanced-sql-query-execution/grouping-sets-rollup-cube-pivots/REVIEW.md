# REVIEW: Grouping sets, ROLLUP, CUBE and pivots (`de.grouping-sets-rollup-cube-pivots`)

Independent fact-check. Read: `index.mdx`, `narration.json`, `prerequisites.mdx`, `registry-entry.ts`, and the chapter contract `chapters/data-engineering/m1-foundations/ch02-advanced-sql-query-execution/CHAPTER.md` (topic 5's entry). All six cited sources were fetched via the proxy and checked against the specific quote they back.

**Verdict: MINOR_FIX**

## 1. Sources

| # | URL | Reachable? | Supports the claim? |
|---|---|---|---|
| 1 | PostgreSQL 18 docs, §7.2.4 "GROUPING SETS, CUBE, and ROLLUP" | Yes, 200 | Confirmed exactly, six separate times: "The data selected by the FROM and WHERE clauses is grouped separately by each specified grouping set..."; "References to the grouping columns or expressions are replaced by null values in result rows for grouping sets in which those columns do not appear"; "This is commonly used for analysis over hierarchical data; e.g., total salary by department, division, and company-wide total"; "If any of the ungrouped columns contains NULL, it will be indistinguishable from the NULL used when that same column is grouped"; the exact `ROLLUP (a,b), ROLLUP (a,c)` duplicate-expansion example; and "If these duplicates are undesirable, they can be removed using the DISTINCT clause directly on the GROUP BY" together with "This is not the same as using SELECT DISTINCT because the output rows may still contain duplicates." All match the draft's quotes word for word. |
| 2 | PostgreSQL 18 docs, §9.21, Table 9.66 "Grouping Operations" | Yes, 200 | Confirmed exactly, twice: the bitmask definition ("Returns a bit mask indicating which GROUP BY expressions are not included in the current grouping set... each bit is 0 if the corresponding expression is included... and 1 if it is not included"); and the full worked `make`/`model` example, whose table and prose — "the grouping value 0 in the first four rows shows that those have been grouped normally... the value 3 indicates that neither make nor model was grouped by" — match the draft's quote and the binary interpretation (3 = binary 11) exactly. |
| 3 | PostgreSQL 18 docs, §4.2.7 "Aggregate Expressions" | Yes, 200 | Confirmed exactly: "If FILTER is specified, then only the input rows for which the filter_clause evaluates to true are fed to the aggregate function; other rows are discarded," together with the exact `count(*) FILTER (WHERE i < 5)` worked example. |
| 4 | PostgreSQL 18 docs, §F.43 "tablefunc" | Yes, 200 | Confirmed exactly: "Produces a 'pivot table' containing row names plus N value columns, where N is determined by the row type specified in the calling query." |
| 5 | Snowflake SQL Reference, "PIVOT" | Yes, 200 | Confirmed: the documented syntax template (`PIVOT (<aggregate_function>(<pivot_column>) ... FOR <value_column> IN (<pivot_value_1> [, ...] | ANY ... | <subquery>))`) matches the draft's simplified rendering of the same syntax. |
| 6 | Google Cloud, BigQuery "Query syntax" reference | Yes, 200 | Confirmed: both "PIVOT operator" and "UNPIVOT operator" exist as named sections, supporting the draft's claim that BigQuery has both. |

No dead or misattributed links. Every quoted figure and worked example — including the full `make`/`model` `GROUPING()` table reproduced from the PostgreSQL docs — matched exactly.

## 2. Unsupported numbers

None found. The topic's only numeric content beyond the chapter's fixed running-example data is the `GROUPING()` bitmask worked example (0, 1, 3 = binary 11), which is reproduced directly from the sourced PostgreSQL documentation and independently checked to be internally consistent (3 in binary is indeed 11, matching "neither make nor model was grouped by," i.e., both bits set).

## 3. Narration & format

- **Valid JSON**, 6 steps. No digits or symbols found in any spoken line (regex-scanned).
- **Only one predict step with an answer** (step 2, 0-indexed), below the chapter's own stated convention of "2–4 predict questions" for full topics (`CHAPTER.md`, "Reel shape"). The other five Chapter 2 topics reviewed in this pass all have two or three. This isn't a correctness error, but it is a specific, checkable shortfall against the chapter's own stated design rule — worth adding a second predict step (e.g. around the pivot section, or a direct "what does `CUBE(e1,e2)` expand to" prediction before showing the answer) before this ships.
- **Opens on the Bridge and closes on the Handoff, both near- or fully-verbatim.** Step 0 ("Every question so far has produced one row per group, or one row per path. Now: splitting one total into several totals, at several levels, all in a single pass over the data.") is a close paraphrase of the registry `bridge` (minor rewording of the middle clause: "splitting one total into several totals" for "splitting one aggregate into several"). The last two lines of step 5 — "Every total so far summed rows that were already sitting next to each other in one table. Next: pulling in one extra row, from the table beside it, computed just once, right where you need it." — match the `handoff` field exactly, word for word.
- **MIT-professor voice:** reads as spoken teaching prose ("Here's the trap," "Which means there's a classic, silent mistake waiting here") and is clearly distinct from the `index.mdx` prose. Pass.
- **index.mdx format:** frontmatter has `id` and `title`; the five required `<section data-section="...">` blocks are present and in order; depth (the grouping-set definition with both shorthands derived precisely, the `GROUPING()` ambiguity motivated with a concrete bug on the chapter's own nullable column, the duplicate-grouping-set mechanism with its exact expansion, three pivot techniques with working portability guidance, a three-part lab, a four-item production checklist) is comparable to the `io-cost-model` reference topic.
- **prerequisites.mdx:** has the required `data-section="basics"` section plus two further numbered sections, correctly linking topic 2 by its actual folder name for the nullable-column dependency. Matches shape.
- **registry-entry.ts:** well-formed `TopicMeta`, `status: 'held'`. Same cosmetic, never-executed import-path issue shared by every Chapter 2 topic reviewed in this pass.

## 4. Flow

- **`uses`/`introduces`/`declared`, `id`, folder, `kind`, `minutes`, bridge and handoff all match `CHAPTER.md`'s topic 5 entry exactly.** `introduces: ['grouping-sets', 'rollup-cube', 'grouping-function', 'conditional-aggregation-pivot']` and `uses: ['bag-semantics', 'three-valued-logic', 'null-in-clauses']` are identical to the plan. All three `uses` ids are confirmed introduced by topics 1 and 2 of this chapter (both reviewed earlier in this pass and contract-clean).
- **No id/folder deviation.**
- Nothing else in `uses`/`introduces`/`declared` is wrong; concept sequencing is correct.

## Summary

Sourcing is, once again, essentially perfect: all six cited pages were checked and every direct quotation — including a full worked example table reproduced from PostgreSQL's own documentation — matched exactly. The chapter-contract fields and the handoff line are clean. The verdict is MINOR_FIX for one specific, checkable shortfall: only one predict/answer step where the chapter's own stated convention calls for two to four, plus the same cosmetic import-path issue shared by this chapter's other topics.
