# OUTLINE — de.late-arriving-facts-dimensions

## Learning outcomes

1. Build and later-update an inferred dimension member for a fact that arrived first.
2. Join a backdated fact to the correct historical SCD2 version of its dimension, not the current one.
3. Justify a bounded reprocessing window for a real pipeline.

Running example: an orders fact and a customer dimension. Part one: a fact referencing a
customer that doesn't exist yet. Part two: a different customer's address history (three real
SCD2 versions), and a fact dated inside the middle version's own window.

## Steps and storyboard (13 steps)

1. **Hook.** A fact row arrives; the customer it names has no dimension row yet. `fig`: a fact with a dangling key.
2. **Reveal: the inferred member, quoted directly.** Kimball's "Late Arriving Dimension" quote: a placeholder row with unresolved natural key and generic unknown values, so the fact can post immediately.
3. **Reveal: the inferred member, measured.** Real insert: one placeholder dimension row, one fact row loaded against it, right away. **Takeaway.**
4. **Predict (index 3): when the real customer data shows up later, does it get a new row or an update to the existing one?** Wrong answer: a new row (that's what Type 2 would do). Right: a Type 1 overwrite, since this is resolving a placeholder, not recording a real change.
5. **Reveal: the resolve, measured.** The same row, overwritten in place; row count unchanged; the placeholder's flag clears.
6. **Reveal: retroactive Type 2 changes are late-arriving data too, quoted directly.** Kimball: a retroactive Type 2 change needs a new dimension row and the associated facts restated.
7. **Predict: does a backdated fact get the customer's current address, or whichever one was true then?** Wrong answer: current (facts always get "the" dimension row). Right: the version in effect when the event happened.
8. **Reveal: the late arriving fact, quoted directly.** Kimball: find the dimension keys effective when the late event occurred.
9. **Reveal: the as-of join, measured.** Real three-version history; a naive join to the current row lands on the wrong version; a join on the event's own date lands on the right one. **Takeaway.**
10. **Predict: can a pipeline just search all of history for every late fact, no matter how late it is?** Wrong answer: yes, always search everything. Right: no — unbounded reprocessing is unbounded cost; every real strategy needs a named limit.
11. **Reveal: the bounded reprocessing window.** Apache Beam's allowed-lateness mechanism, quoted directly, as one concrete instance of the same idea warehouses need: a named horizon, past which a late fact is handled some other way (left on its inferred/unknown treatment, or routed to manual review) rather than reprocessed indefinitely. **Takeaway.**
12. **Recap.**
13. **Prove it.** A new scenario: a correction to an order placed inside the oldest of the three versions arrives after the reprocessing window has closed. What happens to it?

## Engagement arc

- Hook: step 1.
- First predict: step 4 (index 3).
- Three predicts: steps 4, 7, 10.
- Takeaways: steps 3, 9, 11.
- Recap: step 12.

## Post-notes headings

- **Outcomes.**
- **Internals:** why an inferred member must be resolved with a Type 1 overwrite, never a Type 2 new row — the placeholder was never a real "version" of the customer, just a stand-in.
- **Lab:** the inferred-member resolve and the as-of join are both real, executed on a throwaway schema (no lab of its own beyond that, per CHAPTER.md).
- **Production:** the real failure — a pipeline that always joins facts to "the" dimension row (whichever `is_current = true`) silently mis-attributes every backdated fact to the wrong historical context.
- **Frontier:** streaming systems formalize the same tradeoff as "allowed lateness" / watermarks.
- **Where this goes next:** topic 16, from warehouse to lake to lakehouse.

## Bridge and handoff (from CHAPTER.md)

- Bridge: "Every SCD type here assumed a dimension row's own data was itself correct and on time. This topic is what happens when it genuinely isn't..."
- Handoff: "Every topic in this section built tables assuming a warehouse's own physical home was already settled. Next: zooming out to that home itself..."

## Concept ledger

- Introduces: `inferred-dimension-member`, `backdated-fact-scd2-mapping`, `bounded-reprocessing-window`.
- Uses: `scd-type-2`, `fact-grain`.
- Declared: `sql-select`.

## Claims list

1. A late-arriving fact gets an inferred/placeholder dimension row with unresolved natural key and generic unknown attributes, later resolved by a Type 1 overwrite. Source: Kimball "Late Arriving Dimension".
2. A retroactive Type 2 change is also late-arriving dimension data, needing a new row and fact restatement. Source: Kimball "Late Arriving Dimension".
3. A late-arriving fact must be joined to the dimension keys effective when the event occurred, found by searching the relevant dimension(s). Source: Kimball "Late Arriving Fact".
4. A bounded lateness horizon is a standard, named mechanism in streaming systems (Beam's `.withAllowedLateness`), illustrating the same tradeoff late-arriving warehouse data needs. Source: Apache Beam Programming Guide.
5. The inferred-member insert/resolve and the as-of join numbers: measured directly on this session's sandbox (examples.py).
