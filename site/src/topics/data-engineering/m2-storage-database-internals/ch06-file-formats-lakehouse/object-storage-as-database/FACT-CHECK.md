# Fact-check — de.object-storage-as-database

## Claims table

| # | Claim | Source |
|---|---|---|
| 1 | S3 delivers strong read-after-write consistency for any storage request, since December 2020. | AWS, Dec 2020 announcement |
| 2 | Before that, S3 was eventually consistent. | AWS, Dec 2020 announcement |
| 3 | S3 list operations are also strongly consistent since that change. | AWS, Dec 2020 announcement |
| 4 | S3's If-None-Match conditional write checks for object existence before creating it, added August 2024. | AWS, Aug 2024 announcement |
| 5 | Conditional writes let concurrent clients write without overwriting each other's objects, with no external coordination. | AWS, Aug 2024 announcement |
| 6 | Bucket policies can enforce conditional writes (`s3:if-match`/`s3:if-none-match` condition keys), added November 2024. | AWS, Nov 2024 announcement |
| 7 | PutObject's If-None-Match fails with 412 Precondition Failed if the key already exists. | AWS PutObject API reference |
| 8 | PutObject's If-Match fails with 412 Precondition Failed if the ETag doesn't match. | AWS PutObject API reference |
| 9 | S3 sustains at least 3,500 PUT/COPY/POST/DELETE or 5,500 GET/HEAD requests per second per partitioned prefix, with no limit on the number of prefixes. | AWS S3 performance guidelines |
| 10 | GCS object writes (upload/compose/copy) are immediately available for reading as soon as the write succeeds. | GCS consistency docs |
| 11 | GCS bucket and object listing are strongly consistent. | GCS consistency docs |
| 12 | ADLS (Azure Blob) supports If-Match and If-None-Match conditional headers, including the `*` wildcard for "only if it doesn't exist." | Azure conditional-headers docs |

## Currency

The three AWS "What's New" announcements are dated (December 2020, August 2024, November 2024)
and read as historical records, not living documents. The PutObject API reference, the S3
performance guidelines, the GCS consistency page and the Azure conditional-headers page are all
living documentation, fetched 2026-10-31 and cited as "as of this writing" — consistent with
every other topic in this chapter that cites a provider's own living docs.

## Red-team

- **Is the conditional-write demo real, or just asserted from documentation?** Real — `examples.py`
  runs an actual local S3-compatible HTTP server (moto's `ThreadedMotoServer`) and issues real
  boto3 requests over real HTTP. The 412 Precondition Failed responses are genuine server
  responses to a genuine second request, not hand-constructed to look that way.
- **Does moto's behavior actually match AWS S3's real behavior here, or could this be an artifact
  of the simulator?** Disclosed directly in `examples.py`'s own module docstring and in
  `post-notes.md`'s Frontier section: moto's *consistency and latency* are a local in-memory
  simulation and not claimed to match AWS's real network behavior. What this topic verifies for
  real is the *protocol*-level contract — a conditional header either commits a write or the
  server rejects it with 412 — which is the same HTTP-level contract AWS's own API reference
  (claim 7/8 above) documents, and which moto specifically implements to match.
- **Is the "no atomic rename" demonstration meaningful, or a strawman?** It directly reproduces
  the real failure mode: `copy_object` and `delete_object` are two separate API calls with
  nothing atomic between them. Stopping after the copy (simulating a crash, a timeout, or a
  process being killed between the two calls) is a reachable production state, not a contrived
  one — and the assertion (`BOTH_OBJECTS_EXIST_AFTER_COPY_BEFORE_DELETE is True`) checks it
  actually happened, not just that it's theoretically possible.
- **Is the LIST-cost claim about latency, or about call count?** About call count, specifically
  to avoid an unreliable wall-clock timing assertion: the real, deterministic fact asserted is
  that 250 objects at 50 objects per page takes exactly 5 round trips, not 1 — the mechanism
  behind "LIST cost" being a real, budgeted expense rather than a timing claim this sandbox can't
  make reliably over a local loopback connection. A measured wall-clock time is printed for
  context but not asserted on, since local-server timing is not representative of real S3
  network latency.
- **Does naming "request pricing" as a cost (per CHAPTER.md's own scope) overstate what this
  topic actually measures?** No — `post-notes.md` names it as a cost category every later topic's
  design has to budget for, sourced from AWS's own documentation structure (pricing is a stated,
  separate concern in S3's docs), without asserting a specific dollar figure this topic doesn't
  verify.

## Problem solving

`moto`, `boto3`, and `flask` (moto's server dependency) were not installed in this sandbox and
were installed via `pip install` for this topic's research and verification — consistent with
how `scripts/sources.mjs`'s own numbers-check only parses `reel.tsx`/`examples.py` as text
(it does not execute `examples.py` as part of the build), so this is a one-time local
verification step, the same role a debug run with asserts temporarily stripped played for every
earlier topic's hand-rolled structures. No implementation bugs were found: the conditional-write,
no-atomic-rename and LIST-pagination behaviors all matched the documented contract on the first
working version.
