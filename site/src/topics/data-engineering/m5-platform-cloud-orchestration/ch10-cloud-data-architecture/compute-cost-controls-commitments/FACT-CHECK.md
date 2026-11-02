# Fact-check: Compute cost controls and commitments

| # | Claim | Source | Verdict |
|---|---|---|---|
| 1 | Max-bytes-billed estimates query bytes before execution and fails the query without a charge if the estimate exceeds the limit | Google Cloud: Estimate and control costs | Confirmed, verbatim quote |
| 2 | For a clustered table that estimate is an upper bound and can exceed actual bytes billed, so a query can fail under the cap even though its real cost would have stayed under it | Google Cloud: Estimate and control costs | Confirmed, verbatim quote |
| 3 | Snowflake warehouse credit usage doubles per size increase per full hour, but billing is per-second with a 60-second minimum, so a warehouse is billed only for credits actually consumed | Snowflake: Overview of warehouses | Confirmed, verbatim quote |
| 4 | Snowflake warehouses auto-suspend when inactive (default on) and auto-resume on the next query (default on) | Snowflake: Overview of warehouses | Confirmed, verbatim quotes |
| 5 | A Snowflake resource monitor tracks warehouse credit usage and can alert, suspend standard warehouses, or disable Adaptive Warehouses at a threshold, but only for warehouses — not serverless features, which need a budget instead | Snowflake: Working with resource monitors | Confirmed, verbatim quotes |
| 6 | Databricks serverless usage policies attach tags to serverless activity, logged in billing records for budget attribution, applied automatically when a user has only one policy | Databricks: Attribute usage with serverless usage policies | Confirmed, verbatim quotes |
| 7 | Google Cloud Spot VMs offer up to 91% discounts versus on-demand in exchange for preemption at any time, suited to fault-tolerant workloads | Google Cloud: Spot VMs | Confirmed, verbatim quotes |
| 8 | Preemption sends a metadata signal first; a 120-second notice duration is recommended for workloads needing more than 30 seconds to react; the shutdown period itself is best-effort and up to 30 seconds | Google Cloud: Spot VMs; Create and use Spot VMs | Confirmed, verbatim quotes |
| 9 | A Google Cloud committed-use discount trades a 1- or 3-year spend or resource commitment for a discounted rate; standard spend-based CUDs discount until the hourly committed spend amount is met | Google Cloud: Committed use discounts | Confirmed, verbatim quotes |
| 10 | The max-bytes-billed guardrail, the resource-monitor quota example, spot checkpoint/resume, commitment break-even, and a cost-regression CI gate all behave as documented when reproduced against synthetic data | Derived in `examples.py`, run and verified locally | Confirmed by running the code |

## Red-team

- **Does the Databricks budget-policy claim overstate what it does?** No — the topic is careful to teach budget policies as tagging-for-attribution, not a spending cap. SOURCES.md's own quote is about tags appearing in billing records, not about stopping spend; the hook and hand-off language distinguish this from BigQuery's max-bytes-billed and Snowflake's resource monitor, both of which can actually block or suspend.
- **Is the resource-monitor worked example invented, or does it come from Snowflake's own documentation?** It's Snowflake's own stated example verbatim (700 + 300 = 1000 credits triggering an alert at the quota), reproduced in `examples.py` as a direct, assertable check rather than a new invented scenario.
- **Does the spot-VM discount figure (91%) overclaim?** No — SOURCES.md quotes it as "up to 91% discounts for many machine types," which the topic states with the same qualifier ("up to"), not as a universal guaranteed discount.
- **Is the commitment break-even logic circular or self-serving?** No — it's the same break-even-utilisation method topic 10 already established (serverless vs provisioned), applied here to a committed-use discount instead of a single job's hourly billing; the illustrative rates are disclosed as such in both the docstring and this fact-check.

## Outcome

18 quotes across 6 sources, 0 problems (`node scripts/sources.mjs check`). `examples.py` runs clean, reproducing the max-bytes-billed guardrail, the resource monitor's own worked quota example, spot checkpoint/resume, a committed-use break-even calculation, and a cost-regression CI gate.
