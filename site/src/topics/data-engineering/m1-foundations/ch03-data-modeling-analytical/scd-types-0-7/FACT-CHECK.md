# Fact-check — de.scd-types-0-7

Re-derived from the fetched source texts in `sources/`, each quote re-verified against the live page (`node scripts/sources.mjs check`, 0 problems, 11 quotes). Red-teamed as the adversarial fact-checker, a different role from the one that wrote `OUTLINE.md`.

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Type 0: value never changes; for "original"-labeled attributes, durable identifiers, most date-dimension attributes | Confirmed, quoted directly | Kimball "Type 0: Retain Original" |
| 2 | Type 1: overwrite, destroys history, easy to implement with no new rows, aggregates/cubes must be recomputed | Confirmed, quoted directly | Kimball "Type 1: Overwrite" |
| 3 | Type 3: adds a new attribute to preserve the old value, main attribute overwritten like Type 1, called an "alternate reality," used relatively infrequently | Confirmed, quoted directly | Kimball "Type 3: Add New Attribute" |
| 4 | Type 4: a rapidly changing attribute group split off to a mini-dimension ("rapidly changing monster dimension"), own primary key, both keys in the fact table | Confirmed, quoted directly | Kimball "Type 4: Add Mini-Dimension" |
| 5 | Type 5: Type 4 plus a current Type 1 reference embedded in the base dimension, read without a fact-table join, logically one presentation-layer table | Confirmed, quoted directly | Kimball "Type 5: Add Mini-Dimension and Type 1 Outrigger" |
| 6 | Type 6: Type 2 plus current Type 1 versions of the same attributes embedded on the row, overwritten on all rows for the durable key when the current value changes | Confirmed, quoted directly | Kimball "Type 6: Add Type 1 Attributes to Type 2 Dimension" |
| 7 | Type 7: dual keys (surrogate for Type 2, durable for current), same functionality as Type 6 via two views, no overwrite | Confirmed, quoted directly | Kimball "Type 7: Dual Type 1 and Type 2 Dimensions" |
| 8 | "5 because 4+1=5"; "6 because both 2+3+1 and 2×3×1 equal 6"; Type 7 delivers the same functionality as Type 6 via dual keys instead of physically overwriting | Confirmed, quoted directly | Kimball Design Tip #152 |
| 9 | The SCD choice is a per-attribute governance decision made with the business; not every change needs history, but many do | Confirmed, quoted directly | Kimball Design Tip #152 |
| 10 | All mini-dimension sizing, row-count, and update-cost numbers (9 combos, 5 observed, 160 vs. 45 rows, 6 vs. 0 rows updated) | Confirmed, this topic's own disclosed worked scenario, internally consistent (`python3 examples.py`), no lab of its own per `CHAPTER.md` | `examples.py` |

## Red team

- **Predict 1 (step 4, "can one column hold both values without a new row?").** Tried the counter-argument that Type 3's "alternate reality" column is really just a second Type 1 column, no different from Type 1 — broken by Kimball's own distinction: Type 3 *keeps* the old value in a second column while Type 1 discards it entirely; the quote is explicit that Type 3 "preserves" the old value.
- **Predict 2 (step 7, "does a shared rapidly-changing group force Type 2's cost onto the whole dimension?").** Tried the counter-argument that Type 2 on a single frequently-changing column is fine, so a group of columns shouldn't be different — correct for a single narrow attribute (that is exactly Type 2's own case, used as the "Prove it" step 14's answer), but breaks down specifically because Type 4's definition is about a *group* of attributes shared in pattern across rows, where Type 2 would duplicate every other base-dimension attribute on every change, not just the changing columns.
- **Predict 3 (step 10, "can Type 6 and Type 7 both deliver the same reporting at different cost?").** Tried the counter-argument that dual keys (Type 7) must cost more somewhere since nothing is free — true at query time (Type 7 needs two different joins depending on perspective, read as two views) but false at write time, which is the cost this topic counts: Type 6 pays by overwriting every prior row for the durable key; Type 7 pays nothing at write time because it never rewrites history.
- **Currency check:** all seven Kimball technique pages and Design Tip #152 (2013, naming the type numbers formally with the third edition of *The Data Warehouse Toolkit*) are live on kimballgroup.com as of 2026-10-22 and unchanged in substance from the second edition's informal treatment; no newer Kimball Group material supersedes these names.
- No corrections were needed; all ten claims stand as drafted in `OUTLINE.md`.
