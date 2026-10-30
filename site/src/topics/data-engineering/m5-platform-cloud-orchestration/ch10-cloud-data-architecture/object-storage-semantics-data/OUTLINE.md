# Outline — de.object-storage-semantics-data

**Kind:** full, §10.1. About 15 minutes.

## Scope (full syllabus line)

"Strong read-after-write and list consistency (S3 since Dec 2020), atomic single-object PUT but
no atomic rename (copy+delete) unlike ADLS Gen2 hierarchical namespace, conditional writes
(`If-None-Match` Aug 2024, `If-Match` Nov 2024, CopyObject Oct 2025) as compare-and-swap for
catalog-free commits and leases, per-prefix request-rate limits and `503 SlowDown`; why table
formats exist on top of these guarantees."

- Clause 1: strong read-after-write and list consistency since Dec 2020.
- Clause 2: atomic single-object PUT, but no atomic rename — copy+delete instead — unlike ADLS
  Gen2's hierarchical namespace.
- Clause 3: conditional writes (`If-None-Match`, `If-Match`, conditional `CopyObject`) as a
  compare-and-swap primitive for a catalog-free commit log or a lease.
- Clause 4: per-prefix request-rate limits and `503 SlowDown`.
- Clause 5: why table formats exist on top of these guarantees.

## Outcomes

State which S3 operations are strongly consistent today and since when. Explain why a single
PUT is atomic but a rename is not, and what that costs an analytics job that writes-then-renames.
Use `If-None-Match`/`If-Match` to build a real compare-and-swap (create-if-absent, update-if-
unchanged) against a local S3-compatible server. Explain what a per-prefix request-rate limit is
and why a hot key range throttles with `503 SlowDown`. State, in one sentence, the gap a table
format (Iceberg/Delta/Hudi, previewed only) closes that conditional writes alone leave open.

## Engagement arc

- Hook: step 1 (two processes race to write the same key with a naive list-then-put check; the
  loser's write is silently lost).
- Predict: step 2, within the first four steps.
- Takeaways: steps 4, 5, 6 (three total, all at or after the midpoint). Step 3 (first non-predict
  step after the predict step) carries **no** takeaway — the point goes in its body instead
  (known Playwright "swipe from the caption" gotcha on phone).
- Recap: step 7.
- Prove it: step 8 (full topic).

## Storyboard (8 steps)

### 1. Hook — "Two writers, one key, no error"
- Visual: two client boxes both read "key absent," both decide to write, both PUT succeed (HTTP
  200 each). The second write silently overwrote the first — no exception, no warning.
- What moves: the two PUTs land in sequence; the first client's write flashes once then its
  content is shown overwritten, with no error indicator anywhere on screen.
- Narrator's line of thought: open on the failure, not the fix. A naive "check, then write" is
  not a check at all on an object store — a PUT never refuses to happen just because something
  changed underneath it. That gap is the whole topic.
- No takeaway, no predict.

### 2. Predict — "Which guarantee closes this gap?"
- Predict question: "Two clients both PUT the same key with no error either way. Which single
  guarantee, if S3 had it, would make one of these two writes fail instead of silently losing
  data?" Options: "Stronger read-after-write consistency" / "A conditional write tied to the
  key's current state" (correct) / "A bigger request-rate limit" / "Versioned buckets". Wrong-
  option temptation: a learner who conflates "consistency" (what a read sees) with "concurrency
  control" (what a write is allowed to do) picks the first option — S3's consistency guarantee
  already means the second client's GET-before-PUT check would have seen the first client's
  write; the race is not a staleness problem, it's a missing precondition on the write itself.
- Answer/explain: a conditional write. Consistency guarantees when a write becomes visible, not
  whether a second write is allowed to happen. Only a precondition evaluated by the server at
  write time — not a read performed by the client beforehand — can close this race.
- What moves: on reveal, a precondition badge attaches to the second PUT and it flips from
  succeeding to a `412 Precondition Failed`, with the first write staying intact.

### 3. "What strong consistency actually promised, and when" — NO takeaway
- Visual: a timeline from "eventually consistent" (pre-Dec 2020) to "strong read-after-write and
  list consistency" (Dec 2020 onward), with a GET-immediately-after-PUT check landing on the new
  data on both sides of the line — the change is about *list* consistency and the historical
  default, not about today's single-object read.
- Real numbers/facts shown: AWS's own Dec 2020 announcement wording — strong read-after-write
  consistency for any storage request, strong consistency for list operations after a write, "at
  no additional cost."
- Narrator's line of thought: say plainly what changed and what didn't — a single key's own PUT-
  then-GET was never the hard case; a LIST right after a write used to be the one an engineer had
  to work around, and that workaround is the thing Dec 2020 made unnecessary.
- Body/caption: since December 2020, any read or list request on Amazon S3 immediately reflects
  the most recent write, with no extra cost or workaround required.
- No takeaway (gotcha: first non-predict step after the predict step).

### 4. "One PUT is atomic; a rename never was — unless the store has a hierarchy" — takeaway
- Visual: a single PUT to one key shown as one indivisible operation (a GET from a second thread
  mid-PUT sees either the old bytes or the new bytes, never a mix); beside it, a "rename" drawn
  as what it actually is on a flat object store — a COPY to the new key followed by a DELETE of
  the old one, two separate operations with a window between them; a third panel shows ADLS
  Gen2's hierarchical namespace closing that same gap by updating one directory entry instead of
  copying every blob underneath it.
- Real numbers: none (mechanism only); the contrast is sourced directly from AWS's and
  Microsoft's own wording.
- Narrator's line of thought: name the exact AWS sentence that matters here — updates are key-
  based, with no way to make an update of one key depend on an update of another, unless the
  application builds that itself. A rename is exactly that: two keys, two operations, no atomic
  link between them on a flat object store. ADLS Gen2 buys that guarantee back, which is exactly
  why a Hive/Spark write-then-rename job behaves so differently depending on which of the two
  it's writing to.
- Takeaway: "A PUT to one key is atomic; a rename across two keys never is on a flat object
  store — it's a copy and a delete with a real gap in between, unless the store has a
  hierarchical namespace like ADLS Gen2."

### 5. "Conditional writes turn one key into a lock" — takeaway
- Visual: against a local S3-compatible server, two clients race to create the same key with
  `If-None-Match: *` ("create if absent"); the first succeeds, the second gets `412`. Then a
  second scene: a lease key is updated with `If-Match: <etag>`; a client holding a stale ETag
  gets `412` instead of silently clobbering the lease holder's write.
- Real numbers: the exact three launch dates, named precisely — `If-None-Match` (Aug 20, 2024),
  `If-Match` (Nov 25, 2024), conditional `CopyObject` (Oct 29, 2025) — executed and asserted in
  `examples.py` against a local S3-compatible server standing in for S3 itself.
- Narrator's line of thought: say what this buys in one sentence an engineer would use it for: a
  catalog-free commit log (append the next entry only if no one else already did) or a lease
  (renew only if you still hold it) — both without a database, using only the object store's own
  server-side precondition check.
- Takeaway: "If-None-Match and If-Match turn a single key into a real compare-and-swap — create-
  if-absent or update-if-unchanged — enforced by the store, not the client."

### 6. "A hot key range throttles, even though the bucket has no limit" — takeaway
- Visual: many clients hammering the same narrow key prefix; request latency climbs and a share
  of requests come back `503 Slow Down`, simulated locally at the sourced rate; spreading the
  same requests across several prefixes removes the throttling entirely.
- Real numbers: the sourced baseline — at least 3,500 PUT/COPY/POST/DELETE or 5,500 GET/HEAD
  requests per second per partitioned prefix, no limit on the number of prefixes in a bucket —
  simulated and asserted in `examples.py` (the exact 503 behaviour is a local simulation of the
  sourced rate, disclosed as such, not a measurement against real S3).
- Narrator's line of thought: name the fix in the same breath as the problem — the limit is per
  prefix, not per bucket, so a hot key range (a single growing log file, a single lease key under
  heavy contention) throttles while the rest of the bucket is untouched; the fix is key-space
  design, not a quota increase.
- Takeaway: "A request-rate limit lives on the key prefix, not the bucket — a hot single key or
  narrow prefix throttles with `503 Slow Down` while the rest of the bucket has headroom to
  spare."

### 7. Recap — takeaway
- Three bullets: strong read-after-write/list consistency since Dec 2020 (step 3); one PUT is
  atomic, a rename never is (step 4); conditional writes are a real compare-and-swap, and a hot
  prefix throttles independently of the bucket (steps 5, 6).
- Takeaway (final, standalone): "Object storage gives you one atomic key and one real compare-
  and-swap — a catalog-free commit log or a lease still has to be built from those two primitives
  by hand, which is exactly the gap a table format closes next."
- Narrator's line of thought: hand off, don't just summarize — the honest limit of everything
  this topic just built (one key, one compare-and-swap) is precisely the opening for why Iceberg,
  Delta and Hudi exist at all, which the chapter picks up later.

### 8. Prove it
- A described scenario (e.g. "a client PUTs with `If-Match` set to an ETag it read three minutes
  ago, and the key has been updated twice since") — is the write accepted, rejected with `412`,
  or does it depend on something not yet given?

## Examples to execute (`examples.py`)

Run against a local S3-compatible server (`moto`'s `ThreadedMotoServer`, standing in for a real
S3 endpoint — see Changes from the chapter plan below), via `boto3`:

1. `naive_check_then_put_loses_a_write`: two clients both see the key absent, both PUT; the
   second PUT silently overwrites the first with no error — reproduces the hook.
2. `if_none_match_create_if_absent`: two clients both PUT the same new key with
   `IfNoneMatch="*"`; the first succeeds, the second raises `PreconditionFailed` (`412`) —
   reproduces step 2's reveal and step 5.
3. `if_match_update_if_unchanged`: a lease key updated with `IfMatch=<current ETag>` succeeds and
   returns a new ETag; a second update using the now-stale ETag raises `PreconditionFailed`.
4. `immediate_read_after_write`: a PUT followed immediately by a GET on the same key returns the
   just-written bytes, every time across repeated trials — the local server's own strong-
   consistency behaviour, matching AWS's sourced Dec 2020 guarantee.
5. `rename_is_copy_then_delete`: the client library has no atomic rename call at all; renaming a
   key is implemented as `copy_object` followed by `delete_object`, two separate requests with a
   real window between them, asserted by checking both keys exist simultaneously mid-sequence.
6. `hot_prefix_throttle_simulation`: a local token-bucket rate limiter configured at the sourced
   per-prefix baseline (3,500 writes/sec); a burst that exceeds it raises a simulated `503 Slow
   Down` on the excess requests, while the same burst spread across multiple prefixes (each under
   its own limiter) completes with zero throttled requests — disclosed as a simulation of the
   sourced rate, not a measurement of real S3 throttling behaviour.

## Bridge and handoff

- Bridge (from `CHAPTER.md` topic 2 entry, verbatim): "That map called object storage 'regional,'
  which sounds safe, but safety here means something exact — not 'the bytes survive,' but 'what
  does a read see right after a write, and what can two writers actually coordinate on, using
  only the store itself.'"
- Handoff (from `CHAPTER.md` topic 2 entry, verbatim): "A conditional write protects one key. It
  says nothing about how long that byte should even exist, or what it costs to keep it — which is
  the next question."

## Concept ledger

- **Introduces:** `object-store-consistency-guarantee`, `conditional-write-compare-swap`,
  `prefix-throttling-hot-key`.
- **Uses:** `failure-domain-blast-radius` (topic 1).
- **Declared:** basic HTTP (status codes, headers), basic object-storage vocabulary (bucket, key,
  PUT/GET/DELETE).

## Claims list (source for each)

1. "Amazon S3 now delivers strong read-after-write consistency automatically for all
   applications... without changes to performance or availability... at no additional cost." —
   AWS, Dec 2020 announcement.
2. "After a successful write of a new object or an overwrite of an existing object, any
   subsequent read request immediately receives the latest version of the object. S3 also
   provides strong consistency for list operations." — same source.
3. "Updates to a single key are atomic... you will get either the old data or the new data, but
   never partial or corrupt data." — AWS S3 user guide.
4. "Updates are key-based. There is no way to make atomic updates across keys... unless you
   design this functionality into your application." — same source.
5. Conditional writes support `PutObject`, `CompleteMultipartUpload`, and `CopyObject`; no
   additional charge for conditional reads, writes or deletes, including failed requests. — AWS
   conditional-requests docs.
6. `If-None-Match` conditional writes on `PutObject`/`CompleteMultipartUpload`, launched Aug 20,
   2024. — AWS What's New.
7. `If-Match` conditional writes (ETag-based), launched Nov 25, 2024. — AWS What's New.
8. Conditional `CopyObject` (`if-none-match`/`if-match`, plus matching bucket-policy condition
   keys), launched Oct 29, 2025. — AWS What's New.
9. At least 3,500 PUT/COPY/POST/DELETE or 5,500 GET/HEAD requests per second per partitioned S3
   prefix, no limit on the number of prefixes; `503 Slow Down` while S3 scales to a new rate. —
   AWS performance-optimization docs.
10. ADLS Gen2's hierarchical namespace gives atomic directory manipulation (one entry updated)
    where a flat object store has no such operation; Hive/Spark write-then-rename jobs are the
    motivating case, since a flat-namespace rename "can often take longer than the analytics
    process itself." — Microsoft Learn, ADLS Gen2 hierarchical namespace.
11–16. The six `examples.py` reproductions, each executed and asserted (see `FACT-CHECK.md`).

## Changes from the chapter plan

CHAPTER.md's engine-of-record note names **MinIO** as the local S3-compatible stand-in for this
chapter. At research time, MinIO's open-source server and client (`mc`) release channel
(`dl.min.io`) returns HTTP 410 Gone with a notice that "the open-source MinIO Server, MinIO
Client (mc) and MinIO KES projects are archived and no longer maintained" and "these files are no
longer served from this site" — confirmed directly against that URL, not from memory. No Docker
daemon is available in this builder's sandbox either, which rules out MinIO's container image as
a fallback. The substitute is `moto`'s `ThreadedMotoServer` (a pure-Python, pip-installable,
S3-API-compatible HTTP server, run locally on `127.0.0.1` with no network egress), driven by the
real `boto3` S3 client — confirmed directly in this sandbox to implement real `If-None-Match`/
`If-Match` precondition checks (a genuine `412 Precondition Failed` on a failed precondition, not
a stub) and genuine immediate read-after-write on the same key. The one guarantee this substitute
does **not** reproduce natively is per-prefix request-rate throttling, which CHAPTER.md's own
engine-of-record note already discloses as "simulated" rather than measured — `examples.py`
implements that simulation itself (a token-bucket limiter at the sourced rate), never claiming to
have measured real S3 throttling behaviour. Disclosed in full here and in `references.md`/
`post-notes.md`.
