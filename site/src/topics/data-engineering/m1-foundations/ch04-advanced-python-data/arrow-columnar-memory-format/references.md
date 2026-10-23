Last verified against these sources: 23 October 2026. Real measurements on this sandbox's own
PyArrow 26.0.0 (`examples.py`).

- Apache Arrow, "Arrow Columnar Format" specification (v1.5): [arrow.apache.org](https://arrow.apache.org/docs/format/Columnar.html). Validity bitmaps, the variable-size binary view layout, dictionary and run-end encoding, record batches.
- Apache Arrow, "Data Types and In-Memory Data Model" (PyArrow docs): [arrow.apache.org](https://arrow.apache.org/docs/python/data.html). `ChunkedArray` and `Table` as no-copy containers for multiple record batches.
- Apache Arrow, "Compute Functions" (PyArrow docs): [arrow.apache.org](https://arrow.apache.org/docs/python/compute.html). The `pyarrow.compute` kernel API.
- Apache DataFusion, "Using StringView / German Style Strings to Make Queries Faster: Part 1 - Reading Parquet": [datafusion.apache.org](https://datafusion.apache.org/blog/2024/09/13/string-view-german-style-strings-part-1/). The "German Strings" naming, prior adopters, and the measured ClickBench speedup — sourced-only on this sandbox (DataFusion is not installed here).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=arrow-columnar-memory-format:%20).
