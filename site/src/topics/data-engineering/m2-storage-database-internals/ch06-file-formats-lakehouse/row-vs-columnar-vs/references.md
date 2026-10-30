Last verified: 30 October 2026. Every number on screen is executed and asserted directly
(`examples.py`, pure Python, no external service needed): real packed bytes for a 1,000-row,
4-attribute table, laid out three ways (row-major, fully decomposed by column, and PAX), with a
point lookup's and a column scan's bytes-touched counted directly from those packed blobs — not
estimated and not timed.

- Ailamaki, DeWitt, Hill, Skounakis, "Weaving Relations for Cache Performance": [csd.uoc.gr](https://www.csd.uoc.gr/~hy460/pdf/pax222.pdf). Proceedings of the 27th VLDB Conference, 2001. The paper that names and defines NSM, DSM and PAX; this topic's own layout definitions and the PAX design claims (same I/O, better cache use) come directly from it.
- Apache Parquet, "Motivation": [parquet.apache.org](https://parquet.apache.org/docs/overview/motivation/). Retrieved 2026-10-30. Why Parquet exists: columnar storage with per-column-tunable compression and encoding.
- Apache Parquet, "Overview": [parquet.apache.org](https://parquet.apache.org/docs/overview/). Retrieved 2026-10-30. The one-line definition of Parquet as a column-oriented file format.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=row-vs-columnar-vs:%20).
