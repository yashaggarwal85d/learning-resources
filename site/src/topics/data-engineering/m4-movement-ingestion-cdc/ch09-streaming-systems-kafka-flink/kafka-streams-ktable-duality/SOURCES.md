Sources fetched and quoted for `de.kafka-streams-ktable-duality`.

## Architecture (Apache Kafka Streams, 4.4 docs)

URL: https://kafka.apache.org/44/streams/architecture/

> Kafka Streams uses the concepts of partitions and tasks as logical units of its parallelism model based on Kafka topic partitions.

> Kafka Streams creates a fixed number of tasks based on the input stream partitions for the application, with each task assigned a list of partitions from the input streams (i.e., Kafka topics). The assignment of partitions to tasks never changes so that each task is a fixed unit of parallelism of the application.

> It is important to understand that Kafka Streams is not a resource manager, but a library that "runs" anywhere its stream processing application runs.

> Every stream task in a Kafka Streams application may embed one or more local state stores that can be accessed via APIs to store and query data required for processing.

> For each state store, it maintains a replicated changelog Kafka topic in which it tracks any state updates. These changelog topics are partitioned as well so that each local state store instance, and hence the task accessing the store, has its own dedicated changelog topic partition. Log compaction is enabled on the changelog topics so that old data can be purged safely to prevent the topics from growing indefinitely.

> To minimize this restoration time, users can configure their applications to have standby replicas of local states (i.e. fully replicated copies of the state). When a task migration happens, Kafka Streams will assign a task to an application instance where such a standby replica already exists in order to minimize the task (re)initialization cost.

## Core Concepts (Apache Kafka Streams, 4.4 docs)

URL: https://kafka.apache.org/44/streams/core-concepts/

> there is actually a close relationship between streams and tables, the so-called stream-table duality.

> this duality means that a stream can be viewed as a table, and a table can be viewed as a stream.

> The stream-table duality is such an important concept that Kafka Streams models it explicitly via the KStream, KTable, and GlobalKTable interfaces.

> As of the 2.6.0 release, Kafka Streams supports an improved implementation of exactly-once processing, named "exactly-once v2", which requires broker version 2.5.0 or newer. This implementation is more efficient, because it reduces client and broker resource utilization, like client threads and used network connections, and it enables higher throughput and improved scalability. As of the 3.0.0 release, the first version of exactly-once has been deprecated.

## Streams Rebalance Protocol (Apache Kafka Streams, 4.4 docs)

URL: https://kafka.apache.org/44/streams/developer-guide/streams-rebalance-protocol/

> The Streams Rebalance Protocol is a broker-driven rebalancing system designed specifically for Kafka Streams applications. Following the pattern of KIP-848, which moved rebalance coordination of plain consumers from clients to brokers, KIP-1071 extends this model to Kafka Streams workloads.

> The Streams Rebalance Protocol is enabled by default on new clusters starting with Apache Kafka 4.2. Both brokers and clients must be running Apache Kafka 4.2 or later to use this protocol.

> warmup task support is not implemented yet.

## Configuring a Streams Application (Apache Kafka Streams, 4.4 docs)

URL: https://kafka.apache.org/44/streams/developer-guide/config-streams/

> Kafka Streams uses RocksDB as the default storage engine for persistent stores.

## Confluent Community License FAQ (Confluent)

URL: https://www.confluent.io/confluent-community-license-faq/

> The license change only applies to our Confluent software that was previously called "Confluent Open Source": Confluent Schema Registry, Confluent REST Proxy, Confluent ksqlDB and some Confluent Connectors.

> Under the Confluent Community License, you can access the source code and modify or redistribute it; there is only one thing you cannot do, and that is use it to make a competing SaaS offering.

## CONTRIBUTING.md (confluentinc/ksql repository, GitHub)

URL: https://raw.githubusercontent.com/confluentinc/ksql/master/CONTRIBUTING.md

> We are no longer accepting contributions from the community.

Notes on this topic's research: all six documents fetched clean on the first attempt (the
architecture, core-concepts, rebalance-protocol, and config-streams pages at the Kafka Streams
4.4 docs path, plus ksqlDB's own repository CONTRIBUTING.md file, fetched raw from GitHub rather
than a rendered docs page since the licence/contribution claim needed the project's own current
statement, not a secondary source). The Streams Rebalance Protocol's own 4.4 docs page doesn't use
the words "limited feature set" directly; "warmup task support is not implemented yet" is cited
instead as the concrete, current evidence that the GA protocol still has real feature gaps.
