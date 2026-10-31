Last verified: 30 October 2026. No live lab (per `CHAPTER.md`); the celebrity-key, salting,
secondary-index fan-out, and resharding-pause claims are checked executable claims (`examples.py`),
run and confirmed clean.

- Vitess, "Reshard" reference documentation: [vitess.io](https://vitess.io/docs/reference/vreplication/reshard/). Online resharding and the write-pause cutover a correct reshard pays for.
- CockroachDB, "Distribution Layer" architecture documentation: [docs.cockroachlabs.com](https://docs.cockroachlabs.com/docs/stable/architecture/distribution-layer). Range splitting once a range reaches its size threshold.
- AWS, "DynamoDB burst and adaptive capacity": [docs.aws.amazon.com](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/burst-adaptive-capacity.html). Adaptive capacity isolating a hot item onto its own partition.
- AWS, "General guidelines for secondary indexes in DynamoDB": [docs.aws.amazon.com](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-indexes-general.html). The documented local-vs-global secondary index scope difference.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=shard-keys-hot-shards:%20).
