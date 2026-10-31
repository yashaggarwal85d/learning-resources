---
id: de.lakehouse-platform-choice-storage
title: 'Lakehouse platform choice: storage, format, pricing'
---

<section data-section="outcomes">

## Outcomes

- For a given workload and constraint set, name which of the four platforms owns the storage and what that implies.
- Distinguish genuinely open-format table support from a vendor's own compatibility layer.
- Compute and compare a workload's cost across at least three of the four pricing models.
- Estimate the exit cost of a given platform choice.

</section>

<section data-section="internals">

## Internals

- **Storage ownership is the one fact that determines almost everything else in this comparison.** Databricks and BigQuery's managed Iceberg tables both put the bytes in a bucket the customer creates and controls; Snowflake's native tables and Fabric's OneLake put the bytes somewhere the vendor owns. Every other axis — format, zero-copy mechanism, exit cost — follows from this one architectural fact.
- **"Open format" has two genuinely different meanings that a learner must keep separate.** A format a platform can *read* (Databricks reading Iceberg via UniForm) is not the same claim as a format the platform *writes by default* (a plain Snowflake table, which is proprietary unless Iceberg is explicitly chosen). The marketing language rarely distinguishes the two.
- **Zero-copy is four different mechanisms wearing one marketing label.** A OneLake shortcut moves no data and is a pointer; Fabric's own mirroring is an actual copy; Delta Sharing and Snowflake's Secure Data Sharing hand out read access without ever duplicating bytes, but through two separate protocols. Treating all four as interchangeable "zero-copy" features misses what each one actually does and does not duplicate.
- **The billing unit changes which lever lowers cost, not just the sticker price.** Lowering a Databricks job's run time saves DBU-hours directly; lowering a Fabric job's run time inside the smoothing window may not move the bill at all, since the window already averages the spike away.
- **Exit cost is a consequence of day-one decisions, not a later negotiation.** `examples.py`'s own worked comparison makes this concrete: the same 500 gigabytes costs nothing extra to walk away with in an open format already in your own bucket, and a real, volume-scaled export fee in a vendor's proprietary format.

</section>

<section data-section="production">

## Production

A platform team picks Snowflake specifically because its managed storage removes an entire category of operational work — no bucket policies, no file layout, no compaction jobs to run. Three years later, a cost-cutting mandate forces a migration evaluation, and the same managed storage that once felt like a feature is now the reason the estimated exit cost comes back higher than the two years of savings the original choice was supposed to deliver.

</section>

<section data-section="frontier">

## Frontier

Every platform's own comparison surface keeps shifting: Snowflake's Iceberg support, Fabric's mirroring source list, and BigQuery's managed-Iceberg feature set were all still actively expanding as of this topic's research, per each vendor's own documentation. The decision axes this topic teaches — who owns the storage, whether the default format is genuinely open, which zero-copy mechanism actually applies, which unit the bill is denominated in, and what leaving costs — stay the right questions to ask even as the specific feature list keeps growing underneath them.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Choosing a platform and its services is a decision made once, or rarely. Keeping that choice reproducible and affordable over hundreds of later changes is a discipline in its own right — infrastructure as code and FinOps, which open the next section.

</section>
