# Sources — de.openlineage-events-facets-lineage

## OpenLineage — Object Model

URL: https://openlineage.io/docs/spec/object-model

> A Job is a process that consumes or produces Datasets.

> A Run is an instance of a Job that represents one of its occurrences in time.

> A Dataset is an abstract representation of data.

> Usually, the first Run State for a Job would be START and the last would be COMPLETE.

> A run cycle is likely to have at least two Run State Updates, and perhaps more.

## OpenLineage — Facets & Extensibility

URL: https://openlineage.io/docs/spec/facets

> A facet is an atomic piece of metadata identified by its name.

> They have a _schemaURL field pointing to the corresponding version of the facet schema (as a JSONPointer: $ref URL location ).

> The versioned URL must be an immutable pointer to the version of the facet schema.

> Custom facets can be promoted to the standard by including them in the spec.

## OpenLineage — Column Lineage Dataset Facet

URL: https://openlineage.io/docs/spec/facets/dataset-facets/column_lineage_facet

> DIRECT - output column value was somehow derived from inputField value.

> INDIRECT - output column value is impacted by the value of inputField column, but it's not derived from it.

> CONDITIONAL - input value is used in IF, CASE WHEN or COALESCE statements

## OpenLineage — Airflow Integration

URL: https://openlineage.io/docs/integrations/airflow/

> has been relocated to the official OpenLineage Airflow Provider

> For Airflow 2.7 and newer

> This legacy integration is no longer maintained and will not receive any bug fixes, security updates, or new features.

## OpenLineage — Spark Column Lineage

URL: https://openlineage.io/docs/integrations/spark/spark_column_lineage

> The only info collected is the name of the table/view and field, as it is mentioned in the query.

> Class ColumnLevelLineageBuilder is used when traversing logical plans to store all the information required to produce column-level lineage.

> Most of the expressions represent DIRECT transformation, only exceptions are If, CaseWhen and Coalesce which contain condition expressions.

> all its dependencies will be of INDIRECT type.

## Marquez — Project site

URL: https://marquezproject.ai/

> Marquez was released and open sourced by WeWork.

## OpenLineage — Parent Run Facet

URL: https://openlineage.io/docs/spec/facets/run-facets/parent_run

> report which jobs spawned them to preserve job hierarchy.

> the Airflow DAG execution that eventually spawned Airflow tasks which then spawned Spark jobs.
