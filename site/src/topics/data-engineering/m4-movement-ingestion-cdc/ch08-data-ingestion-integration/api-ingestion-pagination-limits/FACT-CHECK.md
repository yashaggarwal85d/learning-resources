# Fact-check — de.api-ingestion-pagination-limits

## Claims re-derived against the source

1. **HTTP 429 and `Retry-After`.** SOURCES.md's RFC 6585 quotes support this directly: 429 means
   rate limiting, and the response MAY include `Retry-After`. `examples.py`'s
   `TokenBucketLimiter.request` reproduces this exactly: an empty bucket returns status 429 with
   a computed `retry_after`.
2. **`Retry-After`'s two legal forms.** RFC 9110's quote supports this directly; this topic's own
   mock only exercises the seconds form (matching Stripe's own documented behaviour), named here
   rather than independently measured.
3. **OAuth refresh-token rotation.** RFC 6749 §6's quote supports this directly: a new refresh
   token MAY be issued, and the client MUST discard the old one. `examples.py`'s `OAuthServer`
   reproduces this as a strict rule (the old token stops working immediately), which is the
   documented MAY-case, disclosed as such, not the only legal server behaviour.
4. **Jitter reduces total requests and completion time under contention.** Not an invented
   mechanism — `examples.py`'s `backoff_collisions` reproduces the AWS Architecture Blog's own
   described experiment (N clients competing for one winner per round) in a discrete-tick
   simulation and measures the result directly: full jitter finished in about a third of the
   ticks and about half the total requests of fixed exponential backoff, across five different
   random seeds.
5. **Stripe's idempotency-key behaviour and token-bucket limiter.** Both from SOURCES.md's direct
   quotes. `examples.py`'s `PaymentsAPI` and `TokenBucketLimiter` model the documented behaviour
   (key-keyed cached response; bucket refilled at a fixed rate), not an independent invention.
6. **Offset pagination duplicates and drops rows; a keyset cursor fixes the duplication but not
   every miss.** Not from an external source — `examples.py`'s own direct measurement: the same
   mutation pattern (an insert after odd pages, a delete after even pages) produces duplicates
   and misses under offset pagination, and zero duplicates but one surviving miss (from a delete
   of a row not yet read) under keyset pagination.

## Red-team pass on the predict questions

- **Predict 1 (step 2):** the wrong option ("keyset fixes both problems completely") is a
  natural first guess, since cursor pagination is genuinely marketed as "the fix." It's ruled out
  directly by claim 6's own measurement: a row deleted before the cursor ever reaches it leaves
  exactly the same gap a hard delete leaves for any cursor (topic 3's own vocabulary, reused
  correctly here) — no pagination strategy can read a row that is already gone.
- **Predict 2 (step 12, "Prove it"):** checked directly against RFC 6749 §6's own rotation rule
  (claim 3): the server's MAY-issue-a-new-token behaviour, modeled strictly in `OAuthServer`,
  makes the second worker's refresh attempt use a token that has already been superseded. This is
  a direct consequence of the documented rotation rule, not an invented race condition — and the
  lock-based fix is the obvious, standard remedy (serialize the refresh, don't let two workers
  attempt it from the same stale token at once).

## Illustrative numbers (figs for steps 1, 6, 8, 10)

The specific row counts in the hook (duplicates and misses out of a thirty-row mock list), the
exact wasted-call counts in step 6, and the exact tick/request counts in step 8 are this topic's
own synthetic reproduction, run deterministically in `examples.py` — not a cited real incident's
numbers. The mechanisms themselves (offset-pagination drift under concurrent writes, Retry-After
versus guessing, jitter versus fixed backoff, idempotency-key replay, refresh-token rotation) are
each measured directly and reproducibly against the mock, or quoted verbatim from a primary
source, not illustrative.

## Outcome

No open findings. Every claim about HTTP status codes, `Retry-After`, OAuth refresh rotation,
Stripe's idempotency keys and its own rate limiter traces to one of SOURCES.md's ten verbatim
quotes across six independent primary sources; the pagination, backoff-jitter and idempotency
measurements are `examples.py`'s own direct, reproducible runs against a mock API; both predicts
are checked against the topic's own cited mechanism and measured facts, not invented reasoning.
