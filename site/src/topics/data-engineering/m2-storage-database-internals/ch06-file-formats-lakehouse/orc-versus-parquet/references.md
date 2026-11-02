Last verified: 31 October 2026. Every number on screen is executed and asserted directly
(`examples.py`, pure Python, no external library installed in this sandbox): a hand-rolled
ORC-style stripe/row-index layout and Parquet-style row-group/page-index layout, both built to
each spec's own default granularity, measured on the same 100,000-row dataset against one real
selective query.

- Apache ORC specification, `ORCv1.md`: [orc.apache.org](https://orc.apache.org/specification/ORCv1/). Rendered from `apache/orc`'s `main` branch, fetched 2026-10-31. The stripe/stream layout and the built-in row-group index this topic's ORC-side measurement follows.
- Apache Hive, ACID and Transactions: [cwiki.apache.org](https://cwiki.apache.org/confluence/display/Hive/Hive+Transactions). Fetched 2026-10-31. Hive's row-level ACID history and why only ORC got the integration work.
- Apache Parquet project documentation: [parquet.apache.org](https://parquet.apache.org/docs/overview/) and its [Motivation](https://parquet.apache.org/docs/overview/motivation/) page. Fetched 2026-10-31. Parquet's own framework-neutral design goal and its ecosystem of implementations.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=orc-versus-parquet:%20).
