# OUTLINE: API ingestion: pagination, limits and retries (`de.api-ingestion-pagination-limits`)

## Learning outcomes
1. Show how offset pagination duplicates and drops rows under concurrent writes and fix it with
   a keyset cursor.
2. Honour a 429 and `Retry-After`, and choose jittered backoff over fixed retries with numbers.
3. Make a write safe to retry with an idempotency key.
4. Keep a long-running pull alive across token expiry and rotation without two workers
   invalidating each other.

## Engagement arc
- Hook: step 1 (an offset-paged nightly pull is missing and duplicating real rows, measured).
- Predict: step 2, within the first four steps (what a keyset cursor fixes and what it still
  cannot).
- Takeaways: step 4 (keyset fixes the shift, not every miss), step 6 (Retry-After beats guessing),
  step 8 (jitter beats fixed backoff), step 10 (idempotency key makes a retried write safe).
- Recap: step 11. Prove it: step 12 (the refresh-token race).

## Steps (storyboard)

### 1. Hook
- **fig:** an offset-paged nightly pull over a live, growing list: rows get duplicated and other
  rows never show up at all, counted directly.
- **On screen:** a page window sliding over a list that is still growing underneath it.

### 2. Predict
- **fig:** a keyset cursor, instead of an offset, pages the identical list under the identical
  writes. Which of the two problems does it fix, and which does it not?
- **Options:** (a) it fixes both duplicates and every missing row [wrong — a row deleted before
  the cursor ever reaches it is still gone, exactly like a hard delete]; (b) it fixes the
  duplicate re-reads an insert causes, but a row deleted before it's ever read is still missed
  [correct].

### 3. Reveal — offset pagination, measured
- **fig:** the real run: an insert at the head shifts every later row down one place so the next
  fetch re-reads a row already seen; a delete inside the already-read region shifts rows up one
  place so the next fetch skips one it never got to.
- **Moves:** a row highlighted as it slides into a page window a second time; a gap opening in
  the window where a deleted row used to be.

### 4. Reveal — keyset cursor, measured
- **fig:** the identical mutation pattern, read by a cursor naming the last row seen instead of a
  position; the insert no longer shifts anything the cursor has already consumed.
- **takeaway:** "A cursor on identity isn't shifted by an insert — but a row deleted before the cursor reaches it is still gone, same as any cursor."

### 5. Reveal — rate limits and the token bucket
- **fig:** a 429 response carrying a `Retry-After`; a token-bucket limiter refilling at a fixed
  rate, the exact model Stripe's own engineering post describes.
- **Narrator's line of thought:** she treats the 429 as information, not just a failure — it
  names the exact moment a token will exist again.

### 6. Reveal — obeying Retry-After vs. guessing, measured
- **fig:** the real run: a client that waits exactly as long as `Retry-After` says makes close to
  the minimum possible number of wasted calls; a client polling on a short fixed delay wastes far
  more, repeatedly asking before any token exists.
- **takeaway:** "Retry-After names the moment a token exists again — guessing with a short fixed delay wastes calls asking before it does."

### 7. Reveal — exponential backoff and the contention problem
- **fig:** the AWS Architecture Blog's own description of N clients competing for one resource,
  each round's losers backing off before trying again.
- **Narrator's line of thought:** she frames backoff as slowing everyone down together, not
  individually — the real question is whether every client slows down at the same moment.

### 8. Reveal — jitter, measured
- **fig:** the real run: fixed exponential backoff with no randomness clusters every client's
  retries at the same instants and costs far more total requests; full jitter spreads retries out
  and finishes with far fewer.
- **takeaway:** "Fixed backoff synchronizes every client's retries — jitter spreads them out and costs measurably less."

### 9. Reveal — idempotency keys for writes
- **fig:** Stripe's own documented behaviour: a client-generated key up to 255 characters, the
  first response saved and replayed on a retry with the same key and parameters.
- **Narrator's line of thought:** she treats the key as the write's own identity, separate from
  the data it carries — the same idea topic 3's idempotent merge used for a read-then-write.

### 10. Reveal — idempotency key, measured
- **fig:** the real run: the identical write retried three times with the same key records exactly
  one charge and returns the identical response every time.
- **takeaway:** "An idempotency key makes a retried write as safe as a retried read — one charge, however many times the client asks."

### 11. Recap
- **fig:** the four fixes side by side: keyset cursor, Retry-After, jitter, idempotency key — and
  the one thing none of them touches, a long-running pull's own access token expiring mid-pull.

### 12. Prove it
- **fig:** two workers both holding the same refresh token race to refresh it at once, the way a
  long pull split across workers might.
- **predict options:** (a) both succeed, since they're asking for the same thing [wrong — the
  authorization server rotates the refresh token on the first success, per RFC 6749 §6, which
  invalidates it for the second]; (b) one succeeds and the other is locked out with an
  `invalid_grant` error, unless the two coordinate through a shared lock [correct].

## Post-notes headings
- **Internals:** none claimed independently — the token-bucket and backoff-with-jitter
  mechanisms are each named and sourced, not invented; Chapter 4 topic 9's resilient-client
  patterns and topic 3's high-watermark-cursor vocabulary are reused, not re-taught.
- **Lab:** hosts the REST half of the 8.1 chapter lab per `CHAPTER.md`'s lab-hosting table — the
  mock paginated API, the 429 storm and the keyset/backoff fixes are this topic's own executable
  evidence; the crash-mid-batch injection and idempotent `MERGE` re-run are topic 6's.
- **Production:** the hook's own scenario (a clean-looking offset pull quietly losing and
  duplicating rows) as the concrete shape this topic's fixes exist to prevent.
- **Frontier:** none claimed — keyset pagination, token buckets, jittered backoff and
  idempotency keys are each established, long-documented practice.
- **Where this goes next:** databases and APIs are both asked for data. A third kind of source
  simply drops files and walks away, onto an object store with no atomic rename — how a pipeline
  picks them up safely is the next topic.

## Concept ledger
- **Introduces:** `keyset-pagination-consistency`, `rate-limit-backoff-ingestion`.
- **Uses:** `resilient-client-patterns` (Chapter 4 topic 9), `high-watermark-cursor` (topic 3) —
  both confirmed live via the registry-parsing script.
- **Declared:** basic HTTP (per `CHAPTER.md`).

## Changes from the chapter plan
None. Both named `uses` ids resolve live in `registry.ts`.

## Claims list (for fact-check)
1. HTTP 429 indicates rate limiting and MAY include a `Retry-After` header. — SOURCES.md (RFC
   6585).
2. `Retry-After` can be an HTTP-date or a number of seconds. — SOURCES.md (RFC 9110).
3. An OAuth refresh MAY issue a new refresh token, which replaces and can revoke the old one. —
   SOURCES.md (RFC 6749).
4. Jittered backoff reduces both total requests and completion time versus no-jitter exponential
   backoff under contention. — SOURCES.md (AWS Architecture Blog), measured directly in
   `examples.py`.
5. Stripe idempotency keys are up to 255 characters and are pruned after at least 24 hours (API
   v1). — SOURCES.md (Stripe docs).
6. Stripe uses a token-bucket algorithm for its own rate limiter. — SOURCES.md (Stripe blog).
7. Offset pagination duplicates and drops rows under concurrent inserts and deletes; a keyset
   cursor fixes the duplication but not a delete of an unread row. — measured directly in
   `examples.py`.
8. An idempotency key makes a retried write record exactly one charge. — measured directly in
   `examples.py`.
9. Two workers racing to refresh the same stale token cannot both succeed; a shared lock removes
   the race. — measured directly in `examples.py`, following RFC 6749's own rotation rule.
