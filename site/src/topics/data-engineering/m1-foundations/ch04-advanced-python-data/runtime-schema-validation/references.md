Last verified against these sources: 24 October 2026. Real measurements run in this sandbox
(`examples.py`): a Pydantic v2 record validation and a doubled-input scaling run; the identical
pandera schema fields validating a real pandas DataFrame and a real Polars `LazyFrame`, and a
real out-of-range rejection; a row-level loop measured against a vectorized pandas check. The
real Pydantic v1-vs-v2 cross-version speed benchmark is a disclosed one-time measurement,
recorded in `FACT-CHECK.md`, not reproduced in `examples.py` itself.

- Pydantic, "Pydantic Validation": [docs.pydantic.dev](https://docs.pydantic.dev/latest/). The Rust core, coercion, and structured validation errors.
- pandera, "DataFrame Schemas": [pandera.readthedocs.io](https://pandera.readthedocs.io/en/stable/dataframe_schemas.html). `DataFrameSchema`, `nullable`, `coerce`, and a real `SchemaError`.
- pandera, "Data Validation with Polars": [pandera.readthedocs.io](https://pandera.readthedocs.io/en/stable/polars.html). The same `DataFrameModel` syntax validating a Polars DataFrame.
- Great Expectations, "GX Core overview": [docs.greatexpectations.io](https://docs.greatexpectations.io/docs/core/introduction/gx_overview). The Data Context/Expectation/Checkpoint workflow.
- Soda, "Write SodaCL checks": [docs.soda.io](https://docs.soda.io/soda-cl/soda-cl-overview.html). The YAML-based check language and a real scan's pass/fail/error result.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=runtime-schema-validation:%20).
