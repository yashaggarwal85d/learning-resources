# Sources — de.medallion-architecture-limits

This topic has no lab of its own (`CHAPTER.md`). Its sources are the term's own originating
vendor documentation plus an independently authored critique of its failure modes, per
CHAPTER.md's instruction.

## Databricks, "What is Medallion Architecture?"

URL: https://www.databricks.com/glossary/medallion-architecture
Fetched: 2026-10-22.

Quotes:
> Medallion architecture is a data design pattern that organizes lakehouse data into Bronze, Silver and Gold layers to progressively improve data quality and structure.

> The Bronze layer is where we land all the data from external source systems. The table structures in this layer correspond to the source system table structures "as-is," along with any additional metadata columns that capture the load date/time, process ID, etc.

> In the Silver layer of the lakehouse, the data from the Bronze layer is matched, merged, conformed and cleansed ("just-enough") so that the Silver layer can provide an "Enterprise view" of all its key business entities, concepts and transactions.

> Data in the Gold layer of the lakehouse is typically organized in consumption-ready "project-specific" databases. The Gold layer is for reporting and uses more de-normalized and read-optimized data models with fewer joins.

Items: (1) the three named layers each have a distinct, named contract — Bronze: raw, as-is, auditable; Silver: conformed, "just-enough" cleansed, an enterprise view; Gold: consumption-ready, denormalized, project-specific; (2) this is the term's own originating definition, from the vendor that coined it.

## Modern Data 101 (Animesh Kumar, Shubhanshu Jain, Samadrita Ghosh), "Data Products: A Case Against Medallion Architecture"

URL: https://moderndata101.substack.com/p/data-products-a-case-against-medallion
Fetched: 2026-10-22.

Quotes:
> The Bronze-Silver-Gold model enforces a strict pipeline structure that may not align with actual data needs. Not all data requires three transformation stages, yet the framework encourages unnecessary processing, leading to:

> Increased latency: Data must pass through multiple layers before becoming usable.

> Increases storage costs: Storing multiple copies of data across layers inflates cloud storage expenses.

> Since transformations are often applied at different stages by different teams, accountability for data quality becomes fragmented.

> This is also the tier which faces the most backlash from downstream users with continuous quality and modelling requests, creating bleeding bottlenecks—because it's a pull mechanism.

Items: (1) not every pipeline needs all three stages, and forcing the pattern on data that doesn't need it causes unnecessary processing; (2) that unnecessary processing shows up concretely as added latency (data must pass through every layer before it's usable) and added storage cost (the same data copied across layers); (3) because different teams apply transformations at different stages, accountability for data quality specifically becomes fragmented — no single team clearly owns correctness; (4) the Silver layer specifically bears the brunt of this, becoming a bottleneck because downstream consumers pull from aggregates built without their own input or context.

This is an independently authored critique (Modern Data 101, a data engineering newsletter, not affiliated with Databricks), fetched and quoted directly rather than paraphrased, per CHAPTER.md's instruction to cite independent critique alongside the originating vendor's own documentation.
