# Sources: OpenLineage: events, facets and lineage graphs (`de.openlineage-events-facets-lineage`)

OpenLineage's own object-model, run-cycle and column-lineage-facet specification pages, its
Apache Airflow integration page, and the Marquez project's own site are all fetched directly.

## OpenLineage specification — Object Model

URL: https://openlineage.io/docs/spec/object-model
Version: 1.55.0, retrieved 2026-11-02

> A Job is a process that consumes or produces Datasets.

> A Run is an instance of a Job that represents one of its occurrences in time.

> Job Metadata Updates (also known as static lineage) (JobEvent): describes metadata about a job, such as its location in source code or declared inputs/outputs. Emitted at design-time and not associated with a Run.

> Each Run State Update can include detail about the Job, the Run, and the input and output Datasets involved in the run. Subsequent updates are additive: input Datasets, for example, can be specified along with START, along with COMPLETE, or both.

Contents: the Job/Run/Dataset object model itself, and the additive nature of run events -- the
"run/job/dataset event model" clause.

## OpenLineage specification — The Run Cycle

URL: https://openlineage.io/docs/spec/run-cycle/
Version: 1.55.0, retrieved 2026-11-02

> A batch Job - e.g., an Airflow task or a dbt model - will typically be represented as a START event followed by a COMPLETE event. Occasionally, an ABORT or FAIL event will be sent when a job does not complete successfully.

> COMPLETE, ABORT and FAIL are terminal events. Sending any of terminal events

Contents: START as the opening event and COMPLETE/FAIL/ABORT as the terminal ones -- the
"(START/COMPLETE/FAIL)" clause.

## OpenLineage specification — Column Level Lineage Dataset Facet

URL: https://openlineage.io/docs/spec/facets/dataset-facets/column_lineage_facet/
Version: 1.55.0, retrieved 2026-11-02

> DIRECT - output column value was somehow derived from inputField value. In example result value is derived from source

> INDIRECT - output column value is impacted by the value of inputField column, but it's not derived from it. In example no part result value is derived from pred but pred has impact on the values of result in the output dataset

> IDENTITY - output value is taken as is from the input

Contents: the column-lineage facet's own DIRECT/INDIRECT transformation types and the IDENTITY
subtype -- the "column lineage" part of the facets clause, and the "column lineage from SQL
parsing vs runtime plans" clause's own vocabulary.

## OpenLineage — Apache Airflow integration page

URL: https://openlineage.io/docs/integrations/airflow/
Version: 1.55.0, retrieved 2026-11-02

> The OpenLineage and Apache Airflow integration has been relocated to the official OpenLineage Airflow Provider.

> For Airflow 2.7 and newer: Please refer to the native OpenLineage provider documentation

> This legacy integration is no longer maintained and will not receive any bug fixes, security updates, or new features.

Contents: the Airflow integration's own move into the official provider package and its stated
Airflow 2.7+ support cutoff -- the "Airflow provider built in" clause.

## Marquez Project — site

URL: https://marquezproject.ai/
Version: retrieved 2026-11-02

> Marquez enables consuming, storing, and visualizing OpenLineage metadata from across an organization, serving use cases including data governance, data quality monitoring, and performance analytics.

> Marquez was released and open sourced by WeWork.

> As the reference implementation of OpenLineage, the Marquez API server already works with all the integrations developed by the OpenLineage community. This includes Apache Airflow, Apache Spark, Apache Flink, dbt, and Dagster.

Contents: Marquez's own description of itself as the reference implementation, open-sourced by
WeWork -- the "Marquez reference server" clause.
