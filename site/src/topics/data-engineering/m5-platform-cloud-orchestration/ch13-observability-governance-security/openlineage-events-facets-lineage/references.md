Last verified: 30 October 2026. Expert sign-off: pending. No Docker, JVM-based catalog, Kafka
broker or Spark cluster on this build machine (`import pyspark` fails). What is real: the
installed `openlineage-python` 1.55.0 client library (its actual `RunEvent`, `Run`, `Job`,
`Dataset` and facet classes — schema, column-lineage, parent-run) and its `HttpTransport`,
emitting a real START and COMPLETE event over a real local HTTP round trip to a stand-in receiver
at Marquez's own `POST /api/v1/lineage` path — not Marquez itself, whose storage, API and UI are
not run here. The SQL-parse-versus-runtime-plan comparison in `examples.py` is a synthetic,
hand-built illustration of the Spark docs' own structural claim, not a real Spark job's output.

- OpenLineage, "Object Model": [openlineage.io](https://openlineage.io/docs/spec/object-model). The job/run/dataset event model.
- OpenLineage, "Facets & Extensibility": [openlineage.io](https://openlineage.io/docs/spec/facets). Optional, versioned metadata.
- OpenLineage, "Column Lineage Dataset Facet": [openlineage.io](https://openlineage.io/docs/spec/facets/dataset-facets/column_lineage_facet). DIRECT, INDIRECT and the CONDITIONAL subtype.
- OpenLineage, "Airflow Integration": [openlineage.io](https://openlineage.io/docs/integrations/airflow/). The current provider versus the retired legacy integration.
- OpenLineage, "Spark Column Lineage": [openlineage.io](https://openlineage.io/docs/integrations/spark/spark_column_lineage). SQL-text parsing versus the resolved logical plan.
- Marquez: [marquezproject.ai](https://marquezproject.ai/). The reference implementation, released by WeWork.
- OpenLineage, "Parent Run Facet": [openlineage.io](https://openlineage.io/docs/spec/facets/run-facets/parent_run). A run naming the job that spawned it.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=openlineage-events-facets-lineage:%20).
