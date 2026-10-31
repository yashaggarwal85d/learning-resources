Last verified against these sources: 30 October 2026. Real measurement run in this sandbox
(`examples.py`, `measure_warehouse_scan_rate()`): a real in-memory DuckDB scan and sum over twenty
million generated rows, timed directly on this machine. Expert sign-off: pending.

- LinkedIn Engineering, "Benchmarking Apache Kafka: 2 Million Writes Per Second (On Three Cheap Machines)", 27 April 2014: [engineering.linkedin.com](https://engineering.linkedin.com/kafka/benchmarking-apache-kafka-2-million-writes-second-three-cheap-machines). The single-producer throughput figures, the benchmark's own hardware, and the replication cost statement.
- AWS, "Best practices design patterns: optimizing Amazon S3 performance": [docs.aws.amazon.com](https://docs.aws.amazon.com/AmazonS3/latest/userguide/optimizing-performance.html). The per-prefix request-rate floor and the parallelization example.
- J. D. C. Little, "A Proof for the Queuing Formula: L = λW", *Operations Research*, 1961 — framing only, not independently re-derived.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=back-envelope-capacity-estimation:%20).
