# Outline — de.resilient-clients-timeouts-retries

## Learning outcomes

1. Set a timeout on every call, and propagate a shared deadline through a call chain rather than
   inventing a fresh one at every hop.
2. Implement exponential backoff with jitter, and show directly why jitter specifically fixes
   what capped backoff alone doesn't.
3. Use a retry budget and a circuit breaker to stop a struggling dependency from being retried
   into the ground, instead of retrying forever or tripping on every single failure.
4. Design an idempotency key and dedup check that makes a retried write produce exactly one
   effect, no matter how many times the request is actually sent.

## Reel steps (storyboard)

1. **Hook: a pool decides how many connections exist — what happens when one fails?**
   - `fig`: "topic 33 pooled the connection — this topic is what happens the moment one of its calls actually fails"
   - Visual: "a pool" / "how many connections exist" vs. "a failed call" / "not yet handled".
   - Narrator's line: names the real handoff (a pool says nothing about failure; this topic is exactly that).

2. **Reveal: connection timeout, measured**
   - `fig`: "a slow endpoint vs. a fast one, called through the same client timeout — measured directly"
   - Visual: "slow endpoint, timeout set" / "client gives up, measured" vs. "fast endpoint" / "returns well under the timeout".
   - Takeaway: a timeout is the one thing standing between a stuck call and a client that holds its resources forever.

3. **Reveal: deadline propagation through a call chain**
   - `fig`: "one shared deadline, handed down three hops — does the last hop still do the work?"
   - Visual: "hop one" / "ran, time left" vs. "hop two" / "ran, less time left" vs. "hop three" / "skipped, deadline already gone".
   - Takeaway: a shared deadline lets the last hop in a chain refuse work nobody will ever collect, instead of finishing it anyway.

4. **Predict: does adding randomness to a backoff actually help, or just add noise?** (within first four ✓)
   - `fig`: "capped exponential backoff already spreads retries out — does adding randomness actually help more?"
   - Options: "No — capped exponential backoff on its own already prevents clients bunching up" / "Yes — capped backoff alone still produces clusters of retries" (correct).
   - Explain: capped exponential backoff slows every client down by the same schedule, so they still retry in lockstep; measured directly, jitter is what actually breaks the cluster up.

5. **Reveal: backoff with jitter, measured and simulated side by side**
   - `fig`: "a real client backing off with jitter against a real flaky server, and a hundred synchronized clients with and without it"
   - Visual: "real retries, jittered" / "succeeds, bounded by the cap" vs. "a hundred clients, no jitter" / "cluster together" vs. "the same hundred, jittered" / "spread out, measured".
   - Takeaway: jitter isn't cosmetic randomness — it's the one change that actually spreads retries out, measured directly against the same clients without it.

6. **Reveal: a retry budget, enforced directly**
   - `fig`: "a fixed number of retry tokens against a server that never recovers — what happens once they run out?"
   - Visual: "tokens available" / "client retries" vs. "tokens exhausted" / "client fails fast, stops calling".
   - Takeaway: a retry budget caps how selfish a client is allowed to be, measured directly by how many calls the server actually receives.

7. **Reveal: a circuit breaker fails fast**
   - `fig`: "the same failing call, before and after the breaker trips open — measured elapsed time, not claimed"
   - Visual: "closed, still failing" / "pays the full timeout" vs. "open, after it trips" / "fails in microseconds, no call made".
   - Takeaway: an open circuit breaker doesn't fail faster by luck — it stops calling the dependency at all, measured directly against the same call while still closed.

8. **Reveal: an idempotency key, deduplicated for real**
   - `fig`: "the identical write, sent three times with one key — one server-side effect, or three?"
   - Visual: "same key, sent three times" / "one real effect" vs. "no key at all" / "a new effect every time".
   - Takeaway: an idempotency key doesn't make a retry safe by promise — it's a real, measured dedup check against the server's own effect count.

9. **Recap**
10. **Prove it** — a production scenario: a client retries a payment call after a dropped response, with no idempotency key and a deadline that resets at every hop. What actually breaks, and what's the fix?

## Engagement arc

- Hook (1): the real handoff from topic 33 (a pool exists; this topic is what happens when one of its calls fails).
- Predict within first four: step 4.
- Surprising number: step 5 (jitter's measured clustering contrast) and step 7 (microseconds vs. a full timeout, measured).
- Takeaways: steps 2, 3, 5, 6, 7, 8 (six, well over the minimum three).
- Recap: step 9. Prove it: step 10, synthesis task.

## Post-notes headings

- **Outcomes** — restated above.
- **Lab** — feeds the §4.2 chapter lab's resilience logic directly, built here against a real fault-injecting local HTTP server.
- **Production failures** — retrying without a deadline or budget; a circuit breaker tuned to trip on noise; a retried write with no idempotency key.
- **Frontier** — none claimed beyond what's measured/sourced here.
- **Where this goes next** — hands off to testing data code (topic 10): a resilient client's retry logic looks correct and silently isn't under replay; next, the tests — including a property-based one — that actually prove it.

## Claims list

1. Timeouts are the maximum amount of time a client waits, and retries let a client survive partial/transient failures → AWS Builders' Library.
2. The preferred solution is backoff, most commonly exponential, and circuit breakers introduce modal behavior that's hard to test — Amazon instead limits retries locally with a token bucket → AWS Builders' Library.
3. Retrying at every layer of a multi-hop stack multiplies load (a worked 243x example); APIs with side effects need idempotency to be safely retried → AWS Builders' Library.
4. Capped exponential backoff alone still produces clusters of correlated retries; adding jitter (Full Jitter / Equal Jitter / Decorrelated Jitter) is what actually spreads them out and cuts client work → AWS Architecture Blog, "Exponential Backoff And Jitter".
5. A server-wide retry budget (e.g. a fixed number of retries per minute) contains the retry effect once exhausted, rather than retrying forever → Google SRE book, ch. 22.
6. Deadline propagation shares one absolute deadline down a call tree instead of a fresh timeout per hop; a server working past its caller's already-expired deadline wastes resources for no credit → Google SRE book, ch. 22.
7. A circuit breaker has three states (Closed, Open, Half-Open) driven by a failure threshold and a success threshold, and exists to fail fast rather than wait on a doomed call → Azure Architecture Center, Circuit Breaker pattern.
8. An idempotency key lets a client safely retry a write; Stripe stores the first response (success or failure) and replays it for the same key, erroring if the same key is reused with different parameters → Stripe API docs, Idempotent requests.
9. The measured connection-timeout cost, the deadline-propagation trail, the backoff-with-jitter attempt count and sleep times, the retry-budget call count, the circuit breaker's measured open-vs-closed latency, and the idempotency dedup effect count → direct sandbox measurement (`examples.py`), never attributed to a source.

## Changes from the chapter plan

None.
