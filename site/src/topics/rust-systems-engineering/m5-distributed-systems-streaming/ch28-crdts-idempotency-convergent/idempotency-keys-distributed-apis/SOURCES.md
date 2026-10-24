# Sources — Idempotency keys for distributed APIs

## Stripe API Reference — Idempotent requests
URL: https://docs.stripe.com/api/idempotent_requests
Fetched: 2026-10-24, cached at `sources/stripe-idempotent-requests.txt`.
> For API v1, Stripe saves the status code and body of the first request made with a given idempotency key after endpoint execution begins. Retries with the same key return the saved response, including 500 errors.

> For API v1, you can remove keys from the system automatically after they're at least 24 hours old. We generate a new request if a key is reused after the original is pruned. The idempotency layer compares incoming parameters to those of the original request and errors if they're not the same to prevent accidental misuse.

> For API v1, we save results only after the execution of an endpoint begins. If incoming parameters fail validation, or the request conflicts with another request that's executing concurrently, we don't save the idempotent result because no API endpoint initiates the execution.

## IETF — The Idempotency-Key HTTP Header Field (Internet-Draft)
URL: https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-idempotency-key-header
Fetched: 2026-10-24, cached at `sources/ietf-idempotency-key.txt`.
> The request was retried after the original request completed. The resource SHOULD respond with a response consistent with the request being completed according to the user's intent.

> The request was retried before the original request completed. The resource SHOULD respond with a resource conflict error.
