# FACT-CHECK — de.medallion-architecture-limits

## Claims

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Medallion architecture organizes data into Bronze, Silver, and Gold layers, to progressively improve quality and structure. | Confirmed | Databricks, direct quote: "Medallion architecture is a data design pattern that organizes lakehouse data into Bronze, Silver and Gold layers to progressively improve data quality and structure." |
| 2 | Bronze's contract is raw, as-is data with load metadata, for audit and lineage. | Confirmed | Direct quote: "The Bronze layer is where we land all the data from external source systems. The table structures in this layer correspond to the source system table structures \"as-is,\" along with any additional metadata columns that capture the load date/time, process ID, etc." |
| 3 | Silver's contract is conformed, "just-enough" cleansed data, an enterprise view of key business entities. | Confirmed | Direct quote: "In the Silver layer of the lakehouse, the data from the Bronze layer is matched, merged, conformed and cleansed (\"just-enough\") so that the Silver layer can provide an \"Enterprise view\" of all its key business entities, concepts and transactions." |
| 4 | Gold's contract is consumption-ready, denormalized, project-specific data for reporting. | Confirmed | Direct quote: "Data in the Gold layer of the lakehouse is typically organized in consumption-ready \"project-specific\" databases. The Gold layer is for reporting and uses more de-normalized and read-optimized data models with fewer joins." |
| 5 | Not every pipeline needs all three stages; forcing the pattern anyway causes unnecessary processing, showing up as added latency and added storage cost from duplicated data. | Confirmed | Modern Data 101, direct quotes: "Not all data requires three transformation stages, yet the framework encourages unnecessary processing," "Increased latency: Data must pass through multiple layers before becoming usable," and "Increases storage costs: Storing multiple copies of data across layers inflates cloud storage expenses." |
| 6 | Because different teams apply transformations at different stages, accountability for data quality becomes fragmented, and the Silver layer specifically becomes a named bottleneck from downstream consumers pulling against aggregates built without their input. | Confirmed | Direct quotes: "Since transformations are often applied at different stages by different teams, accountability for data quality becomes fragmented" and "This is also the tier which faces the most backlash from downstream users with continuous quality and modelling requests, creating bleeding bottlenecks—because it's a pull mechanism." |

## Currency

Databricks' own glossary page is a maintained, live reference, re-fetched 2026-10-22, describing a long-standing, stable architectural convention it coined. The Modern Data 101 critique, published February 2025, is a currently-live independent article (not affiliated with Databricks) and its criticisms (layer sprawl, copy cost, fragmented accountability) describe a known, widely-discussed failure mode of the pattern rather than a dated or superseded claim.

## Red team

**Predict 1 (step 3): does naming a layer "Silver" automatically give it a quality contract?**
The plausible wrong answer treats the bronze/silver/gold labels themselves as self-enforcing — as if calling a table "Silver" were the same as actually conforming and cleansing it. The reveal sequence (steps 4-6) states each layer's contract as an explicit, separately quoted definition, making clear that a layer's name is only a label; the contract is the specific, stated behavior (what gets cleaned, how much, for whom) that a team has to actually honor.

**Predict 2 (step 7): does forcing every pipeline through all three stages always improve its data?**
The plausible wrong answer generalizes "more layers of refinement" into "always strictly better," the same fallacy pattern seen with partitioning in `de.object-storage-query-economics`. The reveal at step 8 quotes the independent critique's own named cost: a pipeline that doesn't genuinely need all three stages still pays the latency and storage cost of passing through them, which is a real cost for no corresponding benefit.

**Predict 3 (step 9): whose job is it to fix a data-quality bug that surfaces in the Gold layer?**
The plausible wrong answer assumes ownership tracks discovery location — the bug showed up in Gold, so it must be Gold's problem. The reveal at steps 10-11 quotes the independent critique's actual claim: transformations applied by different teams at different stages fragment accountability, and the Silver layer specifically becomes a bottleneck precisely because downstream teams pull from aggregates they had no say in building — the bug's true origin and its discovery location are routinely different teams.

No claim required inferring beyond what is directly quoted from either source; this topic has no lab of its own (`CHAPTER.md`), so no measured claim requires separate sandbox verification.
