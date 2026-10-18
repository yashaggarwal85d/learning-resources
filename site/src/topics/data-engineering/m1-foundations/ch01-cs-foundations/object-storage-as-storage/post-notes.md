---
id: de.object-storage-as-storage
title: Object storage as a storage tier
---

<section data-section="outcomes">

## After this topic you can

- State the consistency and atomicity contract of S3-class object storage, and name what it rules out, such as a rename-based commit.
- Read a request's cost as T(n) = α + n/β, place object storage's α in tens to hundreds of milliseconds, and say why that makes it a latency-bound tier for small reads and a bandwidth tier only when you fetch big ranges in parallel.
- Size range requests and the number of concurrent requests needed to reach a bandwidth target, using α·β to pick a range size.
- Avoid per-prefix request throttling, and read a 503 (Slow Down) as back-pressure, not a bug.
- Upload a large object with multipart upload within the documented part and object limits, and retry one failed part rather than the whole object.
- Use a conditional write (`If-None-Match` / `If-Match`) as the primitive for a safe commit marker without a separate lock service.

</section>

<section data-section="internals">

## Into the internals

### What an object store is, and what it is not

An object store is a flat namespace that maps a **key** (a string such as `events/2026/10/13/part-000.parquet`) to an opaque **object** (a blob of bytes plus metadata), reached over HTTP. There is no filesystem underneath: the slashes in a key are part of the string, not directories, and what LIST calls a "prefix" is just a shared leading substring. This is the bottom rung of the chapter's memory hierarchy, under the local disks of the previous topic, and it trades the microseconds and `fsync` of a device for near-unlimited, cheap, durable capacity reached across the network.

The API is small and deliberately coarse, and the shape of the API is the first thing a data engineer has to design around:

| Operation | What it does | What it does **not** do (general-purpose S3 buckets) |
|---|---|---|
| `PUT` object | Writes a **whole** object atomically under a key; a second PUT replaces it whole | No in-place edit, no partial overwrite |
| `GET` object (optionally a byte range) | Reads the whole object, or a contiguous `Range:` of it | — |
| `HEAD` object | Reads metadata (size, ETag) without the body | — |
| `DELETE` object | Removes the object atomically | — |
| `LIST` (by prefix) | Enumerates keys sharing a prefix, paginated | No cheap "directory" move |
| `COPY` | Server-side copy to a new key | A copy is not a rename: it writes a new object, and the old key still exists until deleted |

Two absences dominate everything built on top. There is **no append** and **no rename** on a general-purpose bucket: to "change" an object you PUT a new whole object, and to "move" one you COPY then DELETE, which is two operations and therefore not atomic. (S3 Express One Zone *directory buckets* are the exception, below.) The three major stores agree on this shape. Amazon S3, Google Cloud Storage and Azure Blob Storage all expose a key-to-blob namespace over HTTP with whole-object writes; the differences that matter here are in their consistency and rate contracts, not in the data model.

### The consistency contract

For years S3 was eventually consistent for overwrites and lists, which quietly broke write-then-read pipelines. Since **December 2020** that is gone: Amazon S3 provides **strong read-after-write consistency** for PUT and DELETE of objects in all regions, for both new objects and overwrites, automatically and at no extra cost. The guarantees you can rely on, in AWS's own words:

- **Read-after-write.** "Any read (GET or LIST request) that is initiated following the receipt of a successful PUT response will return the data written by the PUT request." A new object immediately appears in a LIST of its bucket; a deleted object immediately disappears from reads and from LISTs.
- **Single-key atomicity.** "Updates to a single key are atomic." A GET concurrent with a PUT to the same key returns *either* the old object *or* the new one, "never partial or corrupt data." There is no read-your-partial-write and no torn object.
- **What is still weaker.** *Bucket configuration* changes (lifecycle, policy, replication settings) are eventually consistent. S3 gives no cross-key transaction: you cannot atomically swap two keys, and you cannot make N separate objects appear together.

Google Cloud Storage matches the two that matter: object read-after-write is strongly consistent (you "never receive a 404 Not Found or stale data" after a successful write), and both bucket listing and object listing are strongly consistent; granting and revoking access through IAM is the eventually consistent part. Azure Blob Storage is likewise strongly consistent for object reads after a successful write.

**What this contract rules out.** The one operation a table format or a lock-free pipeline most wants, *"rename my staged output into place if and only if nobody else did"*, is exactly what a bare object store cannot do atomically, because there is no rename and no multi-key transaction. Early lakehouse table formats worked around this with an external lock service (a DynamoDB table for Delta's commit log on S3). Conditional writes, below, are what finally remove that crutch.

### The cost of one request: α + n/β

The chapter's cost of a transfer is **T(n) = α + n/β**: a fixed per-request latency α, plus the bytes n over a bandwidth β. Object storage is the extreme of this affine shape, the tier where α is enormous and β is only reachable in parallel. Because the latency of a request is a *distribution*, not a single number, this is where the chapter introduces **latency percentiles**: p50 is the median request, p99 the request slower than ninety-nine percent of the rest, p99.9 slower than all but one in a thousand. A tier is only as fast as the percentile your job waits on, and a job that waits on many requests waits on a high one (the fan-out topic makes this precise).

AWS states the latency this way: latency-sensitive applications can expect **consistent latencies of roughly 100–200 ms for small objects** (and for the first byte of larger objects), with **medians in the tens of milliseconds for requests under 512 KB**. Compare the rungs above:

| Tier | α (per request / transfer) | β (per request / stream) | Source |
|---|---|---|---|
| DRAM | about 100 ns | tens of GB/s per core | topic 6 (canonical table) |
| NVMe SSD, 4 KiB random | tens of µs | a few GB/s sequential per drive | topic 6 / 10 |
| Same-AZ network | round trip well under 1 ms | 10–100 Gbit/s per machine | topic 6 / 21 |
| **Object storage (S3)** | **first byte ≈ tens of ms (p50, &lt;512 KB); ≈ 100–200 ms "consistent" for small objects** | **≈ 85–90 MB/s per request** (AWS whitepaper) | this topic |

α here is six to seven orders of magnitude larger than a cache hit. That single fact decides how you use the tier. The break-even range size, where a request spends as long waiting as transferring, is **α·β** (the same product topic 6 named). With α ≈ 100 ms and β ≈ 90 MB/s, α·β ≈ **9 MB** — which is exactly where AWS puts its recommended byte-range sizes of **8 MB or 16 MB**. Below that size you are paying mostly for the request; above it, mostly for bytes. So the rule for object storage is: **count requests, make each request fetch multiple megabytes, and run many requests at once.**

A worked floor for the running example's 1 TiB of `order_events`. A single request streams at about 90 MB/s, so one TiB (≈ 1,099,512 MB on the wire) takes about **3.4 hours** on one stream. To fill one machine's 10 Gbit/s link (≈ 1,250 MB/s), you need roughly **1,250 / 90 ≈ 14 concurrent requests**; to go faster you add machines, since there is no per-bucket bandwidth cap, only the per-prefix request-rate limit below. This is the chapter's lower-bound estimate applied to the bottom tier: the floor is max(bytes/β, requests × α / concurrency), and for small requests the second term wins.

### Per-prefix request-rate limits

Throughput scales by *parallelism*, but each **prefix** has a request-rate ceiling. S3 supports **at least 3,500 PUT/COPY/POST/DELETE and 5,500 GET/HEAD requests per second, per partitioned prefix**, with "no limits to the number of prefixes" — create ten prefixes and you get up to ten times the aggregate rate. When you exceed what a prefix is currently provisioned for, S3 returns **503 (Slow Down)** while it repartitions; the AWS SDKs retry these with backoff automatically. The design lesson: spread hot keys across many prefixes (a hash prefix, or date/shard components early in the key) rather than funnelling a burst through one. GCS expresses the same idea differently: a bucket auto-scales from a baseline of roughly **1,000 writes/s and 5,000 reads/s**, and you are told to **ramp the request rate up gradually** (and avoid sequential key names that hotspot one range) so auto-scaling can keep up.

### Range GETs and the Parquet footer

A `GET` may carry a `Range:` header to read only a contiguous slice of an object, "transferring only the specified portion." This is what makes columnar files on object storage practical. A **Parquet** file is a columnar format whose footer, at the *end* of the file, is a directory saying where each column's chunks live (this reuses `columnar-layout` from the caches topic; the format itself is Chapter 6's). Reading one column of a large Parquet object is therefore:

1. A small range GET of the last few kilobytes to read the footer length and footer.
2. One range GET per column chunk the query actually needs, at the byte offsets the footer gave.

A query that needs 3 of 30 columns moves roughly a tenth of the bytes, and skips entire row groups whose min/max statistics exclude them — the "what you actually move" lesson of the I/O cost model, realized as byte ranges. AWS adds one practical rule: if an object was written with multipart upload, GET it **aligned to the same part boundaries** for best performance, because a range can address an individual part directly.

### Multipart upload

A large object is not PUT in one shot. **Multipart upload** splits it into parts that upload independently and in parallel, then a final `CompleteMultipartUpload` assembles them server-side into one object. The documented limits (current S3 User Guide):

| Item | Limit |
|---|---|
| Maximum object size | 48.8 TiB |
| Maximum parts per upload | 10,000 |
| Part size | 5 MiB to 5 GiB (no minimum on the **last** part) |
| When to switch from a single PUT | around 100 MB |

Two consequences for the running example's 1 TiB compaction output. First, the part count is bounded: 1 TiB over at most 10,000 parts means a **minimum part size of about 105 MiB** — small-part uploads of a huge object are not allowed. Second, parallelism and retries are per part: if one part's upload fails or stalls, you retry **that part**, not the whole terabyte, and you can run dozens of parts concurrently to reach the bandwidth target above. Until `CompleteMultipartUpload` succeeds, no object exists under the key, so a reader never sees a half-written file — the write is still whole-object-atomic from a reader's point of view.

### Conditional writes

Since 2024, S3 PUT (and `CompleteMultipartUpload` and `CopyObject`) accept **preconditions**:

- **`If-None-Match: *`** (added August 2024): the write succeeds **only if no object exists at that key**. Two writers racing to create the same key: exactly one wins, the other gets `412 Precondition Failed`. This is a compare-and-set on existence.
- **`If-Match: <etag>`** (added November 2024): the write succeeds **only if the current object's ETag matches**, i.e. only if nobody changed it since you read it. This is optimistic concurrency control.

This is the primitive that lets a table format commit **without a lock service**. To publish version *n* of a table, write the manifest to a key encoding *n* with `If-None-Match: *`; the writer whose PUT succeeds owns the commit, and the loser retries against *n+1*. Combined with strong read-after-write consistency, that is enough to build atomic, serializable commits on a bare bucket — the mechanism Chapter 6's table formats use. Conditional reads (`If-Match` / `If-None-Match` on GET/HEAD) and conditional deletes exist too, at no extra charge beyond the normal request price, including for failed requests.

### S3 Express One Zone and directory buckets

The whole-object, no-append, no-rename model has one deliberate exception worth naming so a learner is not surprised by it. S3 **Express One Zone** *directory buckets* store data in a single Availability Zone for single-digit-millisecond access and add two operations general-purpose buckets lack: **appending** data to the end of an existing object (no minimum append size; up to 5 GB per append; up to 10,000 appends, sharing the 10,000-part budget), and an atomic **`RenameObject`** that renames in place "without any data movement." These are quoted from the current docs because they change the contract: a directory bucket is the one place where append and atomic rename exist. Everything else in this topic is about the general-purpose contract that the lakehouse is built on.

### Why lakehouse engines coalesce, cache and parallelize

Put the pieces together and the engine's behaviour follows from α, β and the rate limit:

- **Coalesce** nearby small ranges into one request near the α·β size (8–16 MB), so you pay one α for many columns' worth of bytes instead of one α per column chunk. Durner, Leis and Neumann (PVLDB 2023, "Exploiting Cloud Object Storage for High-Performance Analytics") study exactly this and build a download manager (AnyBlob) that picks cost- and throughput-optimal request sizes and concurrency; they show a query engine reading straight from object storage can match warehouses that cache on local SSDs.
- **Parallelize**: issue the ~14 concurrent requests needed to fill the NIC, spread across prefixes to stay under 5,500 reads/s each.
- **Cache** hot objects (footers, dimension tables, recently read chunks) on local NVMe or in memory, because the cheapest request is the one you do not send — the tens-of-milliseconds α dwarfs a local read.
- **Hedge** the slow tail: because p99 of a request is far above p50, a scan that waits on its slowest of many range GETs inherits that tail; sending a second copy of a lagging request recovers it. That is the fan-out topic's job; here it is enough to see *why* object-store reads need it.

The economics (per-request and egress pricing) that also push toward few, large requests are left to §3.3, and the table formats that use conditional writes to Chapter 6.

</section>

<section data-section="lab">

## Build, break, measure

This topic hosts the §1.2 lab part **"against an object store across range sizes."** Run it against a local S3-compatible server so it is reproducible on a clean machine, with an injected network delay to make the latency realistic; or point it at a real bucket.

### Set up a local object store with realistic latency

1. Run a local S3-compatible server (MinIO or similar) and create a bucket.
2. Add a fixed one-way delay on the loopback or container interface so each request pays a realistic first-byte latency. One command does it (the TCP/handshake refresher, topic 19, writes the shared `tc netem` setup the §1.4 labs reuse):

   ```sh
   # Add ~50 ms of delay to the interface the client uses (so RTT ≈ 100 ms).
   sudo tc qdisc add dev lo root netem delay 50ms
   # Remove it afterwards:
   # sudo tc qdisc del dev lo root netem
   ```

3. Upload the running example's `order_events` as one large Parquet object with **multipart upload**, using parts near 100 MiB.

### Sweep range size × concurrency

Fetch a fixed total number of bytes while varying the **range size** (for example 64 KiB, 256 KiB, 1 MiB, 8 MiB, 16 MiB, 64 MiB) and the **number of concurrent requests** (1, 2, 4, 8, 16, 32). For each cell record throughput (MB/s) and the request-latency **p50 and p99**. Expected shapes (measure in build; the exact numbers depend on your machine and the injected delay):

- At tiny range sizes, throughput is capped near **range_size / α** per stream — you are latency-bound, and most of each request is first-byte wait. Throughput climbs steeply as the range approaches **α·β** (here ≈ 9 MB with a 100 ms delay) and then flattens: past α·β you are bandwidth-bound and bigger ranges barely help.
- Adding concurrency multiplies throughput almost linearly until you saturate the link (or, on a real bucket, approach the per-prefix request rate), then flattens.
- p99 sits well above p50 and the gap widens with concurrency and small ranges.

Plot throughput against range size for each concurrency, and mark the α·β point.

**Break it.**

- Drive one prefix past its rate limit on a real bucket (many tiny GETs at high concurrency) and watch for **503 (Slow Down)**; then split the keys across several prefixes and see the aggregate rate rise. On the local server, lower the client's connection pool and watch throughput collapse to one stream.
- Fetch a single column from the Parquet object with **range GETs** (footer, then one range per needed column chunk) versus downloading the whole object and discarding the rest; compare bytes moved and wall-clock. This is "what you actually move," measured.
- Create a key with `If-None-Match: *` from two writers at once; confirm exactly one succeeds and the other gets `412`. This is the commit-marker primitive, tested.

</section>

<section data-section="production">

## In production

A review checklist for anything that reads or writes object storage:

- **Treat it as a latency tier, not a disk.** One request is tens to hundreds of milliseconds at p50 and worse at p99. Never issue one request per small record or per small block. Coalesce reads into multi-megabyte ranges near α·β (AWS names 8 MB or 16 MB) and keep many requests in flight.
- **Parallelize, and spread across prefixes.** Throughput comes from concurrency, not from any single fast request. Keep each prefix under its ceiling (S3: ≈ 3,500 writes / 5,500 reads per second per prefix) and treat **503 (Slow Down)** as expected back-pressure to retry with backoff — the SDKs already do, so do not disable it.
- **Never rely on rename or append on a general-purpose bucket.** A "move" is COPY + DELETE and is not atomic; design commits around whole-object PUTs and conditional writes instead. Reach for S3 Express directory buckets only when you specifically need append or atomic `RenameObject` and single-AZ latency.
- **Use multipart upload for large objects, and retry parts.** Switch to multipart around 100 MB; stay within 10,000 parts and 5 MiB–5 GiB per part; on a stall, retry the part, not the object. No object is visible until `CompleteMultipartUpload`, so readers never see a torn file.
- **Make commits safe with conditional writes.** `If-None-Match: *` for create-once (a commit marker, a lock-free "exactly one writer wins"); `If-Match: <etag>` for optimistic update. Combined with strong read-after-write consistency, this removes the need for an external lock service.
- **Cache the cheapest request away.** Footers, small dimension tables and hot chunks belong in a local NVMe or memory cache; the request you don't send is the fastest one.
- **Hedge the tail for latency-critical scans.** A scan that waits on its slowest range GET inherits the store's p99.9; a hedged second request bounds it (topic 22).

</section>

<section data-section="next">

## Where this goes next

The bytes come back exactly as written. Next: whether those bytes still mean the right number.

</section>
