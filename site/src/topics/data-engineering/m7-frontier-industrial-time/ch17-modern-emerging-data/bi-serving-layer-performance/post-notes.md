<section data-section="outcomes">

## Outcomes

Choose between a rollup table, a materialized view and result caching for a stated query pattern
and justify the choice by how often the underlying data changes versus how often the query
repeats; explain what BigQuery BI Engine does and does not accelerate, from its own documented
exclusions; state why a cache's invalidation policy must be tied to a freshness SLA, not a fixed
timer, to stay correct; predict queueing behavior when a concurrency ceiling is exceeded and size
a ceiling against a given usage pattern.

</section>

<section data-section="internals">

## Internals

Google Cloud's own documentation describes BI Engine as "a fast, in-memory analysis service that
accelerates many SQL queries in BigQuery by intelligently caching the data that you use most
frequently," with acceleration happening "on leaf-level subqueries with INNER and LEFT OUTER
joins, where a large fact table is joined with up to four smaller dimension tables." Its own
documented exclusions are explicit: "JSON type columns aren't supported," "queries referencing
wildcard tables aren't supported," and "unsupported features include external tables, row-level
security, and non-SQL user-defined functions" — but an unaccelerated query still runs, since
"query stages or subqueries that can't be accelerated by BI Engine automatically fall back to
standard BigQuery execution slots without failing the query." Databricks' own documentation
describes its comparable mechanism differently: "Databricks uses disk caching to speed up data
reads. When a node fetches a Parquet data file from remote storage, it automatically stores a
copy on its local storage in a fast intermediate format," and "the disk cache automatically
detects when data files are created, deleted, modified, or overwritten and updates its content
accordingly," with "no need to explicitly invalidate cached data."

</section>

<section data-section="lab">

## Lab

None of its own, by design (CHAPTER.md: "its examples are a sized, worked scenario rather than a
chapter lab leg"). The hook and Prove It steps are reasoned through the documented mechanics of a
concurrency ceiling rather than measured against a running system.

</section>

<section data-section="production">

## Production failures this topic warns about

**Reaching for query optimization when a concurrency ceiling is the actual problem.** A queueing
dashboard whose individual query never got slower is a capacity problem, not a performance
problem; optimizing the query does nothing for a reservation that's already full.

**A cache invalidation policy tied to a fixed timer instead of the source's own freshness SLA.** A
stale cache hit looks identical to a correct one until the number is checked against the source —
exactly the silent failure mode both named engines' own automatic invalidation mechanisms are
built to avoid.

</section>

<section data-section="frontier">

## Frontier

Choosing among a rollup table, a materialized view and result caching is a single decision axis —
how often the underlying data changes versus how often the query repeats — rather than three
unrelated techniques to memorize separately.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Everything in this section assumed data engineering still moves the data at all. The chapter's
last topic asks what happens when a vendor claims it doesn't have to: "zero-ETL," and what that
name is actually hiding.

</section>
