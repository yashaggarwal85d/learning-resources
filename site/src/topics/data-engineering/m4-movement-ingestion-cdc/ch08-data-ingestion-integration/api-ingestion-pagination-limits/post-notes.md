<section data-section="outcomes">

## Outcomes

Show how offset pagination duplicates and drops rows under concurrent writes and fix it with a
keyset cursor. Honour a 429 and its wait time, and choose jittered backoff over fixed retries
with numbers. Make a write safe to retry with an idempotency key. State precisely what none of
these fixes touches: a long pull outliving its own access token.

</section>

<section data-section="internals">

## Internals: client resilience and cursor vocabulary, composed

This topic introduces no new resilience mechanism of its own. The backoff-and-retry pattern
Chapter 4 topic 9 already teaches for a single call is applied here to a whole ingestion loop,
not re-taught; this topic's own contribution is measuring that pattern's effect on total
completion time and wasted calls under real contention, specifically under rate limiting rather
than a generic transient failure. The cursor vocabulary topic 3 introduced for a database's own
`updated_at` column reappears here as a keyset cursor over an API's own rows — the identical
idea (name a row, not a position) applied to a source that speaks HTTP instead of SQL.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating a successful pull as a complete one.** The hook's own pull reports success every
single run while quietly duplicating and dropping real rows — nothing about offset pagination
raises an error when a concurrent write shifts the page window underneath it. A team watching
only for failed runs can carry this exact drift for a long time before a downstream row-count
check ever catches it.

**Guessing at a rate limit's own recovery time instead of reading it.** Step 6's own measurement
shows a client polling on a short fixed delay wasting many times more calls than a client that
simply reads the wait time the server already handed it. A team under heavy load that tunes its
own retry delay by feel, rather than honoring the number the API already gives it, pays in wasted
calls for information it already had.

</section>

<section data-section="frontier">

## Frontier

None claimed. Keyset pagination, token-bucket limiting, jittered backoff and idempotency keys
are each established, long-documented practice — this topic measures their real effect directly
rather than describing something new.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Databases and APIs are both asked for data. A third kind of source simply drops files and walks
away, onto an object store that has no atomic rename. How a pipeline picks them up safely is the
next topic.

</section>
