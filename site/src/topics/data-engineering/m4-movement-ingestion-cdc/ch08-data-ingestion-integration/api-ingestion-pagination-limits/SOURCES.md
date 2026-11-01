# Sources — de.api-ingestion-pagination-limits

`CHAPTER.md` names RFC 6585, RFC 9110, RFC 6749, the AWS Architecture Blog's jitter post,
Stripe's pagination and idempotent-requests docs, Stripe's rate-limiter engineering post,
GitHub's REST pagination and rate-limit docs, and the IETF idempotency-key header draft (named,
not quoted, since it is explicitly a draft). This topic quotes six independent primary sources.

## RFC 6585: Additional HTTP Status Codes

URL: https://www.rfc-editor.org/rfc/rfc6585.txt
Fetched: 2026-10-31.

Quotes:
> The 429 status code indicates that the user has sent too many requests in a given amount of time ("rate limiting").

> The response representations SHOULD include details explaining the condition, and MAY include a Retry-After header indicating how long to wait before making a new request.

Items: the exact status code and its optional `Retry-After` header this topic's mock limiter
returns, reproduced directly in `examples.py`'s `TokenBucketLimiter`.

## RFC 9110: HTTP Semantics (§10.2.3 Retry-After)

URL: https://www.rfc-editor.org/rfc/rfc9110.txt
Fetched: 2026-10-31.

Quotes:
> The Retry-After field value can be either an HTTP-date or a number of seconds to delay after receiving the response.

Items: the two legal forms of `Retry-After` the mock limiter's own `retry_after` value stands in
for (this topic always uses the seconds form, named here as the one Stripe's own API uses).

## RFC 6749: The OAuth 2.0 Authorization Framework (§6 Refreshing an Access Token)

URL: https://datatracker.ietf.org/doc/html/rfc6749
Fetched: 2026-10-31.

Quotes:
> The authorization server MAY issue a new refresh token, in which case the client MUST discard the old refresh token and replace it with the new refresh token.

Items: the exact rotation rule `examples.py`'s `OAuthServer` reproduces directly — a refresh
invalidates the old token, which is why two workers racing on the same stale token cannot both
succeed.

## AWS Architecture Blog: "Exponential Backoff And Jitter"

URL: https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
Fetched: 2026-10-31.

Quotes:
> The problem here is that N clients compete in the first round, N-1 in the second round, and so on.

> The no-jitter exponential backoff approach is the clear loser.

> It not only takes more work, but also takes more time than the jittered approaches.

Items: the exact contention shape (`examples.py`'s `backoff_collisions`) and the exact
conclusion (jitter reduces both the total requests made and the time to every client winning),
measured directly against this topic's own discrete-tick simulation of that same experiment.

## Stripe API Reference: Idempotent requests

URL: https://docs.stripe.com/api/idempotent_requests
Fetched: 2026-10-31.

Quotes:
> Idempotency keys are up to 255 characters long.

> For API v1, you can remove keys from the system automatically after they're at least 24 hours old.

Items: the exact idempotency-key behaviour `examples.py`'s `PaymentsAPI` reproduces directly —
a saved key returns the first response rather than repeating the write.

## Stripe Blog: "Scaling your API with rate limiters"

URL: https://stripe.com/blog/rate-limiters
Fetched: 2026-10-31.

Quotes:
> We use the token bucket algorithm to do rate limiting.

Items: the exact limiter model `examples.py`'s `TokenBucketLimiter` implements.
