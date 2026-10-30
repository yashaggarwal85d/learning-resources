Last verified: 30 October 2026. Expert sign-off: pending. Two measured experiments run in this
sandbox (`examples.py`): a join-order (filter-before-join vs. join-before-filter) comparison, and
an end-to-end re-run of the chapter's three other committed topic scripts, both against this
sandbox's own Postgres.

- TPC-H Standard Specification, Revision 3.0.1: [tpc.org](https://www.tpc.org/tpc_documents_current_versions/pdf/tpc-h_v3.0.1.pdf). The eight-table schema and twenty-two-query workload, quoted directly.
- TPC-DS Standard Specification, v3.2.0: [tpc.org](https://www.tpc.org/tpc_documents_current_versions/pdf/tpc-ds_v3.2.0.pdf). The snowflake schema and ninety-nine-query workload, quoted directly.
- ClickBench, README: [raw.githubusercontent.com](https://raw.githubusercontent.com/ClickHouse/ClickBench/main/README.md). The single-flat-table shape and its own stated trade-off, quoted directly.
- Leis, Gubichev, Mirchev, Boncz et al., "How Good Are Query Optimizers, Really?" (PVLDB 2015): [vldb.org](https://www.vldb.org/pvldb/vol9/p204-leis.pdf). The Join Order Benchmark's own stated purpose, quoted directly.
- TPC, Current Specifications listing: [tpc.org](https://www.tpc.org/tpc_documents_current_versions/current_specifications5.asp). TPC-DI's obsolete status, confirmed directly.
- Wikipedia, "David DeWitt" (DeWitt Clause section): [en.wikipedia.org](https://en.wikipedia.org/wiki/DeWitt_Clause). The DeWitt clause's own mechanism and origin, quoted directly.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=analytical-benchmark-suites:%20).
