# Outline — grain-first dimensional design

1. **Hook.** Two fact tables for the same order, one coarse, one atomic — and a question the coarse
   one simply cannot answer.
2. **Reveal: Kimball's four steps, quoted directly.** Business process, grain, dimensions, facts —
   in that order, each one binding on the next.
3. **Reveal: grain is the pivotal step, quoted directly.** The grain establishes exactly what one
   fact row represents; it becomes a binding contract on the whole design.
4. **Predict.** Should the order-line business process be modeled at one row per order, or one row
   per order line?
5. **Reveal: atomic grain, measured.** One row per order line, run for real: summing the lines
   reproduces the order's own total exactly.
6. **Reveal: what the coarser grain loses.** A table built at one row per order simply has no
   product, quantity or line-level column to answer a line-level question with at all.
7. **Reveal: additive measures, proven.** The line total sums correctly whichever dimension it's
   grouped by — region, or rolled back up to the order — measured directly.
8. **Predict.** Does a quarterly account balance sum the same way across time as it does across
   accounts?
9. **Reveal: semi-additive, measured.** Summing four quarterly balances gives a number with no
   meaning at all; the correct year-end balance is simply the last quarter's own value.
10. **Reveal: non-additive, measured.** A profit margin, averaged naively across two regions, gives
    a different, wrong number than recomputing it from the summed revenue and cost.
11. **Reveal: the fix for non-additive measures, quoted directly.** Store the additive components,
    sum those first, and only then compute the final ratio.
12. **Recap.** Four steps, grain first and binding; additive measures sum anywhere; semi-additive
    sums everywhere except time; non-additive measures don't sum at all, and need their components
    summed instead.
13. **Prove it.** A new measure is a shipping-cost-per-unit ratio. Is it safe to sum it directly
    across orders, or does it need the same component-based fix as the profit margin?
