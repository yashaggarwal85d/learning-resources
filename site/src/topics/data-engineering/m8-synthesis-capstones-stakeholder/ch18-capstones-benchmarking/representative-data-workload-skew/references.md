Last verified: 30 October 2026. Expert sign-off: pending. Four measured experiments run in this
sandbox (`examples.py`): a uniform baseline, a seeded Zipfian hot-key reproduction, a
correlated-vs-independent cardinality-estimate comparison, and a seeded-generator byte-reproducibility
check, all against this sandbox's own Postgres.

- PostgreSQL documentation, 14.2.2 Extended Statistics: [postgresql.org](https://www.postgresql.org/docs/current/planner-stats.html). The planner's own column-independence assumption, quoted directly.
- YCSB project, `workloads/workloada`: [raw.githubusercontent.com](https://raw.githubusercontent.com/brianfrankcooper/YCSB/master/workloads/workloada). Workload A's own Zipfian request distribution, quoted directly.
- YCSB project, `ZipfianGenerator.java`: [raw.githubusercontent.com](https://raw.githubusercontent.com/brianfrankcooper/YCSB/master/core/src/main/java/site/ycsb/generator/ZipfianGenerator.java). The generator's own description of a Zipfian distribution, quoted directly.
- TPC-H Standard Specification, Revision 3.0.1: [tpc.org](https://www.tpc.org/tpc_documents_current_versions/pdf/tpc-h_v3.0.1.pdf). The scale-factor convention, quoted directly.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=representative-data-workload-skew:%20).
