# Sources: Ingestion modes: push vs pull, batch vs streaming (`de.ingestion-modes-push-vs`)

*Fundamentals of Data Engineering* (Reis & Housley), the ingestion chapters, is used as secondary
framing only (no fetch, no verbatim quote, per the chapter plan's own Sources line for this
topic) and is not relied on for any checkable claim. The two claims this topic measures or states
precisely come from the systems' own documentation, fetched and quoted below.

## Spark Structured Streaming: Programming Guide, Getting Started (Apache Spark docs)

URL: https://spark.apache.org/docs/latest/streaming/getting-started.html
Version: Spark 4.2.0 documentation (the Structured Streaming Programming Guide, "As of Spark
4.0.0 ... broken apart into smaller, more readable pages"; this is the page for the Programming
Model)

> A query on the input will generate the "Result Table". Every trigger interval (say, every 1 second), new rows get appended to the Input Table, which eventually updates the Result Table.

Contents: the Input Table / Result Table model for Structured Streaming; the trigger interval as
the unit that advances the Result Table (this topic's own primary source for "a micro-batch is a
small read on a trigger interval", not an adjective); Complete/Append/Update output modes (not
used by this topic, out of scope); the end-to-end exactly-once design (offsets, checkpointing,
idempotent sinks — used by topic 6, not here).

## Design: Push vs. pull (Apache Kafka documentation)

URL: https://kafka.apache.org/44/design/design/
Version: Kafka 4.4 documentation ("Design" page; the `#design_pull` fragment of the redirected
`/44/documentation.html#design_pull` URL resolves here, confirmed from the site's own redirect
map fetched at `https://kafka.apache.org/44/documentation.html`)

> An initial question we considered is whether consumers should pull data from brokers or brokers should push data to the consumer. In this respect Kafka follows a more traditional design, shared by most messaging systems, where data is pushed to the broker from the producer and pulled from the broker by the consumer.

> However, a push-based system has difficulty dealing with diverse consumers as the broker controls the rate at which data is transferred. The goal is generally for the consumer to be able to consume at the maximum possible rate; unfortunately, in a push system this means the consumer tends to be overwhelmed when its rate of consumption falls below the rate of production (a denial of service attack, in essence). A pull-based system has the nicer property that the consumer simply falls behind and catches up when it can.

> The deficiency of a naive pull-based system is that if the broker has no data the consumer may end up polling in a tight loop, effectively busy-waiting for data to arrive. To avoid this we have parameters in our pull request that allow the consumer request to block in a "long poll" waiting until data arrives (and optionally waiting until a given number of bytes is available to ensure large transfer sizes).

Contents: Kafka's own stated reason for a pull-based consumer over a push-based one (a slow
consumer falls behind instead of being overwhelmed); the long-poll fix for the naive pull-loop's
busy-waiting; the producer-pushes/consumer-pulls split this topic's own push/pull vocabulary
names directly (the data path from producer to broker is push, broker to consumer is pull — this
topic's "push" and "pull" positions are the consumer-facing half of that split).
