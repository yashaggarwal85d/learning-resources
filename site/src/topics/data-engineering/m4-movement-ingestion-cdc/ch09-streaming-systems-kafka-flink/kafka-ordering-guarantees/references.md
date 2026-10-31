Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`, toy ordering models, no real Kafka broker available): a non-idempotent-versus-
idempotent batch-delivery-order comparison, and a key-to-partition hash check across a real
partition-count change (using a deterministic stand-in hash function, disclosed in the code, in
place of Kafka's real murmur2-based partitioner — the claim under test is the mod-by-partition-
count mechanism, not the specific hash algorithm). The ordering and partitioning mechanics are
disclosed, sourced-only claims from Kafka's own current documentation, since no real broker runs
in this sandbox.

- Apache Kafka 4.4 producer configuration reference:
  [kafka.apache.org/44/generated/producer_config.html](https://kafka.apache.org/44/generated/producer_config.html).
  `enable.idempotence`, `max.in.flight.requests.per.connection`, and the five-in-flight ordering
  limit this topic's second predict/reveal pair quotes directly.
- Apache Kafka 4.4 design documentation:
  [kafka.apache.org/44/design/design/](https://kafka.apache.org/44/design/design/). The "totally
  ordered partitions" scope claim and the default partitioner's key-hashing behavior this topic's
  first predict/reveal pair and last reveal cite.
- Apache Kafka 4.4 operations documentation, "Basic Kafka Operations":
  [kafka.apache.org/44/operations/basic-kafka-operations/](https://kafka.apache.org/44/operations/basic-kafka-operations/).
  The key-to-partition mapping change on repartitioning, and the "Kafka will not automatically
  redistribute existing data" statement this topic's hook and last reveal cite.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=kafka-ordering-guarantees:%20).
