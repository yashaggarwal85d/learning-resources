---
id: de.serverless-vs-provisioned-compute
title: 'Serverless vs provisioned compute economics'
---

<section data-section="outcomes">

## Outcomes

- Convert one job's resource use into at least three vendors' real billing units and compare them honestly.
- Name the four hidden costs of serverless (cold start, autoscaling lag, noisy neighbours, version lag) and at least one documented escape hatch per vendor.
- Compute the break-even utilisation between serverless and provisioned for a given workload, as a formula solved numerically, not a guess.
- Choose between Glue job bookmarks and a table format's incremental read for idempotent re-runs.

</section>

<section data-section="internals">

## Internals

- **BigQuery's "slot-ms" is not a fifth billing unit to match the other four.** It's a job-statistics usage metric BigQuery reports after a query runs. Real BigQuery billing is one of two separate models: on-demand (by TiB scanned) or capacity-based (by bought slot capacity, with its own per-second rate and one-minute minimum) — never a direct per-slot-millisecond charge the way the syllabus's phrasing implies. Disclosed in OUTLINE.md as a precision gap.
- **Four vendors, four genuinely different billing units, not one idea under four names.** Glue's DPU-hour is a fixed hardware ratio ($0.44/hour for 4 vCPU + 16 GB). EMR Serverless bills metered consumption directly, with no DPU-style abstraction layer. Dataproc's DCU has its own fixed vCPU/GB conversion and a documented 12-DCU session floor, confirmed from Google's own worked pricing example ("Total compute cost = 12 * 24 * $0.060000 = $17.28"). Databricks' DBU is explicitly workload-driven, not a fixed hardware ratio at all — the one vendor whose unit can't be converted from vCPU/memory alone.
- **The break-even formula is the same algebra topic 6 used for flat-vs-metered cost, just applied to compute.** `provisioned_daily_cost / serverless_cost_per_hour_busy` gives the hours/day a job must run before provisioned wins — derived and solved numerically in `examples.py`, not asserted.
- **Every escape hatch traces to the vendor's own documentation, and they're not all the same shape of override.** Glue's and EMR Serverless's hatches let you push a serverless default toward provisioned-style behaviour (a fixed worker count; warm, pre-initialized workers). Dataproc's 12-DCU floor runs the other way — it's a guaranteed minimum you can't go below, not an opt-in override. BigQuery's capacity-based model is a wholesale alternative billing model, not a tunable parameter on the default one.
- **Glue job bookmarks and a table format's incremental-read API answer the same question at different layers.** A bookmark is Glue's own per-job state, readable only by Glue; an incremental-read API is a property of the table itself, readable by any engine that opens it — the same portability trade-off the course has already drawn between vendor-specific and table-format-native mechanisms in earlier topics.

</section>

<section data-section="production">

## Production

A data platform moves a steadily-running ETL job to a serverless service during a cost-cutting push, reasoning that "serverless means you only pay for what you use." Nobody checks how many hours a day the job actually runs before the move. Three months later, finance flags the line item: the job's monthly bill is up, not down, because the job was already running well past its own break-even utilisation on the provisioned cluster it left.

</section>

<section data-section="frontier">

## Frontier

Every one of these five vendors keeps changing the specifics this topic measured: Dataproc's per-DCU rate, Glue's DPU pricing tier, and BigQuery's Editions-based slot pricing have all moved at least once in the vendors' own release histories. The billing-unit comparison itself — convert to a common resource shape, then compare — stays valid even when the specific numbers move; that's the actual, durable skill this topic teaches, not the dollar figures themselves.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

This section mapped and priced the cloud's own data services in general. One specific platform, Databricks, is common enough and deep enough that the syllabus gives it a full section of its own, starting with its compute model and the vectorised engine underneath it.

</section>
