Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`, against a real, on-disk SQLite database): a queue message's genuine deletion on
acknowledgement, confirmed absent on a second request; a log's own offset rewind, confirmed to
replay the identical messages unchanged.

- RabbitMQ docs, "Consumer Acknowledgements and Publisher Confirms": [rabbitmq.com](https://www.rabbitmq.com/docs/confirms). Acknowledge-and-delete, negative-acknowledgement redelivery.
- AWS docs, "Amazon SQS visibility timeout": [docs.aws.amazon.com](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html). SQS's own redelivery-on-missing-deletion model.
- Apache Kafka docs, "Design": [kafka.apache.org](https://kafka.apache.org/44/design/design/). The offset's own rewindable, permanent position.
- Apache Kafka docs, "Upgrading" (4.2): [kafka.apache.org](https://kafka.apache.org/42/getting-started/upgrade/). Share groups' own production-readiness confirmation.
- KIP-932, "Queues for Kafka": [cwiki.apache.org](https://cwiki.apache.org/confluence/display/KAFKA/KIP-932%3A+Queues+for+Kafka). The proposal's own framing of cooperative consumption on regular topics.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=message-queues-vs-event:%20).
