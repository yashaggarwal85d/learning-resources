# Outline: Serverless vs provisioned compute economics

**Syllabus line (syllabus/data-engineering.md):** "billing units and their granularity (Glue DPU-hours, EMR Serverless vCPU/GB-seconds, Dataproc Serverless DCUs, Databricks serverless DBUs, BigQuery slot-ms), cold start, autoscaling lag, noisy neighbours and version lag, escape hatches; break-even utilisation vs reserved clusters; Glue job bookmarks vs table-format incremental reads for idempotent re-runs."

## Claims to fact-check

1. A Glue DPU is 4 vCPU + 16 GB memory, billed per second with a 1-minute minimum, $0.44/DPU-hour (AWS Glue pricing).
2. EMR Serverless bills by vCPU/memory/storage actually consumed, rounded to the second with a 1-minute minimum (AWS EMR Serverless pricing).
3. Dataproc Serverless bills by DCU (Data Compute Unit), per second, with a documented default minimum of 12 DCUs per session/batch and a fixed vCPU/GB→DCU conversion (Google Cloud Dataproc Serverless pricing).
4. Databricks serverless compute is billed in DBUs, a normalized unit driven by compute resources and data processed, not a fixed hardware mapping like the other four (Databricks pricing).
5. BigQuery's on-demand model bills by TiB scanned, not by slot-time; slot-ms/slot-time billing only applies under the separate capacity-based (Editions) model, and even there you're billed for scaled slots allocated, not slots actually used (Google BigQuery: understand slots).
6. AWS Glue job bookmarks persist per-run state (which files/partitions were processed) so a scheduled re-run doesn't reprocess old data (AWS Glue: tracking processed data using job bookmarks).
7. Each of the five services has a documented escape hatch that overrides its serverless default: Glue lets you pin a fixed worker type and count instead of relying on auto-scaling; EMR Serverless lets you configure pre-initialized capacity to keep workers warm; Dataproc Serverless's per-session DCU floor is itself a form of guaranteed minimum capacity; BigQuery's capacity-based model lets you buy baseline slots instead of paying per-query.
8. The break-even-utilisation formula follows directly from topic 6's three-ledger cost model: at low utilisation, serverless's per-second/per-DPU rate is cheaper than paying for an always-on provisioned cluster; above some utilisation fraction, the provisioned cluster's flat hourly cost wins, because it doesn't scale with usage the way serverless billing does.

## Changes from the chapter plan

CHAPTER.md's scope line names "BigQuery slot-ms" as if it were a billing unit parallel to the other four (Glue DPU-hours, EMR vCPU/GB-seconds, Dataproc DCUs, Databricks DBUs). BigQuery's own current documentation does not support that framing: `slot-ms`/`totalSlotMs` is a job-statistics usage metric reported after a query runs, not a billing unit in its own right. BigQuery's actual billing is one of two separate models — on-demand (billed by TiB of data scanned, the default) or capacity-based/Editions (billed by slot-time, but only once you've bought baseline slot capacity, and even then "you are charged for the number of scaled slots, not the number of slots used"). This topic discloses that gap directly, the same way topic 7 disclosed vendor renames and topic 9 disclosed the "Glue 5.0 vs 5.1" docs wording — rather than silently restating the syllabus's imprecise "slot-ms" framing as if it were BigQuery's billing unit.

A second, smaller change: CHAPTER.md's scope line groups "noisy neighbours and version lag" together with cold start and autoscaling lag as four hidden serverless costs. Of the five vendors researched, only Dataproc Serverless and EMR Serverless disclose a "version lag" risk at all explicitly in their own operational docs (platform-managed runtime version bumps a customer doesn't control the timing of); Glue's own documentation frames the analogous risk as its own job's Glue-version pin rather than a vendor-side version-lag disclosure. Where a vendor's own documentation doesn't name the risk explicitly, this topic says so rather than inventing a disclosure that isn't there.

## Engagement arc

Hook: a team moves a job that already runs six hours a day from a provisioned cluster to a serverless service "to save money," and the bill nearly doubles — because the job was already well past the break-even utilisation line before it moved. Early prediction: before the chart is shown, ask which of two jobs (one running six hours a day, one running six minutes a day) is more likely to get cheaper on serverless. Teaching: the five vendors' billing units, converted from one shared job shape so they're genuinely comparable; the four hidden costs serverless trades for its per-second billing; one escape hatch per vendor; the break-even formula itself, derived and solved numerically. Recap + takeaways. Second predict step: given a workload's hours-busy-per-day, pick serverless or provisioned.

## Concept ledger

**Introduces:** `serverless-provisioned-breakeven`, `billing-granularity-comparison`.
**Uses:** `cloud-cost-four-dimensions` (topic 6), `cross-cloud-service-rosetta` (topic 7), `catalog-credential-vending` (topic 8).
**Declared:** none beyond topic 9.

## Bridge / handoff

**Bridge:** "Every managed table service in the last topic runs on compute billed one of two ways: reserved by the second, or consumed by the request. This topic makes that choice with real numbers instead of a guess — break-even utilisation, not vibes."

**Handoff:** "This section mapped and priced the cloud's own data services in general. One specific platform, Databricks, is common enough and deep enough that the syllabus gives it a full section of its own, starting with its compute model and the vectorised engine underneath it."
