Last verified: 2 November 2026. All of this topic's executed claims are real: a real minimal
catalog, built in this sandbox, performing namespace management, a real compare-and-swap pointer
move (including a real conflict and retry), real access control enforced before the compare-and-swap
runs, and real scoped, time-limited credential issuance -- not a simulation of any of it.

- Apache Iceberg, "Table Spec": [iceberg.apache.org](https://iceberg.apache.org/spec/). Fetched 2026-11-02. The atomic-swap / check-and-put commit mechanism.
- Apache Iceberg, "REST Catalog API": [raw.githubusercontent.com/apache/iceberg](https://raw.githubusercontent.com/apache/iceberg/main/open-api/rest-catalog-open-api.yaml). Fetched 2026-11-02. Vended credentials and namespaces.
- Apache Hive, "Hive Metastore thrift interface": [raw.githubusercontent.com/apache/hive](https://raw.githubusercontent.com/apache/hive/master/standalone-metastore/metastore-common/src/main/thrift/hive_metastore.thrift). Fetched 2026-11-02. Its real privileges, and what its tokens actually authenticate to.
- AWS, "What is AWS Lake Formation?": [docs.aws.amazon.com](https://docs.aws.amazon.com/lake-formation/latest/dg/what-is-lake-formation.html). Fetched 2026-11-02. Why fine-grained access control is a separate, bolted-on service.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=catalogs-as-commit-coordinators:%20).
