Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`, a toy TTL-bounded dedup store, a real small Bloom filter, and a deterministic-id
derivation, no external system available): a redelivery caught inside the window and missed
outside it, a measured Bloom-filter false-positive rate against 5000 unseen ids, and a derived id
recomputed identically and caught downstream. The idempotent-receiver pattern, message-id-based
dedup, and TTL-based key pruning are disclosed, sourced claims from Enterprise Integration
Patterns, Google Cloud, and Stripe's own current documentation.

- Idempotent Receiver (Enterprise Integration Patterns, Gregor Hohpe & Bobby Woolf):
  [enterpriseintegrationpatterns.com/patterns/messaging/IdempotentReceiver.html](https://www.enterpriseintegrationpatterns.com/patterns/messaging/IdempotentReceiver.html).
  The canonical definition of an idempotent receiver and its two means of achieving it.
- Exactly-once delivery (Google Cloud Pub/Sub docs):
  [cloud.google.com/pubsub/docs/exactly-once-delivery](https://cloud.google.com/pubsub/docs/exactly-once-delivery).
  A production system's own message-id-based redelivery recognition.
- Idempotent requests (Stripe API reference):
  [docs.stripe.com/api/idempotent_requests](https://docs.stripe.com/api/idempotent_requests).
  A production system's own TTL-bounded idempotency-key pruning (24 hours), the closest directly
  confirmed real-world analogue of this topic's bounded dedup window.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=deduplication-idempotent-consumers:%20).
