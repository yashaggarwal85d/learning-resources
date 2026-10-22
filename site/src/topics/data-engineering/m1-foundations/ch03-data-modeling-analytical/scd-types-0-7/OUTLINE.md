# OUTLINE — de.scd-types-0-7

## Learning outcomes

1. Implement Types 0, 1 and 3 and state what each discards compared to Type 2.
2. Build a Type 4 mini-dimension for a rapidly changing attribute group, and show why it stays small while a Type 2 treatment of the same attributes would not.
3. Name hybrids 5, 6 and 7 as the specific combination of simpler types each actually is (5 = 4+1, 6 = 2+3+1, 7 = 2 with a durable-key join), and state the one real cost difference between 6 and 7.
4. Choose the right SCD type for a given query pattern and attribute churn rate, applied to three concrete scenarios.

Running example: a customer dimension with two attribute groups — `signup_channel` (never meaningfully changes), `phone_number` (corrected, not versioned), `sales_region` (occasionally reclassified, old value worth comparing once), and `income_tier` + `marketing_channel` together (a rapidly-changing pair, the Type 4 mini-dimension candidate). This keeps every type grounded in the same dimension rather than a new example per type.

## Steps and storyboard

1. **Hook — "Not every change deserves a new row."** `fig`: the cost of treating every attribute like Type 2. Portrait: the Type 2 version-bar picture from topic 13, now with a counter climbing fast. Landscape: same, counter on the right. Moves: `Plot` the counter climbing as more "rapidly changing" attribute pairs are added. Caption: Type 2 is correct, but applying it to everything is not free.

2. **Reveal: Type 0, quoted directly.** `fig`: a locked padlock icon over one column. Kimball's Type 0 quote (original value, never changes; durable identifiers, most date-dimension attributes). Moves: `Decode` the quote, `Draw` the locked column.

3. **Reveal: Type 1, quoted directly.** `fig`: one column overwritten in place, old value crossed out. Kimball's Type 1 quote (overwrite, destroys history, must recompute aggregates). Moves: `Decode` the quote, `Draw` the old value struck through as the new one lands.

4. **Predict: can one column hold both the current value and the original, without adding a new row?** (index 3, within the first four.) The red-teamed wrong answer: no, you'd need a second row. Reveal: yes — one *extra column* for the alternate value, same row.

5. **Reveal: Type 3, quoted directly.** `fig`: two columns, "current" and "alternate reality," same row. Kimball's Type 3 quote (add new attribute, alternate reality, overwrites main attribute like Type 1, used relatively infrequently). Moves: `Draw` the second column appearing beside the first.

6. **Reveal: the gallery, one change, four treatments, counted.** `fig`: the same `sales_region` reclassification run through Types 0, 1, 2 and 3 side by side. Counted: rows after the change (Type 0: 1, Type 1: 1, Type 2: 2, Type 3: 1) and columns touched (Type 0: 0, Type 1: 1, Type 2: 0 — a new row, not a column — Type 3: 1 new + 1 overwritten). **Takeaway:** the four basic types differ only in whether the old value is kept, and if so, in a row or a column.

7. **Predict: does a rapidly changing, shared attribute group force Type 2's row-per-change cost onto the whole wide dimension?** The red-teamed wrong answer: no, Type 2 scales fine for any attribute. Reveal: yes, for a *group* of attributes that changes often and is shared in pattern across many rows — Type 2 on the base dimension would duplicate every other base attribute on every change.

8. **Reveal: Type 4, quoted directly — the mini-dimension, counted.** `fig`: `income_tier` × `marketing_channel` split into their own small table. Kimball's Type 4 quote (rapidly changing monster dimension, split off, own primary key, both keys in the fact table) plus Design Tip #152's framing (volatile attribute values, frequently-used attributes in multimillion-row dimensions). Counted: the mini-dimension holds only the profile combinations actually observed (5 of 9 possible `income_tier` × `marketing_channel` pairs), and stays at that size regardless of how many customers or changes occur, versus the base-dimension-grows-forever alternative (40 customers × 3 changes each = 120 full wide rows, if Type 2 had been used on these two columns directly on the base dimension). **Takeaway:** a mini-dimension is bounded by the attributes' own combinations, not by how many rows or changes reference it.

9. **Reveal: Type 5, quoted directly — current without a fact join.** `fig`: a Type 1 arrow from the base dimension straight to the mini-dimension's current row. Kimball's Type 5 quote and Design Tip #152's "4 + 1 = 5" framing (mini-dimension plus a current, Type-1-overwritten reference embedded in the base dimension). **Takeaway:** Type 5 is Type 4 plus one Type 1 pointer — not a new mechanism, a combination of the first two.

10. **Predict: can Type 6 and Type 7 both deliver current-plus-historical reporting from the same dimension, at different costs?** The red-teamed wrong answer: no, only one mechanism can do this. Reveal: yes — same functionality, different cost, because one physically overwrites and the other just adds a second key.

11. **Reveal: Type 6 and Type 7, quoted directly — the update cost, counted.** `fig`: a customer's six accumulated Type 2 version-rows; Type 6 overwrites the current-value column on all six when the current value changes; Type 7 touches none of them, joining through a durable key instead. Kimball's Type 6 quote (2+3+1=6, current attribute systematically overwritten on all prior rows for the durable key) and Design Tip #152's arithmetic ("both 2 + 3 + 1 and 2 × 3 × 1 equal 6"), plus Type 7's quote (dual keys, same functionality, no overwrite) and Design Tip #152's framing ("delivers the same functionality as type 6, but accomplished via dual keys instead of physically overwriting"). Counted: Type 6 updates all 6 prior rows; Type 7 updates 0. **Takeaway:** Type 6 and Type 7 answer the same question with the same information; they differ only in whether history itself gets rewritten to answer it.

12. **Reveal: choosing by churn and query pattern, applied to three scenarios.** `fig`: a small decision table. Design Tip #152's framing (per-attribute governance decision; not every change needs history, but many do) applied to: (a) `signup_channel`, which never meaningfully changes → Type 0; (b) a mistyped `phone_number`, where the wrong value has no analytic worth → Type 1; (c) `income_tier` + `marketing_channel` together, changing often and shared across many customers, needed for both current segmentation and some historical analysis → Type 4, extended to Type 5 once "current without a join" is also needed.

13. **Recap.** The three takeaways plus: the hybrids are not new mechanisms, they are named combinations of Types 1, 2, 3 and 4 (5 = 4+1, 6 = 2+3+1, 7 = 2 plus a durable-key join).

14. **Prove it.** A new scenario, not demonstrated above: a `loyalty_tier` attribute changes about as often as `income_tier` but is tracked alone (not in a shared group) and queries always need the exact historical value at the time of each sale, never the current one. Which type? (Type 2 — no mini-dimension is justified for a single attribute tracked alone with no "current" requirement, and the historical-accuracy requirement is exactly Type 2's case, not Type 6/7's.)

## Engagement arc

- Hook: step 1, the cost of applying Type 2 everywhere.
- First predict: step 4 (index 3), within the first four.
- Three predicts total: steps 4, 7, 10, each red-teamed with the specific wrong answer and why it's tempting.
- Surprising number: step 8's bounded mini-dimension (5 of 9 combinations, flat regardless of scale) against the unbounded alternative (120 wide rows).
- Takeaways: steps 6, 8, 9, 11 (four, above the minimum of three).
- Recap: step 13.

## Post-notes headings

- **Outcomes:** the four outcomes above, restated plainly.
- **Internals:** why Kimball assigned type *numbers* to combinations rather than new names (Design Tip #152's own framing), and why 5/6/7 are arithmetic on 1/2/3/4, not independent inventions.
- **Lab:** none of this topic's own (per CHAPTER.md); points back to topic 13's real MERGE lab for Type 2 mechanics, and forward to where a Type 4/5/6/7 load would be built in practice.
- **Production:** the real failure this topic warns about — picking Type 2 by default for every attribute without checking churn rate, and ending up with a dimension that grows without bound; and the opposite failure — Type 1 on an attribute a report later needs history for, with no way to recover it.
- **Frontier:** modern warehouses' native support for these patterns (e.g. dbt snapshots implement Type 2 directly; some warehouses' "time travel" is not a substitute for a modeled current flag because it expires).
- **Where this goes next:** topic 15, late-arriving facts and dimensions — what happens when a dimension row this chapter assumed was correct and on time, isn't.

## Examples to execute (examples.py)

All of this topic's numbers are a worked, disclosed combinatorial scenario computed directly in Python (this topic has no lab of its own, per `CHAPTER.md`) — not a claim about a real running system. Disclosed as such in `SOURCES.md` and `coverage.json`.

- `FULL_CARTESIAN_COMBOS` = 3 income tiers × 3 marketing channels = 9.
- `MINI_DIM_ROWS_OBSERVED` = 5 (the distinct combinations actually seen among the worked customer set).
- `CUSTOMERS_COUNT` = 40, `CHANGES_PER_CUSTOMER` = 3 → `TOTAL_PROFILE_CHANGES` = 120.
- `WIDE_ROWS_IF_TYPE2_EMBED` = `CUSTOMERS_COUNT` + `TOTAL_PROFILE_CHANGES` = 160 (one original wide row per customer, plus one full wide duplicate row per change, if Type 2 had been applied directly to the base dimension for these two columns).
- `MINI_DIM_PLUS_BASE_ROWS` = `CUSTOMERS_COUNT` + `MINI_DIM_ROWS_OBSERVED` = 45 (the base dimension never grows past one row per customer; the mini-dimension never grows past its observed combinations).
- `HISTORICAL_VERSIONS_FOR_ONE_CUSTOMER` = 6 (a durable key's accumulated Type 2 rows).
- `TYPE6_ROWS_UPDATED_ON_CURRENT_CHANGE` = 6 (all of them).
- `TYPE7_ROWS_UPDATED_ON_CURRENT_CHANGE` = 0.
- Basic-type row/column counts for the gallery (step 6): all small literal constants, asserted for internal consistency (e.g. Type 2's row count after one change is 2, matching topic 13).

## Bridge and handoff

- **Bridge** (from `CHAPTER.md`, answers topic 13's handoff): "Type 2 was one specific point on a much larger menu of ways to handle a changing attribute. This topic is the full SCD 0 through 7 menu that Type 2 is one point in, and how to choose a different point by query pattern and churn rate."
- **Handoff** (from `CHAPTER.md`): "Every SCD type here assumed a dimension row's own data was itself correct and on time. Next: what happens when it genuinely isn't — facts that arrive before their own dimension row exists, or that arrive late enough to require mapping them onto a dimension's own historical versions."

## Concept ledger

- **Introduces:** `scd-types-0-1-3-4-5-6-7`.
- **Uses:** `scd-type-2`, `hash-diff-change-detection`.
- **Declared:** `sql-select`.

## Claims list

1. Type 0 — value never changes; for "original" attributes, durable identifiers, most date-dimension attributes. Source: Kimball "Type 0: Retain Original".
2. Type 1 — overwrite, destroys history, must recompute aggregates/cubes. Source: Kimball "Type 1: Overwrite".
3. Type 3 — add new attribute, "alternate reality," overwrites main attribute like Type 1, used relatively infrequently. Source: Kimball "Type 3: Add New Attribute".
4. Type 4 — mini-dimension for a rapidly changing attribute group ("rapidly changing monster dimension"), its own primary key, both keys in the fact table. Source: Kimball "Type 4: Add Mini-Dimension".
5. Type 5 — mini-dimension plus a Type 1 "current" reference embedded in the base dimension; logically one table in the presentation layer. Source: Kimball "Type 5: Add Mini-Dimension and Type 1 Outrigger".
6. Type 6 — Type 2 plus current Type 1 attributes embedded on every row for a durable key, overwritten on all of them when the current value changes. Source: Kimball "Type 6: Add Type 1 Attributes to Type 2 Dimension".
7. Type 7 — dual keys (surrogate for Type 2, durable for current), same functionality as Type 6 without overwriting. Source: Kimball "Type 7: Dual Type 1 and Type 2 Dimensions".
8. "5 because 4+1=5"; "6 because both 2+3+1 and 2×3×1 equal 6"; "7 delivers the same functionality as type 6, but accomplished via dual keys instead of physically overwriting." Source: Kimball Design Tip #152.
9. Per-attribute governance: the choice is made per column, and not every change needs history, but many do. Source: Kimball Design Tip #152.
10. All combinatorial/row-count numbers in the gallery and the mini-dimension sizing: this topic's own worked scenario, computed in `examples.py`, no lab of its own per `CHAPTER.md`.
