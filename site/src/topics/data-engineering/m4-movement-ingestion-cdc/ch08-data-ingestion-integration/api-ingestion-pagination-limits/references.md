Last verified: 31 October 2026. Every measurement (`examples.py`) is a direct run against this
topic's own in-process mock API: an offset-vs-keyset pagination comparison under identical
inserts and deletes, a token-bucket limiter driven to exhaustion with both an obedient and a
guessing client, a twelve-client contention simulation under fixed and jittered backoff, a
payment-capture write retried three times with one idempotency key, and an OAuth refresh-token
race between two workers.

- RFC 6585, "Additional HTTP Status Codes": [rfc-editor.org](https://www.rfc-editor.org/rfc/rfc6585.txt). The 429 status code and its optional Retry-After.
- RFC 9110, "HTTP Semantics": [rfc-editor.org](https://www.rfc-editor.org/rfc/rfc9110.txt). Retry-After's two legal forms.
- RFC 6749, "The OAuth 2.0 Authorization Framework": [datatracker.ietf.org](https://datatracker.ietf.org/doc/html/rfc6749). The refresh-token rotation rule.
- AWS Architecture Blog, "Exponential Backoff And Jitter": [aws.amazon.com](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/). Why jitter beats fixed backoff under contention.
- Stripe docs, "Idempotent requests": [docs.stripe.com](https://docs.stripe.com/api/idempotent_requests). The documented idempotency-key behaviour.
- Stripe engineering blog, "Scaling your API with rate limiters": [stripe.com](https://stripe.com/blog/rate-limiters). The token-bucket limiter model.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=api-ingestion-pagination-limits:%20).
