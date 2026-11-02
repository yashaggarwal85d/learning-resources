# Fact-check: Serverless vs provisioned compute economics

| # | Claim | Source | Verdict |
|---|---|---|---|
| 1 | A Glue DPU is 4 vCPU + 16 GB memory, billed per second with a 1-minute minimum, $0.44/DPU-hour | AWS Glue pricing | Confirmed, verbatim quote |
| 2 | EMR Serverless bills by vCPU/memory/storage actually consumed, rounded to the second, 1-minute minimum | AWS EMR Serverless pricing | Confirmed, verbatim quote |
| 3 | Dataproc Serverless bills by DCU, per second, documented 12-DCU session floor, fixed vCPU/GB→DCU conversion, $0.06/DCU-hour (standard) | Google Cloud Dataproc Serverless pricing | Confirmed, verbatim quotes incl. worked example ("12 * 24 * $0.060000 = $17.28") |
| 4 | Databricks serverless is billed in DBUs, a normalized unit driven by compute resources and data processed, not a fixed hardware ratio | Databricks pricing | Confirmed, verbatim quote |
| 5 | BigQuery's on-demand model bills by TiB scanned, not slot-time; slot-time billing only exists under the separate capacity-based model, and even there you're charged for scaled slots allocated, not slots used | Google BigQuery: understand slots | Confirmed, verbatim quotes |
| 6 | Glue job bookmarks persist per-run state so a scheduled re-run doesn't reprocess old data | AWS Glue: tracking processed data using job bookmarks | Confirmed, verbatim quote |
| 7 | Glue, EMR Serverless, Dataproc Serverless and BigQuery each document an escape hatch that overrides the serverless default (fixed worker count/type; pre-initialized capacity; a guaranteed DCU floor as the inverse case; baseline slot capacity) | AWS Glue worker types; AWS EMR Serverless capacity docs; Google Cloud Dataproc Serverless pricing; Google BigQuery slots | Confirmed per vendor, each from its own docs |
| 8 | The break-even formula (provisioned flat daily cost ÷ serverless per-hour-busy rate = break-even hours/day) follows directly from topic 6's three-ledger model and is solved numerically, not asserted | Derived in `examples.py`, run and verified locally | Confirmed by running the code |
| 9 | "BigQuery slot-ms" is not itself a billing unit the way the other four vendors' units are — it's a usage metric; BigQuery's real billing units are bytes-scanned (on-demand) or slot-time (capacity-based, after buying baseline slots) | Google BigQuery: understand slots (no sentence describing "slot-ms" as a billing unit; billing described only via the two named models) | Confirmed as a precision gap vs. the syllabus's own phrasing — disclosed in OUTLINE.md |

## Red-team

- **Is the break-even formula real math or dressed-up vibes?** It's `provisioned_daily_cost / serverless_cost_per_hour_busy`, derived directly from two flat-vs-metered cost functions and solved for the crossing point — the same algebra topic 6 used for its own always-on-vs-per-request ledger comparisons, applied here to compute instead of storage/network. `examples.py` runs it on a real job shape and asserts the hook's own numbers land on the correct side of the line.
- **Is the "bill nearly doubles" hook invented or does the math actually produce something close to 2x?** The code computes it from the same AWS Glue $0.44/DPU-hour rate used throughout, compared against an illustrative (not vendor-quoted) provisioned hourly rate chosen to be plausible for an equivalent-capacity reserved cluster; the resulting ratio (1.83x) is computed, not hard-coded, and the illustrative rate is disclosed as such in `examples.py`'s own comment rather than presented as a vendor figure.
- **Are "escape hatches" actually documented per vendor, or asserted?** Each of the four named escape hatches traces to its own verbatim SOURCES.md quote from that vendor's own documentation page — Glue worker types, EMR Serverless pre-initialized capacity, Dataproc's DCU floor (used here as the inverse of an escape hatch: a guaranteed minimum rather than an override, named as such), and BigQuery's capacity-based model as the documented alternative to on-demand.

## Outcome

25 quotes across 8 sources, 0 problems (`node scripts/sources.mjs check`). `examples.py` runs clean with both conversions and the break-even/hook assertions passing.
