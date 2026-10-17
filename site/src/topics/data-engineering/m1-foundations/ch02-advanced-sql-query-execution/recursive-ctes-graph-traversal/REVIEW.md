# REVIEW: Recursive CTEs and graph traversal (`de.recursive-ctes-graph-traversal`)

Independent fact-check. Read: `index.mdx`, `narration.json`, `prerequisites.mdx`, `registry-entry.ts`, and the chapter contract `chapters/data-engineering/m1-foundations/ch02-advanced-sql-query-execution/CHAPTER.md` (topic 4's entry). All three cited sources were fetched via the proxy and checked line-by-line, including comparing the draft's SQL examples character-for-character against PostgreSQL's own documented examples.

**Verdict: PASS**

## 1. Sources

| # | URL | Reachable? | Supports the claim? |
|---|---|---|---|
| 1 | PostgreSQL 18 docs, §7.8.2 "Recursive Queries" | Yes, 200 | Confirmed exactly, six separate times: "While RECURSIVE allows queries to be specified recursively, internally such queries are evaluated iteratively"; "it is important to be sure that the recursive part of the query will eventually return no tuples, or else the query will loop indefinitely... often a cycle does not involve output rows that are completely duplicate"; "There is built-in syntax to simplify cycle detection"; "The recursive query evaluation algorithm produces its output in breadth-first search order. However, this is an implementation detail and it is perhaps unsound to rely on it"; "A useful example is this query to find all the direct and indirect sub-parts of a product"; and "A helpful trick for testing queries when you are not certain if they might loop is to place a LIMIT in the parent query... Using this trick in production is not recommended, because other systems might work differently... it usually won't work if you make the outer query sort the recursive query's results or join them to some other table." Beyond the prose, the draft's `search_graph` SQL example (columns `id, link, data, depth, is_cycle, path`, the `ARRAY[g.id]` seed, `g.id = ANY(path)`, `path || g.id`, `WHERE g.id = sg.link AND NOT is_cycle`) was compared character-for-character against the documentation's own worked example and matches exactly, as does the `CYCLE id SET is_cycle USING path` syntax and the stated fact that it is "internally rewritten to the above form." |
| 2 | PostgreSQL 14 Release Notes | Yes, 200 | Confirmed exactly: "The SQL-standard SEARCH and CYCLE options for common table expressions have been implemented" and "Add SQL-standard SEARCH and CYCLE clauses for common table expressions (Peter Eisentraut)," with "Release date: 2021-09-30" matching the draft's dated citation exactly. |
| 3 | DuckDB docs, "Recursive CTEs" (which also covers "Graph Traversal" on the same page) | Yes, 200 | Confirmed exactly: "the query must be formulated in a way that ensures termination, otherwise, it may run into an infinite loop"; the exact cycle guard `WHERE list_position(paths.path, node2id) IS NULL`; and "the result of this query is not restricted to shortest paths, e.g., for node 5, the results include paths [1, 5] and [1, 3, 5]" — all match the draft's quotes and claims exactly. |

No dead or misattributed links. This topic reproduces two of PostgreSQL's own documented SQL examples verbatim (the bill-of-materials query and the full `search_graph` cycle-detection query) and both were checked character-for-character against the live docs page — both match exactly, which is the strongest form of source verification available for a worked-example-heavy topic like this.

## 2. Unsupported numbers

None found. The topic's numeric content is either the chapter's fixed running-example parameters (illustrative query literals like `product_id = 4242` or `customer_id = 7`, used only to make the worked examples concrete, not asserted as real facts) or sourced exactly as shown above (the PostgreSQL 14 release date, the `LIMIT 100` debugging example reproduced from the docs). The lab's expected outcomes (shared-component totals, row-count growth under fan-out) are correctly marked "measure in build" rather than asserted as fixed figures.

## 3. Narration & format

- **Valid JSON**, 6 steps. No digits or symbols found in any spoken line (regex-scanned).
- **Two predict steps with answers** (steps 2, 4, 0-indexed) — within the chapter's "2–4 predict questions" range.
- **Opens on the Bridge and closes on the Handoff, both near-verbatim.** Step 0 ("So far, every question has been about one table at a time. Now: climbing a hierarchy, one level at a time, until there are no more levels left to climb.") matches the registry `bridge` almost word for word (a comma and "Now" for "Next" are the only differences). The last two lines of step 5 — "Every question so far has produced one row per group, or one row per path. Next: splitting one aggregate into several, at several levels, all in a single pass over the data." — match the `handoff` field exactly, word for word.
- **MIT-professor voice:** reads as spoken teaching prose ("The fix is almost embarrassingly simple," "But don't confuse that with a second, very different problem") and is clearly distinct from the `index.mdx` prose. Pass.
- **index.mdx format:** frontmatter has `id` and `title`; the five required `<section data-section="...">` blocks are present and in order; depth (the exact fixpoint algorithm stated as a numbered procedure, a bill-of-materials worked example, a graph-reachability example on the chapter's own referral-graph column, the full path-array cycle-detection mechanism, the standard `SEARCH`/`CYCLE` sugar and DuckDB's lack of it, a clear separation of the two distinct failure modes with a correctly-reasoned non-bug case, the `LIMIT` debugging trick with its production caveats, a four-part lab, a five-item production checklist) is comparable to the `io-cost-model` reference topic, and arguably exceeds it in worked-example density.
- **prerequisites.mdx:** has the required `data-section="basics"` section plus two further numbered sections, correctly linking the prior topic in this chapter by its actual folder name. Matches shape.
- **registry-entry.ts:** well-formed `TopicMeta`, `status: 'held'`. Same cosmetic, never-executed import-path issue shared by every Chapter 2 topic reviewed in this pass (4 `../` where 5 are needed) — harmless and already flagged as a batch-wide sweep-fix candidate.

## 4. Flow

- **`uses`/`introduces`/`declared`, `id`, folder, `kind`, `minutes`, bridge and handoff all match `CHAPTER.md`'s topic 4 entry exactly.** `introduces: ['recursive-cte-fixpoint', 'bom-explosion', 'graph-reachability-sql', 'cte-cycle-detection']`, `uses: ['relational-algebra', 'bag-semantics']`, `declared: ['sql-select', 'graph-basics']` are identical to the plan. Both `uses` ids are confirmed introduced by `relational-algebra-bag-semantics` (topic 1, reviewed earlier in this pass and contract-clean).
- **No id/folder deviation.**
- Nothing else in `uses`/`introduces`/`declared` is wrong; concept sequencing is correct, and the (non-hard) link to topic 3's referral-column example for continuity is correctly flagged as "not a hard dependency" in `prerequisites.mdx` rather than overstated in `uses`.

## Summary

Another clean PASS: every cited source matched exactly, and — notably — two full SQL examples in the draft were verified character-for-character against PostgreSQL's own documented queries rather than just the surrounding prose, which is a stronger check than most topics in this pass support. The chapter-contract fields are clean and both bridge and handoff are near- or fully-verbatim. The only blemish is the same cosmetic, never-executed import path shared by every topic in this chapter.
