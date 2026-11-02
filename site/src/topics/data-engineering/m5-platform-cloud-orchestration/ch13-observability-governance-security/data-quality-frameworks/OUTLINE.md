# Outline: Data quality frameworks (`de.data-quality-frameworks`)

**Hook:** the shop adds twelve data-quality checks to `orders` and the nightly pipeline's
runtime doubles; two weeks later a bad partition still reaches the dashboard because the
check that would have caught it ran after publication. Where should each check have run,
and how do you keep the cost from doubling again?

**Predicts:** (1) gate versus post-hoc for a not-null, a freshness and a distribution-drift
check; (2) the cost lever (full rescan vs. incremental metric vs. sample).

## Steps

1. **Hook.** The shop's `orders` pipeline runtime doubles after adding 12 checks; two weeks
   later a bad partition reaches the dashboard anyway because its check ran post-hoc.
2. **Gate vs. post-hoc, defined.** A gate runs inside the pipeline on data in flight and can
   block publication; a post-hoc scan runs after landing, on a schedule, and cannot block —
   it only reports. Chapter 11's write-audit-publish is the pattern that puts a gate before
   publication.
3. **Predict 1.** For a not-null check, a freshness check, and a distribution-drift check:
   which goes in the gate and which runs post-hoc, and why.
4. **Reveal 1.** Not-null is cheap and blocking-worthy → gate. Freshness needs a clock
   outside the run → post-hoc (or a gate with a timeout). Distribution drift needs a
   historical baseline and is expensive → post-hoc, scheduled.
5. **dbt data tests vs. unit tests.** A data test is a SQL select that returns failing rows
   from real built data (unique, not_null, accepted_values, relationships, or a singular
   test); a unit test validates transformation logic against small mocked inputs before the
   model is ever built. Data tests catch bad data; unit tests catch bad logic, earlier and
   cheaper.
6. **The framework landscape.** GX Core (open-source expectation suites — stewardship facts
   quoted with date), Soda 4 (contracts-first, YAML `dataset:`/`checks:`, verified version),
   Deequ/PyDeequ (metric-based: a `VerificationSuite` computes Spark metrics, then evaluates
   assertions on them, and those metrics can be persisted), Databricks DQX (PySpark checks
   for batch and Structured Streaming, same API).
7. **Takeaway 1.** A gate stops bad data before it is read; a post-hoc scan only tells you
   who already read it.
8. **The cost problem.** Checking everything means rescanning everything; cost scales with
   what each check scans, not with how many checks exist.
9. **Predict 2.** Given a full rescan, a per-partition incremental metric, and a 1% sample —
   rank them by cost, and name what each can miss.
10. **Reveal 2 — incremental metrics.** Deequ-style: compute a metric on each new partition
    and merge it with the stored metric instead of rescanning history; `examples.py` shows
    the incremental count equals the full recomputation.
11. **Reveal 2 — sampling's miss.** A sample estimates with a stated error and can miss a
    single rare bad row entirely — the same trade-off as Chapter 5's sketches.
12. **Takeaway 2.** The cheapest check that still catches what you need beats checking
    everything on every row.
13. **Takeaway 3 / Recap.** Where a check runs decides whether it can stop bad data; how a
    check is computed decides what it costs — and incremental and sampled checks both trade
    completeness for that lower cost.

## Coverage mapping (syllabus clause → steps)

- where checks run / cost at scale → steps 2–4, 8
- dbt tests and unit tests → step 5
- GX Core, stewardship → step 6
- Soda 4 contracts-first → step 6
- Deequ/PyDeequ → steps 6, 10
- Databricks DQX → step 6
- incremental metrics and sampling → steps 9–11
