Last verified: 2 November 2026. Expert sign-off: pending. Two claims run in `examples.py`
against a toy run-event emitter and a toy SQL-text-parser/plan-walker pair (disclosed in
`examples.py`'s own module docstring as a model of OpenLineage's own documented event and
column-lineage-facet mechanics, since this sandbox has no real Spark cluster or Marquez server)
-- all asserts pass.

- OpenLineage, "Object Model": [openlineage.io](https://openlineage.io/docs/spec/object-model). The Job/Run/Dataset model and additive events.
- OpenLineage, "The Run Cycle": [openlineage.io](https://openlineage.io/docs/spec/run-cycle/). START and the terminal states.
- OpenLineage, "Column Level Lineage Dataset Facet": [openlineage.io](https://openlineage.io/docs/spec/facets/dataset-facets/column_lineage_facet/). DIRECT/INDIRECT/IDENTITY.
- OpenLineage, "Apache Airflow" (integration page): [openlineage.io](https://openlineage.io/docs/integrations/airflow/). The provider-package relocation.
- Marquez Project, site: [marquezproject.ai](https://marquezproject.ai/). The reference implementation, open-sourced by WeWork.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=openlineage-events-facets-lineage:%20).
