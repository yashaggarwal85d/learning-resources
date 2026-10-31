# Fact-check — de.managed-ingestion-tools-build

## Claims against sources

1. **MAR definition and counting rule.**
   Source: Fivetran docs, "Usage-based pricing" (SOURCES.md quotes 1-3). Direct match: "MAR is
   the number of distinct rows synced... in a given calendar month," counted "separately... by
   account, destination, connection, table, activation, and activation sync," and "once a row is
   active, it is only counted once per month... no matter how many updates are made that
   month." `examples.py`'s `mar_cost` function implements exactly this rule: it bills distinct
   keys touched, not update count.

2. **The Fivetran/dbt Labs merger has completed.**
   Source: Fivetran press release (SOURCES.md quote 4). Direct match: "Fivetran... today
   announced the completion of its merger with dbt Labs," dated 1 June 2026. The syllabus's own
   wording ("merging with dbt Labs, announced Oct 2025") is now out of date; this topic states
   the merger as completed, per `CHAPTER.md`'s own instruction to correct this.

3. **dlt's four schema-contract modes.**
   Source: dlt docs, "Schema and data contracts" (SOURCES.md quotes 5-8). Direct match for all
   four: `evolve` ("No constraints on schema changes"), `freeze` ("raise an exception... no data
   will be loaded"), `discard_row` ("discard any extracted row... not loaded"), `discard_value`
   ("discard data in an extracted row... loaded without this data"). `examples.py`'s
   `schema_drift_handling_demonstrated` implements all four against the identical drifted
   record and confirms each one's documented outcome.

4. **A small, fully reprocessed table can cost more than a large, rarely touched one under MAR
   pricing.**
   Measured directly: `mar_pricing_many_small_updates_vs_few_wide_rows` bills a 5,000-row table
   backfilled in full (5,000 distinct keys touched) against a 50,000-row table with a 0.1%
   monthly change rate (50 distinct keys touched); the smaller table's bill is larger despite
   having a tenth of the rows.

5. **MAR cost is independent of how many times a key is updated within the month.**
   Measured directly: `mar_cost_is_update_count_independent` compares the identical 5,000 keys
   updated once against the identical 5,000 keys updated twenty times each; both bill to the
   identical amount.

6. **A dozen distinct failure modes from this chapter's own topics 2-7.**
   Measured directly as a count, not a citation: `connector_failure_modes_a_hand_built_connector_must_handle`
   lists twelve named failure modes, each traceable to a specific earlier topic in this chapter
   (parallel-range skew and snapshot export from topic 2; cursor misses from topic 3; pagination,
   rate limits and token rotation from topic 4; commit protocols and poison files from topic 5;
   checkpoint atomicity and batch ids from topic 6; raw-layer metadata from topic 7).

7. **A sovereignty requirement overrides every other factor in the build-versus-buy decision.**
   Measured directly: `build_vs_buy_decision_rule` checks `sovereignty_required` first and
   returns `"build"` unconditionally when true, before any volume, latency or commonness check
   runs; `build_vs_buy_scenarios_measured` confirms this against three concrete scenarios.

## Predict questions red-teamed

- **Step 2** ("which table costs more under MAR pricing for an identical backfill"): the wrong
  option reasons from total table size. Checked against the measurement: MAR bills only the
  rows actually active in the billing period, and `mar_pricing_many_small_updates_vs_few_wide_rows`
  shows the ten-times-smaller table costing more because its backfill touches every one of its
  rows while the larger table's own change rate stays tiny.

- **Step 10** ("build or buy for a regulated, low-volume, sovereignty-constrained source"): the
  wrong option reasons from volume alone, ignoring the sovereignty constraint. Checked against
  the decision rule itself: `build_vs_buy_decision_rule`'s own first check is
  `sovereignty_required`, which short-circuits every other factor, matching the correct answer
  exactly and matching `build_vs_buy_scenarios_measured`'s own `regulated_core_banking_feed`
  result.

## Scope check against CHAPTER.md / syllabus

The raw syllabus line (`syllabus/data-engineering.md` §8.1) names five clauses: the five named
tools; connector maintenance as the real cost; row/MAR-based pricing; schema-drift handling; and
when to own a connector. All five are addressed: the tools are named and sourced (Fivetran, dlt
quoted directly; Airbyte, Meltano, Kafka Connect named in prose from their own documented
behaviour without being re-measured, since this topic's own `examples.py` cannot run a managed
service); connector maintenance is the measured failure-mode count; MAR pricing and schema drift
are both measured directly; the build-versus-buy decision is the final measured rule. No claim
here depends on Chapter 11's data-contract tooling or the mechanics of topics 9-22 (CDC), both
left untaught here.
