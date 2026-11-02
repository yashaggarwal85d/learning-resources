Last verified: 30 October 2026. Expert sign-off: pending. One measured experiment run in this
sandbox (`examples.py`): a real Postgres logical replication slot, reproducing the shape of a
managed zero-ETL integration's documented cadence and prerequisites.

- AWS, "Zero-ETL integrations" (Amazon Redshift): [docs.aws.amazon.com](https://docs.aws.amazon.com/redshift/latest/mgmt/zero-etl-using.html). Supported zero-ETL sources, quoted directly.
- AWS, "DynamoDB zero-ETL integration with Amazon Redshift": [docs.aws.amazon.com](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/RedshiftforDynamoDB-zero-etl.html). The documented cadence and the point-in-time-recovery prerequisite, quoted directly.
- Microsoft Fabric, "Overview of Mirroring for SQL database": [learn.microsoft.com](https://learn.microsoft.com/en-us/fabric/database/sql/mirroring-overview). Mirroring's own zero-configuration claim, quoted directly.
- This course's own Chapter 17 topics, "Point-in-time correct training data" (`de.point-time-correct-training`) and "Serving contract and ownership handoff" (`de.serving-contract-ownership-handoff`), both live: the freshness-SLA vocabulary this topic reuses, reused by id, not re-derived.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=zero-etl-replication:%20).
