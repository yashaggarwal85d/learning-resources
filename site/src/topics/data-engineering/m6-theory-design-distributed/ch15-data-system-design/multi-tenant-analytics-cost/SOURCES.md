# Sources — de.multi-tenant-analytics-cost

`CHAPTER.md` names Snowflake's `QUERY_ATTRIBUTION_HISTORY` and `WAREHOUSE_METERING_HISTORY`
documentation and BigQuery's `INFORMATION_SCHEMA.JOBS` documentation as the primary sources for
this topic's metering-and-attribution design, plus Chapter 13's and the FinOps Foundation's
material as in-course and framing anchors. This topic quotes Snowflake's own documentation (the
named view's own stated purpose, its `CREDITS_ATTRIBUTED_COMPUTE` column, and its explicit
idle-time exclusion `CHAPTER.md` itself names) and Google Cloud's own BigQuery documentation
(the three named `INFORMATION_SCHEMA.JOBS` fields this topic's attribution model allocates
from) — two sources, satisfying the ≥2-source rule.

## Snowflake Documentation, "QUERY_ATTRIBUTION_HISTORY view"

URL: https://docs.snowflake.com/en/sql-reference/account-usage/query_attribution_history
Fetched: 2026-10-31.

Quotes:
> can be used to determine the compute cost of a given query run on warehouses in your account

> Number of credits attributed to this query.

> The value doesn't include any credit usage for warehouse idle time.

Items: (1) the view's own stated purpose — the named mechanism this topic's per-tenant
attribution reads from; (2) the `CREDITS_ATTRIBUTED_COMPUTE` column's own description — the
exact per-query number the allocation model assigns to a tenant; (3) the explicit exclusion
`CHAPTER.md` itself requires this topic to quote — the named reason a metering view alone cannot
account for the whole bill, which is exactly this topic's own "unattributable remainder" design
problem.

## Google Cloud Documentation, "INFORMATION_SCHEMA.JOBS view"

URL: https://docs.cloud.google.com/bigquery/docs/information-schema-jobs
Fetched: 2026-10-31.

Quotes:
> If the project is configured to use on-demand pricing, then this field contains the total bytes billed for the job.

> Slot milliseconds for the last execution of the job, excluding prior retries, if any.

> Array of labels applied to the job as key-value pairs.

Items: the three named fields `CHAPTER.md` itself requires this topic to use —
`total_bytes_billed` and `total_slot_ms` as the two metering signals this topic's
cost-attribution model allocates from, and `labels` as the mechanism a job is tagged to a
tenant by, so the allocation can be grouped per tenant from the engine's own job metadata.
