# Outline: Compute cost controls and commitments

**Syllabus line (syllabus/data-engineering.md):** "BigQuery editions with slot reservations/autoscaling vs on-demand bytes, Snowflake warehouse sizing, auto-suspend and resource monitors, Databricks budget policies, max-bytes-billed guardrails, spot/preemptible with interruption-safe engines (§12.2), committed-use/savings plans vs flexibility; cost regressions as CI failures."

## Claims to fact-check

1. A BigQuery query's bytes billed can be capped with the maximum bytes billed setting: the number of bytes the query would read is estimated before execution, and a query whose estimate exceeds the limit fails without incurring a charge (Google Cloud: Estimate and control costs).
2. For a clustered table, that estimate is an upper bound and can exceed the actual bytes billed after running, so a clustered-table query can fail under the limit even when its real cost would have stayed under it (Google Cloud: Estimate and control costs).
3. A Snowflake warehouse's credit usage doubles with each size increase per full hour, but Snowflake bills per-second with a 60-second minimum, so a warehouse is only billed for credits it actually consumes (Snowflake: Overview of warehouses).
4. Snowflake warehouses auto-suspend when inactive for a specified period (by default) and auto-resume on the next query, which is what stops a warehouse from billing while idle (Snowflake: Overview of warehouses).
5. A Snowflake resource monitor tracks credit usage by warehouses and can trigger alerts, suspend standard warehouses, or disable Adaptive Warehouses at a threshold — but it works for warehouses only, not serverless features, which need a budget instead (Snowflake: Working with resource monitors).
6. Databricks serverless usage policies attach tags to serverless compute activity, logged in billing records, to attribute usage to specific budgets — automatically applied when a user has only one policy (Databricks: Attribute usage with serverless usage policies).
7. Google Cloud Spot VMs offer discounts up to 91% versus on-demand, in exchange for Compute Engine's right to preempt them at any time, making them suited to fault-tolerant workloads like batch jobs (Google Cloud: Spot VMs).
8. A Spot VM preemption sends a metadata signal first, then (with the recommended 120-second notice duration for workloads needing more than 30 seconds) a shutdown signal; the shutdown period itself is best-effort and up to 30 seconds (Google Cloud: Spot VMs; Google Cloud: Create and use Spot VMs).
9. A Google Cloud committed-use discount trades a 1- or 3-year spend or resource commitment for a discounted rate, with standard spend-based CUDs discounting until the hourly committed spend amount is met (Google Cloud: Committed use discounts).

## Changes from the chapter plan

The real syllabus line keeps a trailing cross-reference, "(§12.2)", right after "spot/preemptible with interruption-safe engines", that CHAPTER.md's own paraphrase drops. This topic's `coverage.json` maps that parenthetical as a forward-reference clause to "Spark on Kubernetes internals" (§12.2's own treatment of spot-node executor decommissioning) rather than re-teaching it here.

A second note: this topic cannot provision real BigQuery, Snowflake, Databricks or Compute Engine accounts in this sandbox. Every claim about billing, guardrails, preemption mechanics and commitment discounts is sourced directly from each vendor's own current documentation. The worked reproduction (`examples.py`) models the documented *mechanisms* themselves — a max-bytes-billed guardrail, a resource-monitor-style suspend threshold, a spot-preemption retry loop, a commitment break-even calculation, and a cost-regression CI gate — as a disclosed, structural simulation against synthetic data, rather than a live billing account.

## Engagement arc

Hook: a single mistyped query with no LIMIT and no partition filter scans an entire multi-terabyte table on an on-demand billing model and costs more than the whole team's prior month, with nothing stopping it until the bill arrives — replayed against the same query with a per-query byte cap configured, which fails fast with a clear error and zero cost instead. Early prediction: before the guardrails, ask which of several controls actually stops a cost before it's incurred versus merely alerting after. Teaching: BigQuery's slots/editions vs on-demand and the max-bytes-billed guardrail; Snowflake's warehouse sizing, auto-suspend and resource monitors; Databricks' budget policies as tagging-for-attribution, not a spending cap; spot/preemptible compute's real discount and its real interruption mechanics; committed-use vs flexibility as the same break-even-utilisation logic from topic 10 applied to a multi-year horizon; a cost regression failing a CI run. Recap + takeaways. Second predict step: given a job's shape, which guardrail actually stops the specific failure mode shown.

## Concept ledger

**Introduces:** `compute-commitment-breakeven`, `cost-regression-as-ci-gate`.
**Uses:** `cloud-cost-four-dimensions` (topic 6), `serverless-provisioned-breakeven` (topic 10), `iac-state-plan-apply-drift` (topic 15), `policy-as-code-gate` (topic 15).
**Declared:** none beyond topic 15.

## Bridge / handoff

**Bridge:** "A reproducible platform is the precondition for answering what it costs fairly. This topic is that answer in practice: the guardrails that actually stop a cost overrun rather than just alert on it after the bill arrives, and the commitment-vs-flexibility trade-off behind every multi-year discount."

**Handoff:** "Everything in this chapter so far assumed the pipeline was free to run anywhere the cloud allows. For data about a person who lives in the EU, that assumption is false by law before it is false by architecture — which the next section makes exact."
