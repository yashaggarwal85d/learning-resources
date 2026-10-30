<section data-section="outcomes">

## Outcomes

Write the START and terminal run events for a job with an input and an output dataset and say
which event a given facet belongs on; explain why a facet's own versioned schema lets a consumer
skip one it doesn't recognise; name which tool emits and which tool reads, for a given stage of a
pipeline; compare SQL-parsed and runtime-plan column lineage for the same query and say exactly
what the text-only path misses, and why; state what a lineage graph built this way would and
would not see for a dataset whose own name changes between runs.

</section>

<section data-section="internals">

## Internals

`examples.py` builds real `RunEvent`, `Run`, `Job`, `Dataset` and facet objects through the
installed `openlineage-python` client (the same library the real Spark and Airflow integrations
use), emits a START and a COMPLETE event for the shop's `orders-rollup` job through the library's
own `HttpTransport`, and receives both over a real local HTTP round trip at a stand-in for
Marquez's own `POST /api/v1/lineage` path — not Marquez itself, whose storage, API and UI this
environment cannot run. `sql_parse_column_lineage` and `runtime_plan_column_lineage` are a small,
hand-built illustration (no Spark installed here) of the one structural claim the Spark docs make:
text parsing sees only the names written in the query; a resolved plan sees the CASE condition and
the parameter's actual value.

</section>

<section data-section="lab">

## Lab: wiring and comparison

This topic hosts the lineage-collection half of the §13.3 chapter lab: build real OpenLineage
events for a job with a parent-run facet, send them over a real HTTP client to a local receiver at
Marquez's own ingestion path, and compare SQL-parsed against runtime-plan column lineage on the
same synthetic query. The planted-bad-partition blast radius that reads this topic's own graph is
topic 14's.

</section>

<section data-section="production">

## Production failures this topic warns about

**Trusting a lineage graph built only from SQL-text parsing.** A dashboard built on "what the
query says" silently drops any edge decided at run time — a CASE condition, a parameterised table
name, a UDF — and nobody notices until an incident needs the edge that was never recorded.

**Assuming a daily job's lineage collapses into one dataset node.** If a table name is built from
the run date, lineage collection records exactly the resolved string it saw — a new node every
day, not one node a human would recognise as "the same table," unless something upstream
normalises the name first.

</section>

<section data-section="frontier">

## Frontier

Using this topic's graph for tag propagation, alert deduplication and blast radius is topics 4, 3
and 14's own payoff, referenced here, not repeated. Data-quality assertion frameworks that attach
to the same datasets are topic 12. Airflow's scheduler internals and dbt's own CI integration are
named only, per `CHAPTER.md`'s declared cross-chapter gap (see `OUTLINE.md`): this topic's own
build machine has no Chapter 11 §11.4 topic to point to yet.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Lineage tells you where data came from and went. It does not tell you whether the data at either
end is any good. The next topic is how a dataset's contents are checked: data-quality frameworks,
where the checks run and what they cost.

</section>
