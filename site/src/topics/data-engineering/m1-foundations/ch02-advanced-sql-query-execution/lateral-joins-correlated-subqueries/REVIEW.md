# REVIEW: LATERAL joins and correlated subqueries (`de.lateral-joins-correlated-subqueries`)

Independent fact-check. Read: `index.mdx`, `narration.json`, `prerequisites.mdx`, `registry-entry.ts`, and the chapter contract `chapters/data-engineering/m1-foundations/ch02-advanced-sql-query-execution/CHAPTER.md` (topic 6's entry). All three cited sources were fetched via the proxy and checked against the specific claim they back, including pulling the full `prepjointree.c` source.

**Verdict: MINOR_FIX**

## 1. Sources

| # | URL | Reachable? | Supports the claim? |
|---|---|---|---|
| 1 | PostgreSQL 18 docs, §7.2.1.5 "LATERAL Subqueries" | Yes, 200 | Confirmed exactly, five separate times: "Subqueries appearing in FROM can be preceded by the key word LATERAL. This allows them to reference columns provided by preceding FROM items. (Without LATERAL, each subquery is evaluated independently and so cannot cross-reference any other FROM item.)"; "for functions the key word is optional; the function's arguments can contain references to columns provided by preceding FROM items in any case"; the per-row evaluation model ("for each row of the FROM item providing the cross-referenced column(s)... the LATERAL item is evaluated using that row... This is repeated for each row..."); the trivial `foo`/`bar` example and its "exactly the same result as the more conventional" claim; and "It is often particularly handy to LEFT JOIN to a LATERAL subquery, so that source rows will appear in the result even if the LATERAL subquery produces no rows for them," together with the exact `manufacturers`/`get_product_names` example, reproduced character-for-character. |
| 2 | PostgreSQL source `prepjointree.c`, `is_simple_subquery` | Yes, 200 — fetched the full source | Confirmed exactly, down to the code: the comment "Can't pull up a subquery involving grouping, aggregation, SRFs, sorting, limiting, or WITH" matches the draft's quote verbatim, and the `if` statement immediately below it literally checks `subquery->sortClause`, `subquery->limitOffset` and `subquery->limitCount` among its conditions — exactly the three fields the draft says the planner inspects. |
| 3 | Microsoft Learn, T-SQL "FROM clause plus JOIN, APPLY, PIVOT" | Yes, 200 | Mostly confirmed, with one precision gap: the behavioral claim is correct — the page states "When CROSS is specified, no rows are produced when the right_table_source is evaluated against a specified row of the left_table_source and returns an empty result set. When OUTER is specified, one row is produced for each row of the left_table_source even when [it] returns an empty result set" — which is exactly the `CROSS APPLY`/`OUTER APPLY` behavior the draft describes. The separate quote "if you want the query to produce rows for those [outer rows] without [matches]... use OUTER APPLY instead" is confirmed verbatim (bracketed words are the draft's own generalization of "departments without employees," a normal editorial substitution). However, the draft's **other** quoted fragment — "CROSS APPLY... returns only rows from the outer table that produce a result set from the table-valued function" — is not literally present on the page in that wording; it's an accurate paraphrase of the CROSS-vs-OUTER behavior quoted above, but it is presented inside quotation marks as if verbatim. Minor: either drop the quotation marks around that fragment or replace it with the page's actual wording. |

No dead links. The topic's two most load-bearing citations — the `LATERAL` evaluation model and the planner's exact `is_simple_subquery` pull-up conditions — were both confirmed character-for-character, including a full worked SQL example reproduced exactly from the PostgreSQL docs.

## 2. Unsupported numbers

None found. This topic makes no numeric claims; its content is entirely about query semantics and planner behavior. The lab correctly marks the cost-comparison outcome ("the crossover depends on customer and order counts") as "measure in build" rather than asserting a figure.

## 3. Narration & format

- **Valid JSON**, 6 steps. No digits or symbols found in any spoken line (regex-scanned).
- **Two predict steps with answers** (steps 2, 4, 0-indexed), within the chapter's "2–4 predict questions" range.
- **Opens on the Bridge near-verbatim, closes on the Handoff exactly.** Step 0 ("Every total so far summed rows that were already sitting next to each other in one table. Now: pulling in one extra row, from the table beside it, computed just once, right where you need it.") matches the registry `bridge` with only "Next"→"Now" and a period for a comma. The last two lines of step 5 — "This whole section has been about what a query means. Next: what SQL means for data that is not flat at all." — match the `handoff` field exactly, word for word.
- **MIT-professor voice:** reads as spoken teaching prose ("Here's where that actually earns its keep," "Now, a quieter question") and is clearly distinct from the `index.mdx` prose. Pass.
- **index.mdx format:** frontmatter has `id` and `title`; the five required `<section data-section="...">` blocks are present and in order; depth (the exact `LATERAL` evaluation model, a worked top-N-per-group query, the `LEFT JOIN LATERAL ... ON true` pattern contrasted against topic 3's anti-join, the `CROSS APPLY`/`OUTER APPLY` cross-dialect mapping, the exact planner pull-up boundary sourced to the actual gating code, a two-part lab, a four-item production checklist) is comparable to the `io-cost-model` reference topic.
- **prerequisites.mdx:** has the required `data-section="basics"` section plus two further numbered sections, correctly linking topic 3 by its actual folder name for the anti-join contrast. Matches shape.
- **registry-entry.ts:** well-formed `TopicMeta`, `status: 'held'`. Same cosmetic, never-executed import-path issue shared by every Chapter 2 topic reviewed in this pass.

## 4. Flow

- **`uses`/`introduces`/`declared`, `id`, folder, `kind`, `minutes`, bridge and handoff all match `CHAPTER.md`'s topic 6 entry exactly.** `introduces: ['lateral-join', 'top-n-per-group', 'subquery-pullup-boundary']` and `uses: ['relational-algebra', 'semi-join', 'anti-join']` are identical to the plan. All three `uses` ids are confirmed introduced by topics 1 and 3 of this chapter (both reviewed earlier in this pass and contract-clean).
- **No id/folder deviation.**
- Nothing else in `uses`/`introduces`/`declared` is wrong; concept sequencing is correct.

## Summary

Sourcing is very strong: the topic's two central technical claims (the `LATERAL` per-row evaluation model and the planner's exact pull-up gating conditions) were both verified character-for-character against the live PostgreSQL docs and source, including a worked example reproduced exactly. The verdict is MINOR_FIX for one Microsoft Learn quote that's presented in quotation marks but is actually an accurate paraphrase rather than the page's literal wording — a presentation issue, not a factual one — plus the same cosmetic import-path issue shared by this chapter's other topics.
