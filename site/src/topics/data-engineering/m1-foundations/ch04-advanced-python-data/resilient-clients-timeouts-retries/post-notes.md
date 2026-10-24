<section data-section="outcomes">

## Outcomes

A client-side timeout measurably bounds how long a call holds the client's own resources: a
deliberately slow endpoint and a fast one, called through the same timeout, give up and return
exactly where expected. Deadline propagation shares one absolute deadline down a call chain
rather than inventing a fresh timeout per hop; a three-hop chain's last hop measurably skips its
own work once the shared deadline it was handed has already passed, rather than running it
anyway. Capped exponential backoff alone still produces correlated clusters of retries — the
predict step's own trap — and jitter is what measurably spreads them out, confirmed both by a
real client retrying against a real flaky server and by a direct simulation of a hundred
synchronized clients with and without it. A retry budget and a circuit breaker solve two
different problems: a token-bucket budget caps a single client's own total retry volume
(measured directly by the real server's own call count matching the budget exactly), while a
circuit breaker stops calling a struggling dependency at all once it trips (measured directly:
microseconds once open versus the full timeout while still closed). An idempotency key turns a
retried write into exactly one real effect, confirmed against the server's own internal effect
counter rather than just the client-visible responses.

</section>

<section data-section="lab">

## Lab

Feeds the §4.2 chapter lab's resilience logic directly (per `CHAPTER.md`), built here against a
real fault-injecting local HTTP server rather than a hypothetical one. Every number in
`examples.py` is a real measurement: a client timeout against a real slow vs. fast endpoint; a
three-hop deadline-propagation trail using real elapsed time; a real client backing off with full
jitter against a server that fails a fixed number of times, plus a disclosed simulation (matching
the source article's own simulated method) contrasting a hundred synchronized clients' retry
times with and without jitter; a real token-bucket retry budget against an always-failing server;
a real circuit breaker's measured open-vs-closed latency; and an idempotency-key dedup check
against the server's own real effect counter, with a no-key control kept in the same run as a
contrast.

</section>

<section data-section="production">

## Production failures this topic warns about

**Retrying independently at every layer of a multi-hop stack.** The sourced worked example
(three retries at each of a five-deep stack) multiplies load geometrically rather than
additively; the best practice this topic's sources name is retrying at a single point in the
stack, not at every hop.

**Having deadlines several orders of magnitude longer than the mean request latency.** A deadline
that's far too generous lets a small, real failure rate consume resources out of proportion to
its size, since every request that hits that oversized deadline ties up a client's resources for
far longer than a typical request ever would.

**Generating a fresh idempotency key on every retry attempt instead of reusing the same one.** The
whole mechanism depends on the server recognizing the retry as the same logical request; a key
that changes on every attempt defeats it entirely and produces exactly the double-effect failure
this topic's "Prove it" scenario diagnoses.

</section>

<section data-section="frontier">

## Frontier

Stripe's own idempotency docs describe a second behavior this topic doesn't measure or
demonstrate: reusing a key with different parameters produces an explicit error rather than a
second operation, since the idempotency layer compares incoming parameters against the original
request. This topic's own reveal measures the same-parameters retry path (the common case a
dropped response produces), not that mismatched-parameters error path.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A resilient client's retry logic is exactly the kind of code that looks correct and silently
isn't under replay or duplication. Next: the tests — including a property-based one built for
precisely that — that actually prove it.

</section>
