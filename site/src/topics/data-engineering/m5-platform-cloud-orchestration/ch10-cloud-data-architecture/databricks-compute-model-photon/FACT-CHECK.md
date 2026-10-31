# Fact-check: Databricks compute model and Photon

| # | Claim | Source | Verdict |
|---|---|---|---|
| 1 | A new job compute terminates and can't restart once its job ends; an existing all-purpose compute autostarts if scheduled again after terminating | Databricks: Manage classic compute | Confirmed, verbatim quote |
| 2 | Pools hold idle, ready-to-use instances that cut cluster start/autoscaling time, and Databricks doesn't bill DBUs for an instance idling in a pool | Databricks: Connect to pools | Confirmed, verbatim quotes |
| 3 | A spot cluster's driver node is always on-demand; only subsequent worker instances are spot | Databricks: Compute configuration reference | Confirmed, verbatim quote |
| 4 | A compute policy is an admin-side tool limiting who can create what compute, including capping per-cluster cost | Databricks: Create and manage compute policies | Confirmed, verbatim quote |
| 5 | Serverless compute runs in a Databricks-managed plane, not the customer's own cloud account, speeding up start/scaling and minimizing idle time | Databricks: Connect to serverless compute | Confirmed, verbatim quote |
| 6 | Photon is a C++ vectorized engine with a documented 2x TPC-DS 1TB benchmark speedup over the latest Databricks Runtime, and customer-observed 3x-8x gains | Databricks: Photon product page | Confirmed, verbatim quote |
| 7 | A SQL warehouse is its own compute type for querying; Databricks recommends the serverless variant when available | Databricks: Connect to a SQL warehouse | Confirmed, verbatim quotes |
| 8 | The DBU is a normalized unit, and Databricks publishes a distinct price list per SKU/cloud rather than a single flat rate | Databricks: Pricing | Confirmed, verbatim quotes |

## Red-team

- **Is the all-purpose-vs-job-compute lifecycle difference real, or just a cost-model simplification?** It's a direct consequence of the two documented behaviours quoted above: all-purpose compute autostarts after terminating (meaning it's expected to sit through idle periods), and a new job compute terminates permanently when its one job finishes. `examples.py` encodes exactly those two rules against a synthetic job schedule and gets a different, non-trivial billed-minutes total for each — a real structural consequence, not an invented number.
- **Is Photon's speedup figure cherry-picked?** The quote is Databricks' own published TPC-DS 1TB benchmark figure plus their own disclosed range of customer-observed results (3x-8x); both are stated as Databricks' own claims, not independently re-benchmarked in this sandbox, and the topic presents them as such rather than as a locally-verified measurement.
- **Does "DBU accounting by SKU" actually mean something concrete, or is it hand-waved?** Databricks' own pricing page states it publishes a distinct price list per SKU and cloud provider, confirming SKU-level price differentiation is real and documented, even though this sandbox can't fetch the live per-SKU dollar table (a JS-rendered calculator) — the topic names this limitation rather than inventing specific numbers.

## Outcome

14 quotes across 8 sources, 0 problems (`node scripts/sources.mjs check`). `examples.py` runs clean, asserting the lifecycle-billing-gap numbers for a synthetic job schedule.
