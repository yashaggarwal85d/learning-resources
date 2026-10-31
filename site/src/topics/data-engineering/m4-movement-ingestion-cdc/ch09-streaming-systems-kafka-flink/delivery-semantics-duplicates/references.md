Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`, toy delivery-semantics models, no real Kafka broker or consumer available): a
producer-retry duplication model, a consumer-crash reprocessing model, and an effect-count table
run across the same crash under each semantics. The semantics definitions and crash-window
mechanics are disclosed, sourced-only claims from Kafka's own current documentation and one
disclosed secondary engineering source, since no real pipeline runs in this sandbox.

- Apache Kafka 4.4 design documentation, "Message Delivery Semantics":
  [kafka.apache.org/44/design/design/](https://kafka.apache.org/44/design/design/). The three
  semantics' own definitions and both canonical crash windows this topic's predict/reveal pairs
  cite.
- Confluent engineering blog, "Exactly-once Semantics is Possible: Here's How Apache Kafka Does
  it":
  [confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it](https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/).
  Secondary framing (not Kafka's own docs, disclosed as such) for exactly-once as bounded by
  scope, this topic's "incomplete claim" reveal cites.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=delivery-semantics-duplicates:%20).
