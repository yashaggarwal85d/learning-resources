# Fact-check: Lakehouse platform choice: storage, format, pricing

| # | Claim | Source | Verdict |
|---|---|---|---|
| 1 | Databricks stores managed table/volume data in an S3 bucket the customer creates in their own AWS account | Databricks: Create a Unity Catalog metastore | Confirmed, verbatim quote |
| 2 | UniForm generates Iceberg metadata asynchronously from the same Parquet files as Delta, so a single copy of the data serves both Delta and Iceberg clients | Databricks: Read Delta Lake tables with Iceberg clients | Confirmed, verbatim quote |
| 3 | A plain Snowflake table's storage (organization, file size, compression, metadata) is fully managed by Snowflake; a Snowflake Iceberg table instead stores data in external cloud storage the customer manages, explicitly not part of Snowflake | Snowflake: key concepts and architecture; Apache Iceberg tables | Confirmed, verbatim quotes |
| 4 | Snowflake compute cost is consumed credits times the price of a credit | Snowflake: Understanding overall cost | Confirmed, verbatim quote |
| 5 | Secure Data Sharing copies no data between accounts; shared objects are read-only and consume no storage in the consumer's account | Snowflake: About Secure Data Sharing | Confirmed, verbatim quotes |
| 6 | A OneLake shortcut is a pointer to another storage location, behaving like a symbolic link, independent of its target | Microsoft Fabric: OneLake shortcuts | Confirmed, verbatim quotes |
| 7 | Fabric database mirroring continuously replicates an entire source database into OneLake as a real copy; Fabric's own metadata mirroring instead uses shortcuts and moves no data | Microsoft Fabric: Mirroring overview | Confirmed, verbatim quotes |
| 8 | Fabric capacity smoothing spreads a usage spike (worked example: 2-CU reservation spiking to 4 CU for an hour) across a 24-hour window for background work, billing the average rather than the peak | Microsoft: Fabric Capacity reservations | Confirmed, verbatim quotes |
| 9 | A BigQuery Iceberg managed table stores data in a Cloud Storage bucket the customer owns and must configure before table creation | Google Cloud: Apache Iceberg managed tables | Confirmed, verbatim quotes |
| 10 | BigQuery offers both a per-TiB-processed on-demand model and a reserved-slots (editions) model, selectable per project; slots are a property of compute, not storage | Google Cloud: Understand BigQuery editions | Confirmed, verbatim quotes |
| 11 | The four-platform cost comparison and the open-format-vs-proprietary exit-cost model are illustrative reproductions of each platform's own documented billing/storage mechanism, run and verified locally | Derived in `examples.py` | Confirmed by running the code |

## Red-team

- **Are the dollar figures in `examples.py` real, quoted prices?** No, and the file says so explicitly in its own docstring and in-line comments: they're illustrative rates chosen to be the right order of magnitude for each platform's documented billing *unit* (DBUs, credits, CU-hours, slot-hours, TiB), not actual current list prices. The teaching point is which unit each platform bills by and how smoothing/slots/credits behave structurally, not a claim about who is cheapest today.
- **Does the hook overclaim that leaving Snowflake is impossible?** No — the hook and hand-off language is calibrated to "costly and slow," not "impossible": Snowflake's own `UNLOAD`/`COPY INTO` location mechanism can export data, at a real compute cost proportional to volume, which `exit_cost_estimate()`'s nonzero branch models directly. The fact-check and reel avoid claiming there is no export path at all.
- **Does calling Fabric's storage "proprietary" misrepresent OneLake?** The topic does NOT call OneLake proprietary — Mirroring's own documentation states mirrored and shortcut data lands in Delta Lake format, which is open. OneLake's open-format posture is taught as a point in its favor, distinct from the storage-ownership axis (OneLake itself, not the customer's own bucket, is the storage location).
- **Is Snowflake's Iceberg option conflated with its native-table default?** No — SOURCES.md's own quotes keep them distinct: a native Snowflake table is Snowflake-managed storage in Snowflake's proprietary format; a Snowflake Iceberg table is a different, opt-in configuration using the customer's own external cloud storage in the open Iceberg format. The topic teaches both as two different answers Snowflake gives to the storage-ownership question.

## Outcome

28 quotes across 11 sources, 0 problems (`node scripts/sources.mjs check`). `examples.py` runs clean, reproducing all four platforms' documented billing mechanisms plus the open-format-vs-proprietary exit-cost contrast against a synthetic workload.
