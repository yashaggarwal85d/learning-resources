# REVIEW: NULLs and three-valued logic (`de.nulls-three-valued-logic`)

Independent fact-check. Read: `index.mdx`, `narration.json`, `prerequisites.mdx`, `registry-entry.ts`, and the chapter contract `chapters/data-engineering/m1-foundations/ch02-advanced-sql-query-execution/CHAPTER.md` (topic 2's entry). All nine cited URLs were fetched via the proxy and checked against the specific quote or figure they back.

**Verdict: MINOR_FIX**

## 1. Sources

Every single cited source was reachable, and every direct quotation in the draft — nine separate PostgreSQL documentation pages plus the SQLGlot README — matched exactly.

| # | URL | Reachable? | Supports the claim? |
|---|---|---|---|
| 1 | PostgreSQL 18 docs, §9.1 "Logical Operators" | Yes, 200 | Confirmed exactly: the full `AND`/`OR` truth table (all six rows: TRUE/TRUE→TRUE/TRUE, TRUE/FALSE→FALSE/TRUE, TRUE/NULL→NULL/TRUE, FALSE/FALSE→FALSE/FALSE, FALSE/NULL→FALSE/NULL, NULL/NULL→NULL/NULL) and the `NOT` table (TRUE→FALSE, FALSE→TRUE, NULL→NULL) both match the draft's tables cell for cell. |
| 2 | PostgreSQL 18 docs, §9.2 "Comparison Functions and Operators" | Yes, 200 | Confirmed exactly, three times: "Ordinary comparison operators yield null... For example, 7 = NULL yields null, as does 7 <> NULL"; "For non-null inputs, IS DISTINCT FROM is the same as the <> operator. However, if both inputs are null it returns false... these predicates effectively act as though null were a normal data value, rather than 'unknown'"; and "Do not write expression = NULL because NULL is not 'equal to'..." — all three match the draft's quotes verbatim. |
| 3 | PostgreSQL 18 docs, §7.3.3 "DISTINCT" | Yes, 200 | Confirmed exactly: "two rows are considered distinct if they differ in at least one column value. Null values are considered equal in this comparison." |
| 4 | PostgreSQL 18 docs, §7.5 "Sorting Rows" | Yes, 200 | Confirmed exactly: "By default, null values sort as if larger than any non-null value; that is, NULLS FIRST is the default for DESC order, and NULLS LAST otherwise." |
| 5 | PostgreSQL 18 docs, §9.21 "Aggregate Functions," Table 9.62 | Yes, 200 | Confirmed exactly, three times: "count(*) → bigint: Computes the number of input rows"; "count('any') → bigint: Computes the number of input rows in which the input value is not null"; and "except for count, these functions return a null value when no rows are selected. In particular, sum of no rows returns null, not zero as one might expect." |
| 6 | PostgreSQL 18 docs, `CREATE TABLE` | Yes, 200 | Confirmed exactly: "For the purpose of a unique constraint, null values are not considered equal, unless NULLS NOT DISTINCT is specified." |
| 7 | PostgreSQL 15 release notes | Yes, 200 | Confirmed exactly: the heading "Allow unique constraints and indexes to treat NULL values as not distinct (Peter Eisentraut)" and the body "Previously NULL entries were always treated as distinct values, but this can now be changed by creating constraints and indexes using UNIQUE NULLS NOT DISTINCT" — matches the draft's citation and claim exactly. |
| 8 | PostgreSQL 18 docs, §9.24.2–9.24.3 "IN"/"NOT IN" | Yes, 200 | Confirmed exactly, under the §9.24.3 "NOT IN" heading specifically (not just the parallel "IN" wording): "if there are no equal right-hand values and at least one right-hand row yields null, the result of the NOT IN construct will be null, not true. This is in accordance with SQL's normal rules for Boolean combinations of null values" — matches the draft's quote word for word. |
| 9 | SQLGlot (GitHub README) | Yes, 200 | Confirmed exactly: "SQLGlot is a no-dependency SQL parser, transpiler, optimizer, and engine. It can be used to format SQL or translate between over 30 dialects" — matches the draft's quote and dialect-count claim exactly. |

No dead or misattributed links. This topic's heavy reliance on quoting PostgreSQL's documentation verbatim (nine separate, specific quotes across eight different doc pages) paid off completely under verification — every one matched exactly, including the subtlety of citing the "NOT IN"-specific paragraph rather than the parallel "IN" one.

## 2. Unsupported numbers

None found. This topic makes essentially no free-standing numeric claims — its content is rules and truth tables, not arithmetic — and the lab's row-count checks (`COUNT(*)` vs `COUNT(shipped_at)` must differ by exactly the count of unshipped orders) are specified as correctness assertions to be computed and checked in the build, explicitly marked "measure in build," not asserted as fixed figures here.

## 3. Narration & format

- **Valid JSON**, 7 steps. No digits or symbols found in any spoken line (regex-scanned).
- **Three predict steps with answers** (steps 1, 2, 4, 0-indexed), matching the "full" topic convention.
- **Closes on the Handoff, verbatim.** The last two lines of step 6 — "Every rule here was about one missing value at a time. Next: what happens when a row might match several others at once, and you only want to know whether any of them exist." — match `registry-entry.ts`'s `handoff` field word for word.
- **Opens on the Bridge as a paraphrase, not verbatim — the same pattern as this chapter's topic 1.** `registry-entry.ts`'s `bridge`: "Every operator here assumed every value was present. Next: the value that means 'unknown,' and the three-valued logic it forces on every predicate." Step 0 opens with a close paraphrase of the first sentence ("Every operator in the last topic assumed a value was simply there. In real data, it often isn't."), then adds new illustrative examples not in the bridge (the ship-date and referrer columns) before a loose nod to the second sentence ("SQL has a word for that: unknown"). The bridge's closing clause, "the three-valued logic it forces on every predicate," doesn't land until step 1 ("SQL's logic has three: true, false, and unknown"). This is the second of two reviewed Chapter 2 topics so far with this exact pattern — verbatim handoff, paraphrased-and-delayed bridge — suggesting it may be a deliberate house style for this chapter's narration rather than inconsistent execution; worth a one-line decision (tighten to verbatim, or confirm the paraphrase style is intended) rather than a per-topic fix.
- **MIT-professor voice:** reads as spoken teaching prose ("Now, the part nobody warns you about," "Put that together, and here's the famous one") and is clearly distinct from the `index.mdx` prose. Pass.
- **index.mdx format:** frontmatter has `id` and `title`; the five required `<section data-section="...">` blocks are present and in order; depth (both truth tables, the `IS DISTINCT FROM` fix, all five NULL-handling clauses contrasted explicitly, the `NOT IN` trap derived from the actual propagation rule rather than just asserted, the `COUNT` distinction, a three-part lab, a six-item production checklist) is comparable to the `io-cost-model` reference topic.
- **prerequisites.mdx:** has the required `data-section="basics"` section plus two further numbered sections, correctly linking the prior topic (`relational-algebra-bag-semantics`) by its actual folder name. Matches shape.
- **registry-entry.ts:** well-formed `TopicMeta`, `status: 'held'`. Same broken import path as the previous topic in this chapter: `import type { TopicMeta } from '../../../../site/src/topics/registry'` (4 `../`, should be 5 for a file 5 segments deep under `chapters/`) — worth the same sweep-fix.

## 4. Flow

- **`uses`/`introduces`/`declared`, `id`, folder, `kind`, `minutes`, bridge and handoff all match `CHAPTER.md`'s topic 2 entry exactly.** `introduces: ['three-valued-logic', 'is-distinct-from', 'null-in-clauses', 'not-in-null-trap']` and `uses: ['relational-algebra', 'bag-semantics']` are identical to the plan. Both `uses` ids are confirmed introduced by `de.relational-algebra-bag-semantics` (topic 1, reviewed earlier in this pass, itself contract-clean).
- **No id/folder deviation** — matches `CHAPTER.md` exactly, consistent with topic 1 and (at a glance) the rest of this new chapter's drafts.
- Nothing else in `uses`/`introduces`/`declared` is wrong; concept sequencing is correct.

## Summary

Every one of the nine cited PostgreSQL/SQLGlot sources was checked and matched exactly, including distinguishing the "NOT IN"-specific documentation paragraph from the near-identical "IN" one — the kind of precision that's easy to get subtly wrong and wasn't here. The chapter contract fields are all clean. The verdict is MINOR_FIX only for the same narration bridge-paraphrase pattern already flagged in this chapter's first topic, and the same harmless broken import path.
