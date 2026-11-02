## LinkedIn Engineering — "Benchmarking Apache Kafka: 2 Million Writes Per Second (On Three Cheap Machines)"

URL: https://engineering.linkedin.com/kafka/benchmarking-apache-kafka-2-million-writes-second-three-cheap-machines
Version: LinkedIn Engineering blog, 27 April 2014 (accessed 2026-10-30)

> Intel Xeon 2.5 GHz processor with six cores Six 7200 RPM SATA drives 32GB of RAM 1Gb Ethernet The Kafka cluster is set up on three of the machines. The six drives are directly mounted with no RAID (JBOD style). The remaining three machines I use for Zookeeper and for generating load.

> Single producer thread, no replication

> 821,557 records/sec

> Single producer thread, 3x asynchronous replication

> 786,980 records/sec

> This test is exactly the same as the previous one except that now each partition has three replicas (so the total data written to network or disk is three times higher). Each server is doing both writes from the producer for the partitions for which it is a master, as well as fetching and writing data for the partitions for which it is a follower.

> The key take away I would like people to have from this is that replication can be fast. The total cluster write capacity is, of course, 3x less with 3x replication (since each write is done three times), but the throughput is still quite good per client.

Contents (for the coverage map):
1. Hardware used for the benchmark (six-core 2.5GHz Xeon, six 7200RPM SATA drives JBOD, 32GB RAM, 1Gb Ethernet, three-machine cluster) — this topic quotes it in full every time it cites a throughput number.
2. Single-producer, no-replication throughput: 821,557 records/sec.
3. Single-producer, 3x async-replication throughput: 786,980 records/sec — barely lower per client, because replication cost is paid in total cluster capacity (3x), not client-visible throughput.
4. The "total data written is three times higher" statement — the actual mechanism (every byte written three times), not just the resulting number.

## AWS — "Best practices design patterns: optimizing Amazon S3 performance"

URL: https://docs.aws.amazon.com/AmazonS3/latest/userguide/optimizing-performance.html
Version: AWS S3 User Guide (accessed 2026-10-30)

> Your applications can easily achieve thousands of transactions per second in request performance when uploading and retrieving storage from Amazon S3.

> For example, your application can achieve at least 3,500 PUT/COPY/POST/DELETE or 5,500 GET/HEAD requests per second per partitioned Amazon S3 prefix. There are no limits to the number of prefixes in a bucket.

> You can increase your read or write performance by using parallelization. For example, if you create 10 prefixes in an Amazon S3 bucket to parallelize reads, you could scale your read performance to 55,000 read requests per second.

Contents (for the coverage map):
1. The per-prefix request-rate floor: at least 3,500 PUT/COPY/POST/DELETE and 5,500 GET/HEAD requests per second, per partitioned prefix.
2. No limit on the number of prefixes in a bucket, and that more prefixes parallelize to higher aggregate throughput (the worked example: ten prefixes to 55,000 reads/sec).

Note: this topic's own "reference numbers to carry in your head" table also needs a measured warehouse scan rate (CHAPTER.md: "stated as the builder measures them on the sandbox's DuckDB or Postgres, with the hardware recorded, never as a quoted vendor figure") — measured directly in `examples.py` rather than sourced from a page, per the chapter's own rule.
