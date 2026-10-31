# Pre-notes: Serverless vs provisioned compute economics

- **DPU-hour.** AWS Glue's billing unit: one Data Processing Unit is 4 vCPU and 16 GB of memory, billed per second with a 1-minute minimum.
- **vCPU-second / GB-second.** EMR Serverless's billing shape: you pay only for the vCPU, memory and storage your application actually consumes, rounded to the second.
- **DCU.** Google Cloud Dataproc Serverless's Data Compute Unit: a fixed vCPU/memory conversion, billed per second, with a documented floor of 12 DCUs per serverless session or batch.
- **DBU.** The Databricks Unit: a normalized unit of processing power, driven by compute resources and data processed, not a fixed hardware ratio like the other four.
- **Slot-millisecond.** A BigQuery usage metric reported after a query runs — not itself a billing unit; actual billing is by bytes scanned (on-demand) or by bought slot capacity (capacity-based).
- **Cold start.** The delay before a serverless process is actually ready to run work, because nothing was already running.
- **Break-even utilisation.** The fraction of a billing period a job must run before a flat-rate provisioned cluster costs less than paying serverless's per-second rate for the same work.
- **Job bookmark.** AWS Glue's own mechanism for tracking which files or partitions a previous run already processed, so a scheduled re-run doesn't reprocess them.
