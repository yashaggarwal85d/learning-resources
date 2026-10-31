# Outline: Data SLIs, SLOs and error budgets

## Engagement arc

1. **Hook** — a pipeline's own dashboard says every run finished on time all month. The customer-facing report it feeds was actually stale for six of those days, because a downstream materialized view's refresh silently failed. The SLI was measured at the wrong point.
2. **Reveal: the quality dimensions, recapped** — freshness, completeness, validity, uniqueness, consistency, accuracy, each a one-line recap; this topic's new content is turning them into numbers.
3. **Predict: where should freshness actually be measured?** — before the reveal, ask which point in the pipeline a freshness SLI should measure from.
4. **Reveal: the consumer's read point** — measured where a consumer actually reads the data, not where the pipeline writes it; the two diverge exactly when a downstream step silently fails.
5. **Predict: does every table deserve the same target?** — before the reveal, ask whether a customer-facing table and an internal exploration table should share one SLO.
6. **Reveal: SLO targets per tier, and the error budget** — a tier-1 table gets a tighter SLO than a tier-3 table; the SLO's allowed slack is the error budget, spent deliberately by backfills and schema changes.
7. **Reveal: the burn-rate alert, sourced** — the Google SRE Workbook's own recommended rule: a short window at a high burn rate pages fast; a longer window at a lower burn rate catches a slow, still-significant drain with a ticket instead.
8. **Recap** — measure at the read point, size the SLO by tier, spend the budget on purpose, alert on burn rate before it's gone.
9. **Prove it** — this topic's own real thirty-day run: finish-time freshness never notices the outage; read-point freshness does, and the SRE Workbook's own ticket-alert rule fires exactly when it should.

## Deep dives

- **Internals**: the error-budget arithmetic (SLO target, allowed slack, how many days of lateness a given target actually buys); the multi-window multi-burn-rate table's own recommended percentages and windows, and why a single fixed-size window alone trades precision against recall.
- **Frontier**: an error-budget policy as an organizational commitment, not just a number on a dashboard — what a team agrees to do once the budget is actually exhausted, and how a planned backfill (topic 3) or schema change (topic 14) spends budget on purpose rather than by accident.
