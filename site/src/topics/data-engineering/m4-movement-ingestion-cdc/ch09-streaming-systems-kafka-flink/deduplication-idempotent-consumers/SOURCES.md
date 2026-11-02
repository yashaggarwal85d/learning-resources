Sources fetched and quoted for `de.deduplication-idempotent-consumers`.

## Idempotent Receiver (Enterprise Integration Patterns, Gregor Hohpe & Bobby Woolf)

URL: https://www.enterpriseintegrationpatterns.com/patterns/messaging/IdempotentReceiver.html

> Even when a sender application only sends a message once, the receiver application may receive
> the message more than once.

> Design a receiver to be an Idempotent Receiver--one that can safely receive the same message
> multiple times.

> Idempotency can be achieved through two primary means:
>
> Explicit "de-duping", i.e. the removal of duplicate messages.
>
> Defining the message semantics to support idempotency.

## Exactly-once delivery (Google Cloud Pub/Sub docs)

URL: https://cloud.google.com/pubsub/docs/exactly-once-delivery

> Pub/Sub supports exactly-once delivery, within a cloud region, based on a Pub/Sub-defined
> unique message ID.

> A redelivered message retains the same message ID between redelivery attempts.

## Idempotent requests (Stripe API reference)

URL: https://docs.stripe.com/api/idempotent_requests

> A client generates an idempotency key, which is a unique key that the server uses to recognize
> subsequent retries of the same request.

> For API v1, you can remove keys from the system automatically after they're at least 24 hours
> old. We generate a new request if a key is reused after the original is pruned.

Notes on this topic's research: per CHAPTER.md, Chapter 5's own Bloom-filter/probabilistic-
structures material is used by reference, not re-fetched or re-quoted here (its own topic
already sources and teaches the Bloom-filter mechanism). This topic's Bloom-filter false-positive
figure instead comes directly from `examples.py`'s own real run: a small Bloom filter built and
measured in this sandbox, with its false-positive rate counted from actual collisions, not cited
from any outside source. Stripe's idempotency-key TTL (removable after 24 hours) is the closest
directly confirmed, real-production analogue of "dedup state bounded by TTL" in CHAPTER.md's
scope; no single primary source was found that names a "watermark-relative" dedup bound by that
exact phrase (the syllabus marks the watermark variant as available "once topic 17 exists" in the
chapter's own planning notes), so this topic teaches the watermark variant as the logical
counterpart to a TTL bound — the same trade-off, keyed to stream progress instead of wall-clock
time — without claiming an independent citation for it.
