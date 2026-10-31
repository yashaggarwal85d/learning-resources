---
id: de.object-storage-semantics-data
title: 'Object storage semantics for data engineers'
---

<section data-section="outcomes">

## Outcomes

- State which S3 operations are strongly consistent today and since when.
- Explain why a single PUT is atomic but a rename is not, and what that costs an analytics job that writes then renames.
- Use If-None-Match and If-Match to build a real compare-and-swap against a local S3-compatible server.
- Explain what a per-prefix request-rate limit is and why a hot key range throttles.
- State the gap a table format closes that conditional writes alone leave open.

</section>

<section data-section="internals">

## Internals

- **The engine of record for this topic, and why it changed.** AWS's own documentation and launch posts are quoted and dated throughout, but every live demonstration in `examples.py` runs against a local, pip-installable S3-compatible server (`moto`'s `ThreadedMotoServer`), not MinIO as the chapter's own engine-of-record note originally named. MinIO's open-source server and client release channel (`dl.min.io`) now returns HTTP 410 Gone, with the project's own notice that it is "archived and no longer maintained" — checked directly at research time, not assumed. The substitute was verified, not assumed, to raise real `412 Precondition Failed` responses for both `If-None-Match` and `If-Match` before a single example was written.
- **Consistency and concurrency control are different questions.** S3's strong read-after-write and list consistency (automatic since December 2020) answers "what does a read see after a write." It says nothing about "is a second write allowed to happen." A client that re-reads a key immediately before writing it still has a gap between its own read and its own write; only a precondition the store evaluates at write time — not a read the client performs beforehand — closes that gap.
- **Why there is no atomic rename, by the API itself.** Neither the S3 API nor its clients (including `boto3`) expose a rename or move call. Moving an object is, and has always been, `copy_object` followed by `delete_object` — two separate requests. AWS's own stated reason: "updates are key-based," with "no way to make atomic updates across keys... unless you design this functionality into your application."
- **Why ADLS Gen2's hierarchical namespace exists at all.** Azure's own documentation names the exact case this matters for: "Hive and Spark often write output to temporary locations and then rename the location at the conclusion of the job," and "this rename operation can often take longer than the analytics process itself" on a flat namespace — because every object under the old prefix has to be copied and deleted individually. A hierarchical namespace turns that into one directory-entry update.
- **The exact shape of the three conditional-write launches.** `If-None-Match` (create-if-absent) shipped first, on `PutObject` and `CompleteMultipartUpload`. `If-Match` (update-if-unchanged, keyed to the object's ETag) followed a few months later, on the same two operations. Conditional `CopyObject` — plus matching `s3:if-match`/`s3:if-none-match` bucket-policy condition keys — came roughly a year after that, closing the same gap for a copy instead of a direct write. Each was its own, separately dated launch, not one feature released in three parts at once.

</section>

<section data-section="production">

## Production

A common, real-shaped incident: a team builds a "commit log" on top of S3 by having every writer list the bucket, check the highest sequence number, and PUT the next entry one higher. Under light load it works. Under real concurrency, two writers list at nearly the same instant, both compute the same "next" sequence number, and both PUT — the second silently overwrites the first, exactly like the hook in this topic, and the log loses an entry with no exception anywhere. The fix a team eventually converges on is almost always the one this topic builds directly: stop reading the bucket to decide what to write, and instead let the write itself carry a precondition (`If-None-Match` on the next sequence key) so the store, not a stale client-side read, decides which writer actually gets that slot.

</section>

<section data-section="frontier">

## Frontier

The chapter's own 10.1 lab (hosted by a later topic) races twenty concurrent writers against a local S3-compatible server under both approaches side by side: a naive list-then-put commit log loses entries under real concurrency, while the same twenty writers using `If-None-Match` lose none, measured and counted directly rather than asserted from theory. The same lab then provokes a real `503 Slow Down`-style throttle with a single hot prefix and fixes it by sharding the key space — the two mechanisms this topic introduces, run together against one shared example instead of in isolation.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A conditional write protects exactly one key. It says nothing about how long that byte should even exist, what it costs to keep it, or how a reader finds the current, consistent set of files that make up a table spanning thousands of keys at once — which is exactly the next question this chapter asks, and exactly the gap a table format (Iceberg, Delta, Hudi, previewed here only by name) is built to close.

</section>
