# Outline: de.openlineage-events-facets-lineage

1. **Hook.** A column in `analytics.daily_revenue` is wrong. You have the Spark code and a
   catalog that says "derived from orders." Which input columns, through which transformations,
   produced that one number, and would parsing the SQL give the same answer as reading the plan
   the engine actually ran?
2. **Reveal: a Job, a Run and a Dataset -- OpenLineage's own object model.** [from]
   OpenLineage's own object-model page: a Job is a defined piece of work, a Run is one of its
   occurrences, a Dataset is what it reads or writes.
3. **Predict: a job's run sends a START event, then later a COMPLETE event. Does the COMPLETE
   event know about the output dataset from the very start?** [idx5]
4. **Reveal: no -- measured directly, START carries no output at all; COMPLETE adds it later,
   under the same run id.**
5. **Elaborate: facets are optional, versioned attachments -- a schema, a column-lineage
   mapping, a data-quality result, a job's own SQL.** [takeaway1] A consumer that doesn't
   recognize a facet simply ignores it.
6. **Predict: a query has a CASE expression, a UDF and a table name built from a parameter.
   Does parsing its SQL text find the same column lineage as reading the engine's actual
   plan?** [idx8]
7. **Reveal: no -- measured directly, SQL-text parsing misses the UDF's hidden input and never
   resolves the dynamic table name; the runtime plan sees both.**
8. **Elaborate: integrations -- the Airflow provider is now built directly into Airflow
   itself; Spark, Flink and dbt each emit the same event shape from their own internals.**
   [takeaway2]
9. **Reveal: Marquez is the reference implementation, open-sourced by WeWork; DataHub and cloud
   catalogs consume the same events too.**
10. **Elaborate: the gaps static lineage misses -- anything decided at runtime, and anything
    that leaves the instrumented systems entirely.**
11. **Recap.** [takeaway3]
