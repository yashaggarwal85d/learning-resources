Last verified: 31 October 2026. Every number on screen is executed and asserted directly
(`examples.py`, pure Python, no external library installed in this sandbox): a 3-record worked
example and a 100-record synthetic dataset, hand-shredded into Dremel-style repetition/definition
levels, reassembled, and cross-checked against hand-rolled Arrow offsets/validity and ORC
present/length layouts for the identical structure.

- Dremel: Interactive Analysis of Web-Scale Datasets (Melnik et al., VLDB 2010): [storage.googleapis.com](https://storage.googleapis.com/gweb-research2023-media/pubtools/pdf/36632.pdf). Fetched 2026-10-31. The original definitions of repetition and definition levels, and the worked example this topic's own schema is a shallower version of.
- Apache Parquet Format, `README.md`: [github.com](https://github.com/apache/parquet-format/blob/master/README.md). `master` branch, fetched 2026-10-31. Confirms Parquet implements Dremel's own encoding directly, and the no-repetition-level-for-flat-columns rule.
- Apache Arrow Columnar Format specification: [github.com](https://github.com/apache/arrow/blob/main/docs/source/format/Columnar.rst). `main` branch, fetched 2026-10-31. The List layout (offsets + validity bitmap) and Struct layout (its own validity bitmap) this topic contrasts against Dremel's levels.
- Apache ORC v1 File Format Specification: [github.com](https://github.com/apache/orc/blob/main/site/specification/ORCv1.md). `main` branch, fetched 2026-10-31. The present/length stream layout for ORC's own List and Struct columns.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=nested-data-repetition-definition:%20).
