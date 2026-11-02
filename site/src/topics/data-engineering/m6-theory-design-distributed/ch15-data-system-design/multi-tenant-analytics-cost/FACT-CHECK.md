# Fact-check — de.multi-tenant-analytics-cost

## Claims re-derived against the source

1. **Snowflake's `QUERY_ATTRIBUTION_HISTORY` view can be used to determine the compute cost of
   a given query run on a warehouse.** SOURCES.md's quote supports this directly. Checked step
   8's "a bill split into per-tenant slices from the engine's own metering view" doesn't
   overclaim what the view covers — it attributes compute cost per query, which this topic
   explicitly treats as one input to the allocation, not the whole bill.

2. **Snowflake documents `CREDITS_ATTRIBUTED_COMPUTE` as the number of credits attributed to a
   query, and explicitly excludes warehouse idle time.** SOURCES.md's quote supports this
   directly — `CHAPTER.md` itself names this exact exclusion as required to quote. Checked step
   8's "grey idle and shared remainder" is derived directly from this exclusion: the view itself
   documents that it does not cover idle time, which is exactly the gap this topic's remainder
   policy exists to address, not an invented problem.

3. **Google Cloud documents BigQuery's `total_bytes_billed`, `total_slot_ms` and `labels`
   fields as stated.** SOURCES.md's quotes support this directly. Checked the topic doesn't
   claim BigQuery's metering excludes idle time the way Snowflake's does — the topic only uses
   `labels` as the named mechanism for tagging a job to a tenant, and `total_bytes_billed`/
   `total_slot_ms` as the two signals allocated per tenant, without asserting a Snowflake-style
   idle exclusion for BigQuery specifically (BigQuery's own slot-based pricing model works
   differently, which this topic does not overstate).

4. **The isolation-spectrum pricing, the noisy-neighbour simulation under three fairness rules,
   the retention-coupled-to-isolation framing, and the unattributable-remainder policy are this
   chapter's own established method and this topic's own derived design.** Not an independent
   citation beyond claims 1-3 — `CHAPTER.md`'s own scope line states the three-rung spectrum,
   the fairness-rule comparison, the retention/erasure coupling, and the remainder policy as
   this topic's own worked design, not re-derived here.

## Red-team pass on the predict questions

- **Predict 1 (step 2):** the wrong option ("a bigger warehouse") is a genuine, plausible first
  instinct — more compute does reduce query latency — but it's ruled out because it doesn't
  touch either actual gap the hook names: a bigger warehouse still lets one tenant consume the
  whole thing (no isolation), and still produces no per-tenant number (no metering). The correct
  option names both gaps directly.
- **Predict 2 (step 10, "Prove it"):** checked that "move every tenant up a rung preemptively"
  is ruled out directly against claim 4's own framing — step 4 already established that the
  rung choice is driven by a named constraint (regulated, noisy), not by tenant count alone, so
  moving everyone up multiplies cost for tenants that triggered no constraint. The correct
  option (watch the metering overhead itself) follows from claim 2's own exclusion: a metering
  view has its own real cost and granularity tradeoff, which scales with query count, so it can
  itself become the next bottleneck the design must watch.

## Illustrative numbers (figs for steps 1, 3, 5, 10)

The hook's "4,000 sellers," "mostly idle," the isolation-spectrum's priced comparison at "a
small and a large tenant count," the noisy-neighbour simulation's "many times its normal load,"
and the "ten times" growth in step 10 are illustrative, stated lab numbers for the storyboard
and the simulation in `examples.py`, not cited real-world figures — no claim is made about any
specific company's actual tenant count, warehouse utilization, or cost breakdown.

## Outcome

No open findings. Every claim about Snowflake's and BigQuery's own metering fields traces to
one of SOURCES.md's six verbatim quotes across two sources (Snowflake's own documentation,
Google Cloud's own documentation); the isolation spectrum, the fairness-rule comparison, the
retention/erasure coupling, and the remainder policy rest on `CHAPTER.md`'s own stated scope,
not an unsourced factual claim; both predicts are checked against the topic's own cited
mechanisms rather than invented reasoning.
