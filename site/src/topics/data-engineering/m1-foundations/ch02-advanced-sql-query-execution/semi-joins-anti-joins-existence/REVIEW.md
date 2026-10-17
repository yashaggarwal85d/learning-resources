# REVIEW: Semi-joins, anti-joins and existence (`de.semi-joins-anti-joins-existence`)

Independent fact-check. Read: `index.mdx`, `narration.json`, `prerequisites.mdx`, `registry-entry.ts`, and the chapter contract `chapters/data-engineering/m1-foundations/ch02-advanced-sql-query-execution/CHAPTER.md` (topic 3's entry). All five cited sources were fetched via the proxy and checked against the specific claim they back, including pulling the full PostgreSQL `subselect.c`, `joinpath.c` and `explain.c` source files.

**Verdict: PASS**

## 1. Sources

| # | URL | Reachable? | Supports the claim? |
|---|---|---|---|
| 1 | PostgreSQL source `subselect.c` | Yes, 200 — fetched the full source | **Confirmed exactly, word for word**, the topic's central and most load-bearing quote: "Per SQL spec, NOT IN is not ordinarily equivalent to an anti-join, so that by default we have to fail when under_not. However, if we can prove that neither the outer query's expressions nor the sub-select's output columns can be NULL, and further that the operator itself cannot return NULL for non-null inputs, then the logic is identical and it's safe to convert NOT IN to an anti-join." The two named functions, `sublink_testexpr_is_not_nullable` and `query_outputs_are_not_nullable`, appear in the actual gating `if` statement immediately below this comment, exactly as the draft describes. `convert_EXISTS_sublink_to_join`'s own doc comment is a one-liner with no nullability condition, consistent with the draft's claim that `EXISTS`/`NOT EXISTS` conversion is unconditional. |
| 2 | PostgreSQL source `joinpath.c` | Yes, 200 | Confirmed: both `JOIN_SEMI` and `JOIN_ANTI` are real planner-internal join-type constants in this file. |
| 3 | PostgreSQL source `explain.c` | Yes, 200 | Confirmed: the literal strings `"Semi"`, `"Anti"` and `"Right Semi"` are all present as `EXPLAIN` join-type labels. |
| 4 | PostgreSQL 18 Release Notes | Yes, 200 | Confirmed exactly: "Allow the optimizer to use Right Semi Join plans (Richard Guo) — Semi-joins are used when needing to find if there is at least one match." Matches the draft's quote and attribution exactly. |
| 5 | PostgreSQL 18 docs, §9.24 "Subquery Expressions" | Yes, 200 (verified when reviewing the previous topic, `nulls-three-valued-logic`, which cites the same page) | Confirms the `EXISTS`/`IN`/`NOT EXISTS`/`NOT IN` semantics the draft's safety table summarizes. |

No dead or misattributed links. The topic's single most consequential claim — the exact gating condition PostgreSQL uses to decide whether `NOT IN` is safe to rewrite as an anti-join — was traced to the literal source comment and the literal function names in the gating `if` statement beneath it, which is about as rigorous a confirmation as is possible for a claim like this.

## 2. Unsupported numbers

None found. This topic makes no free-standing numeric claims; the one number in it (`order_items`, 300,000,000 rows) is the chapter's own fixed running-example value, reused unchanged, and used only to illustrate why a semi-join avoids a redundant deduplication over all of those rows (a qualitative point, not a measured one — the lab correctly marks the actual cost comparison "measure in build").

## 3. Narration & format

- **Valid JSON**, 6 steps. No digits or symbols found in any spoken line (regex-scanned).
- **Two predict steps with answers** (steps 2, 3, 0-indexed) — within the chapter's stated "2–4 predict questions" range, at the lower end but not a violation.
- **Opens on the Bridge and closes on the Handoff, both near-verbatim** — the strongest match of the three Chapter 2 topics reviewed so far in this pass. Step 0's two lines ("Every rule here was about one missing value at a time. Now: what happens when a row might match several others at once... and all you actually want to know is whether any of them exist.") track the registry `bridge` almost word for word ("Next" → "Now," "and you only want to know" → "and all you actually want to know"). The last two lines of step 5 — "So far every question has been about one table at a time. Next: climbing a hierarchy, one level at a time, until there are no more levels left to climb." — match the `handoff` field exactly, word for word.
- **MIT-professor voice:** reads as spoken teaching prose ("Here's the practical test," "it's worth saying out loud, because it's stricter than people expect") and is clearly distinct from the `index.mdx` prose. Pass.
- **index.mdx format:** frontmatter has `id` and `title`; the five required `<section data-section="...">` blocks are present and in order; depth (the semi-/anti-join definitions, a four-way safety table, the exact planner gating logic quoted from source, the `EXPLAIN` join-type vocabulary including PostgreSQL 18's Right Semi Join, four worked SQL examples contrasting safe and unsafe `NOT IN`, a three-part lab, a five-item production checklist) is comparable to the `io-cost-model` reference topic.
- **prerequisites.mdx:** has the required `data-section="basics"` section plus two further numbered sections, correctly linking both earlier topics in this chapter by their actual folder names. Matches shape.
- **registry-entry.ts:** well-formed `TopicMeta`, `status: 'held'`. Same cosmetic, never-executed import-path issue as the two earlier Chapter 2 topics reviewed in this pass (`import type { TopicMeta } from '../../../../site/src/topics/registry'` uses 4 `../` where the file's depth needs 5) — harmless, and already flagged as a batch-wide sweep-fix candidate; not weighted into this verdict since it has zero effect on the shipped content.

## 4. Flow

- **`uses`/`introduces`/`declared`, `id`, folder, `kind`, `minutes`, bridge and handoff all match `CHAPTER.md`'s topic 3 entry exactly.** `introduces: ['semi-join', 'anti-join', 'null-aware-anti-join-rewrite']` and `uses: ['relational-algebra', 'bag-semantics', 'three-valued-logic', 'not-in-null-trap']` are identical to the plan. All four `uses` ids are confirmed introduced by the two preceding topics in this chapter (`relational-algebra-bag-semantics` and `nulls-three-valued-logic`, both reviewed earlier in this pass and both contract-clean).
- **No id/folder deviation.**
- Nothing else in `uses`/`introduces`/`declared` is wrong; concept sequencing is correct.

## Summary

This is a clean PASS: the single claim doing the most work in the whole topic — PostgreSQL's exact nullability-proof condition for rewriting `NOT IN` as an anti-join — was verified down to the literal source comment and the literal function names in the code beneath it, every other cited source matched exactly, there are no numeric or flow issues, and the narration opens and closes on its bridge/handoff lines about as closely as spoken adaptation allows. The only blemish anywhere is the cosmetic, never-executed import path shared with its two sibling topics in this chapter.
