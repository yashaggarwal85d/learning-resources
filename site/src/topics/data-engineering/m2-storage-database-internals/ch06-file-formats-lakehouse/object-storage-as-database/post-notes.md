<section data-section="outcomes">

## Outcomes

State precisely what S3, GCS and ADLS guarantee today (strong read-after-write consistency, since
December 2020 for S3) and what they still don't (no atomic rename, per-request LIST cost and
latency, per-prefix request-rate limits). Demonstrate conditional writes (`If-None-Match`,
`If-Match`) for real, against a real local S3-compatible server, as the 2024 primitive that
enables an atomic compare-and-swap commit with no external coordination service. Name request
pricing and first-byte latency as costs every table-format design in this section has to budget
for.

</section>

<section data-section="one-primitive-three-problems">

## One primitive, three problems

Object storage was never a database, and this topic draws the line precisely instead of waving at
it: reads are strongly consistent (a real, verifiable guarantee), but a rename is genuinely two
unsynchronized requests, and a listing genuinely costs one round trip per page, not one for the
whole prefix. Conditional writes are the one real exception — a single HTTP header
(`If-None-Match` or `If-Match`) that turns an ordinary `PUT` into a real atomic compare-and-swap,
enforced by the object store itself. Every table format built on top of object storage (the next
several topics in this chapter) is really just a clever way of using that one primitive to make
atomic, multi-file commits out of a storage layer that otherwise offers none.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating a copy-then-delete "rename" as atomic.** This topic's own demonstration shows both the
original and the copy existing at once after a real `copy_object` call, before the matching
`delete_object`. A pipeline that assumes a renamed file disappears from its old location the
instant the rename call returns can read a half-renamed table and either double-count a file or
silently drop it, depending on exactly when it lists the prefix.

**Writing to object storage without a conditional header and assuming "last write wins" is safe.**
It silently is "last write wins" — no error, no warning, nothing to catch in a log. For an
append-only log or a file nobody else writes, that's fine. For anything that needs exactly one
writer's update to land (a table's metadata pointer, a lock file, a sequence number), skipping
`If-Match`/`If-None-Match` means a real second writer's work vanishes with no trace it happened.

</section>

<section data-section="frontier">

## Frontier

This topic's `examples.py` runs against `moto`'s local, in-memory S3-compatible server, not real
AWS infrastructure — its *consistency and latency* numbers are a simulation, not a measurement of
real S3 network behavior (disclosed directly in the script and in `FACT-CHECK.md`). What is real
is the *protocol*-level contract: a conditional header either commits a write or the server
rejects it with a genuine `412`, matching AWS's own documented API behavior exactly. Request
pricing (named in this topic's own outcomes) is not measured here at all — it is named as a real
cost category every later topic's design has to budget for, not quantified with a dollar figure.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Object storage's own limits — no atomic rename, listing cost — are exactly what broke the table
format everyone used before Iceberg and Delta existed: the plain directory-as-partition Hive
table.

</section>
