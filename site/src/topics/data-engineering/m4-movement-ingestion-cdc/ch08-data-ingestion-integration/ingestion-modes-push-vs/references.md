Last verified: 30 October 2026. A seeded Poisson-arrival simulation (`examples.py`, three hundred
orders over a two-hour window) cut by three poll intervals, run on this sandbox: one example row's
own delay and the average delay and burst size across all three hundred orders, for batch,
micro-batch and streaming, each run and asserted.

- Apache Spark docs, "Structured Streaming Programming Guide: Getting Started": [spark.apache.org](https://spark.apache.org/docs/latest/streaming/getting-started.html). The trigger-interval model a micro-batch actually runs on.
- Apache Kafka docs, "Design: Push vs. pull": [kafka.apache.org](https://kafka.apache.org/44/design/design/). Why Kafka's own consumers pull from brokers instead of being pushed to, and the long-poll fix for a naive pull loop's busy-waiting.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=ingestion-modes-push-vs:%20).
