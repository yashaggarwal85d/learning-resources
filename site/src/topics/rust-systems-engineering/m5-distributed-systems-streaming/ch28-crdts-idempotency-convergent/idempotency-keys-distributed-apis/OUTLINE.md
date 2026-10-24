# Outline: Idempotency keys for distributed APIs (`rust.idempotency-keys-distributed-apis`)

Chapter 28, topic 73 (only full topic). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Build a real toy idempotency-key store: a real `(scope, key)` map, each entry either in progress or completed with a real, stored response, bounded by a real TTL.
2. Measure that a key's own scope genuinely keeps two otherwise-identical keys from colliding across different resources.
3. Measure that a duplicate request within a key's own TTL genuinely replays the exact stored response, without running the real side effect again.
4. Measure that a genuine race between two concurrent retries carrying the identical key is genuinely caught, so the real side effect still runs exactly once.
5. State, from Stripe's own API reference and from the IETF's own Idempotency-Key header draft, the real rules this topic's own code measures directly.

## Changes from the chapter plan

None. All claims are measured directly against a real toy idempotency-key store; nothing here needs root access, real network I/O, or real multiple machines.

## Reel steps (storyboard)

1. **"Two different resources each get a request carrying the identical idempotency key string. Does a real key's own scope keep them from colliding?"** (predict, hook) — `fig`: two resources, one key string. Options: yes, genuinely; scope is part of the key's own real identity (correct) / no, the second resource's request is genuinely rejected / only if an operator configures it that way.
2. **"Measured: both resources genuinely ran their own real side effect, and each one's own stored response is genuinely distinct"** — `fig`: the real, measured, distinct results. NO takeaway (phone swipe test "from" step; the point is stated in the body instead).
3. **"Now a duplicate request arrives, carrying the identical key, well within its own real TTL. Does it genuinely replay the stored response, or does it run the side effect again?"** (predict) — `fig`: the same key, a duplicate, still inside the TTL. Options: it genuinely runs the side effect again, just to be safe / it genuinely replays the exact stored response (correct) / it depends on how much time has passed.
4. **"Measured: the duplicate genuinely replayed the exact stored response, and the real side effect genuinely never ran a second time"** — `fig`: the real, measured replay. Takeaway naming exactly what an idempotency key buys a client that retries.
5. **"Now a second request, carrying the identical key, arrives while the first one is still genuinely running. Is that genuinely caught, or does it race the first one into running the side effect twice?"** (predict) — `fig`: two requests, the identical key, arriving close together. Options: it genuinely races, and the side effect genuinely runs twice / it is genuinely caught as a conflict, before either one runs the side effect twice (correct) / the second request genuinely waits forever.
6. **"Measured: the genuine race was genuinely caught; the real side effect ran exactly once, not twice"** — `fig`: the real, measured conflict. Takeaway naming exactly what a race is, and what catches it.
7. **"Once the key's own real TTL genuinely expires, is the identical key genuinely treated as brand new?"** (predict) — `fig`: the same key, now past its own TTL. Options: no, an expired key is genuinely rejected outright / yes, genuinely; the real side effect genuinely runs again (correct) / only if the client asks for a new key.
8. **"Measured: the genuinely expired key was genuinely treated as new, and the real side effect genuinely ran again"** — `fig`: the real, measured rerun. Takeaway naming exactly what a TTL is for.
9. **"Stripe's own API reference and the IETF's own Idempotency-Key header draft both state this exact mechanism directly: a completed retry replays the stored response, and a genuinely concurrent one gets a real conflict instead. Does this topic's own code measure exactly that rule?"** — `fig`: both sources' own words, shown directly. NO predict (continues directly from the measured work). NO takeaway (a connecting step naming the exact rule this topic's own code measures).
10. **Recap** — an idempotency key's own scope, TTL, stored response, and conflict check are four genuinely separate real rules, and together they are what lets a client safely retry a request it cannot otherwise prove ever arrived.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7, within this topic's own first eight steps.
- Step 9 deliberately connects rather than re-predicts, per `QUALITY.md`'s own guidance that a reel need not force a predict onto every remaining step.
- Surprising fact: step 4 (a duplicate never reruns the side effect) and step 6 (a race is caught as a real conflict, not a silent double-run).
- Takeaways: steps 4, 6, 8 (three — step 2 deliberately has none, the reel's own "from" step for the phone swipe test; step 9 deliberately has none too, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| Stripe saves the status code and body of the first request made with a given idempotency key; retries with the same key return the saved response | Stripe API Reference (quoted) |
| you can remove keys from the system automatically after they're at least 24 hours old; a new request is generated if a key is reused after the original is pruned | Stripe API Reference (quoted) |
| results are saved only after endpoint execution begins; if the request conflicts with another request executing concurrently, the idempotent result is not saved | Stripe API Reference (quoted) |
| a retry after the original request completed should get a response consistent with the request being completed according to the user's intent | IETF Idempotency-Key header draft (quoted) |
| a retry before the original request completed should get a resource conflict error | IETF Idempotency-Key header draft (quoted) |
| a key's own scope genuinely keeps two otherwise-identical keys from colliding across different resources | `examples/runtime-demo/src/idempotency_key_scope_ttl_and_replay.rs` (executed, measured) |
| a duplicate request within a key's own TTL genuinely replays the exact stored response, without running the real side effect again | `examples/runtime-demo/src/idempotency_key_scope_ttl_and_replay.rs` (executed, measured) |
| a genuine race between two concurrent retries carrying the identical key is genuinely caught, so the real side effect still runs exactly once | `examples/runtime-demo/src/idempotency_key_scope_ttl_and_replay.rs` (executed, measured) |
| once a key's own TTL genuinely expires, the identical key is genuinely treated as new, and the real side effect genuinely runs again | `examples/runtime-demo/src/idempotency_key_scope_ttl_and_replay.rs` (executed, measured) |

## Concept ledger

- `introduces`: `idempotency-key-scope-ttl-and-replay` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `idempotent-consumer-removes-duplicate-effect` (topic 71's own concept, this topic reuses the identical idempotency-key idea at the API layer)
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Chapter 27 measured exactly-once at the log layer; this chapter's own full topic measures the practical, narrower cousin of that same idea at the API layer, with no broker or log underneath it."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "This chapter measured how a single idempotency key keeps one logical request safe to retry; the next milestone turns to the engineering disciplines that make a whole Rust system fast, sound, embeddable, releasable, and diagnosable, starting with measuring performance itself before explaining it."
