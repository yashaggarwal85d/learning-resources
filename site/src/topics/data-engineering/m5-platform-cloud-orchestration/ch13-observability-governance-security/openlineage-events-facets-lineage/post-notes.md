<section data-section="outcomes">

## Outcomes

Write the START and COMPLETE run events for a job with an input dataset, an output dataset and
a schema facet and say which fields are required; explain how a run's events build additively
rather than all at once; compare SQL-parsed and runtime column lineage for a job with a UDF and
a dynamic table name and say exactly what each misses; list the kinds of data movement a
lineage graph built this way would never see.

</section>

<section data-section="measuring-the-parse-vs-plan-gap">

## Measuring the parse-vs-plan gap

`examples.py` runs the identical query -- a CASE expression, a call to a user-defined function,
and a table name assembled from a runtime parameter -- through two toy lineage extractors: a
regex-based text parser standing in for a SQL-parse approach, and a plan walker that runs with
the real parameter bound and the UDF's actual body traced. The text parser finds only the UDF's
one visible argument and leaves the table name as an unresolved placeholder; the plan walker
finds the UDF's full, real set of inputs (including a second column the function reads
internally that the text never shows) and the table name exactly as it resolved. The same
pattern holds for the run-event model: a toy `RunEventEmitter`'s START carries an empty output
list, and its COMPLETE for the identical run id adds the output dataset and a schema facet --
exactly OpenLineage's own documented "subsequent updates are additive" behaviour.

</section>

<section data-section="production">

## Production failures this topic warns about

**Trusting a SQL-text parse for column lineage on anything with a UDF or dynamic SQL.** The
Hook's own scenario -- a wrong column, a catalog that only says "derived from orders" -- is
exactly what a text-parse-only lineage tool produces: it cannot see inside a UDF's own body,
and it cannot resolve a table name that is only assembled once the job actually runs.

**Assuming a lineage graph is complete because the instrumented systems report it.**
`examples.py`'s own measurement only covers the job this topic traces; nothing about these
events can report a transformation that happens entirely outside an instrumented system -- a
spreadsheet pull, a manual export, a copy run by a tool nobody wired up to emit events at all.

</section>

<section data-section="frontier">

## Frontier

A real OpenLineage Spark listener's own documentation recommends a dataset-lineage-only
configuration for column lineage, because without it, indirect lineage edges can grow toward
something close to a cartesian product of fields on a wide join -- a cost this topic's own
two-column toy model is too small to demonstrate, but a real deployment on a wide production
table has to budget for directly.

</section>
