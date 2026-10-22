# Outline — de.fact-table-types

1. Hook: four fact tables side by side, same shop, four different shapes.
2. Reveal: transaction fact, quoted directly (a row per event, dense or sparse).
3. Predict: does a periodic snapshot still need a row for an account that did nothing today?
4. Reveal: periodic snapshot, measured (every account present, every day, zero activity or not).
5. Reveal: accumulating snapshot, quoted directly (one row, revisited and updated, not re-inserted).
6. Predict: after three milestones, how many rows does the accumulating snapshot have?
7. Reveal: accumulating snapshot, measured (one row throughout, two lag measures computed).
8. Reveal: factless fact, quoted directly (coverage minus activity finds what didn't happen).
9. Reveal: factless fact, measured (a real coverage table minus a real activity table).
10. Predict: which of the four types stays additive under a late update, and which doesn't?
11. Reveal: the additivity verdict (transaction and periodic snapshot stay additive; accumulating
    snapshot's lag measures are recomputed, not summed, on every update).
12. Recap.
13. Prove it: given a new pipeline (a support ticket's open/first-response/closed milestones),
    pick the right fact-table type and justify it.
