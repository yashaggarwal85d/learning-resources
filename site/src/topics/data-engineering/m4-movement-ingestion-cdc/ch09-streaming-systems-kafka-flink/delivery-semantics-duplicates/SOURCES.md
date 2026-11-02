Sources fetched and quoted for `de.delivery-semantics-duplicates`.

## Apache Kafka 4.4 design documentation

URL: https://kafka.apache.org/44/design/design/

> At most once –Messages may be lost but are never redelivered.

> At least once –Messages are never lost but may be redelivered.

> Exactly once –Each message is processed once and only once.

> If a producer attempts to publish a message and experiences a network error, it cannot be sure
> if this error happened before or after the message was committed.

> Prior to 0.11.0.0, if a producer failed to receive a response indicating that a message was
> committed, it had little choice but to resend the message. This provides at-least-once delivery
> semantics since the message may be written to the log again during resending if the original
> request had in fact succeeded.

> It can read the messages, process the messages, and finally save its position. In this case
> there is a possibility that the consumer process crashes after processing messages but before
> saving its position. In this case when the new process takes over the first few messages it
> receives will already have been processed. This corresponds to the "at-least-once" semantics in
> the case of consumer failure.

## Confluent engineering blog: "Exactly-once Semantics is Possible: Here's How Apache Kafka Does it"

URL: https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/

> Note that exactly-once semantics is guaranteed within the scope of Kafka Streams' internal
> processing only; for example, if the event streaming app written in Streams makes an RPC call to
> update some remote stores, or if it uses a customized client to directly read or write to a
> Kafka topic, the resulting side effects would not be guaranteed exactly once.

Notes on this topic's research: the Kafka 4.4 design documentation's own "Message Delivery
Semantics" section is the primary source for all three definitions and both canonical crash
windows (producer retry-after-lost-ack, consumer crash-before-offset-commit), confirmed still
current in 4.4. The Confluent engineering post is used only for its secondary framing of
exactly-once as bounded by scope — disclosed as secondary, not Kafka's own docs, per CHAPTER.md.
