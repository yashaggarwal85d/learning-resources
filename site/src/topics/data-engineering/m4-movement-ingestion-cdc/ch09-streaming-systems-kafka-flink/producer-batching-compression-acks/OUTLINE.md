# Outline: Producer batching, compression and acks (`de.producer-batching-compression-acks`)

## Progress

- [x] Research (`SOURCES.md`, 18 quotes verified via `node scripts/sources.mjs check`)
- [x] Real toy measurements verified (`examples.py`, all asserts pass)
- [x] Content plan / storyboard (this file)
- [ ] Fact-check (`FACT-CHECK.md`)
- [ ] Coverage map (`coverage.json`)
- [ ] Build every file (`reel.tsx`, `scenes.tsx`, `post-notes.md`, `references.md`, `pre-notes.md`, `prerequisites.mdx`, `narration.json`, registry entry)
- [ ] Content review (`REVIEW.md`)
- [ ] Checks and looks review
- [ ] Queue narration (`renarration.json`)
- [ ] Ship (merge, check, push, held)

**Note for whoever resumes this topic:** `../CHAPTER.md`'s topic 2 entry is this topic's contract.
Topic 1 (`de.partitioned-log-segments-indexes`) is live-shipped ahead of it (held); this topic
uses its `partition-segment-index` concept but does not re-teach it.

## Learning outcomes (from `CHAPTER.md`)

1. Tune `batch.size`/`linger.ms` for a latency/throughput target and predict the effect.
2. Explain why batch-level compression beats record-level.
3. Compare sticky partitioning to round-robin on batch fill.
4. Choose an `acks` level for a stated durability requirement and say what each gives up.

## Expert list (from the syllabus line and SOURCES.md)

1. Records for a keyless, unpartitioned send collect in an in-memory accumulator, one buffer per
   partition — *here.*
2. A batch closes (is sent) when it hits `batch.size` or `linger.ms` elapses, whichever happens
   first — *here* (quoted).
3. `linger.ms` defaults to 5 (not 0) since Kafka 4.0, specifically because the efficiency gain
   from slightly larger batches tends to match or beat the added wait under load — *here* (quoted).
4. A whole batch is compressed once, not record by record, so bigger batches compress better —
   *here* (quoted, and measured for real in `examples.py`).
5. The default (no-key) partitioner used to be pure round-robin; KIP-480 made it stick to one
   partition for a batch's lifetime, then move to the next — *here* (quoted).
6. Sticky partitioning changes which partition is "sticky" exactly when a new batch starts, not
   mid-batch, which is why switching does not hurt the latency of records already queued with a
   key — *here* (quoted).
7. `acks=0`: no wait at all, no delivery guarantee, the returned offset is always -1 — *here*
   (quoted).
8. `acks=1`: the leader writes and responds without waiting on followers; a leader crash right
   after can still lose the record — *here* (quoted).
9. `acks=all`/`acks=-1`: the leader waits for the full in-sync-replica set; this is the strongest
   guarantee the producer config offers — *here* (quoted).
10. Kafka 3.0 changed the client defaults: `enable.idempotence` false→true and `acks` 1→all,
    specifically to make the strongest guarantee the out-of-the-box behaviour — *here* (quoted,
    KIP-679's own before/after table).
11. Idempotence requires `acks=all`; if idempotence is on and a conflicting config is set, the
    client throws rather than silently downgrading — *here* (quoted).
12. What makes a replica count as "in-sync" in the first place, and what the high watermark is,
    is the next topic's job, not this one's — *later syllabus topic* (`de.replication-isr-high-watermark`).

## The reel's steps, storyboarded

### Step 1 — Hook: "lowest latency" that wasn't (`fig: BatchRace`)

- **On screen:** two request-count totals for the identical one thousand records, one producer
  configured for `linger.ms=0`, one left at the real Kafka default.
- **What moves:** `Surface` both totals landing, real numbers from `examples.py`: one thousand
  requests vs five hundred for the identical record stream, five thousand milliseconds of total
  request overhead vs two thousand five hundred.
- **Caption:** a team sets `linger.ms` to zero chasing "the lowest possible latency" and ends up
  issuing twice as many requests for the same work.
- **Narrator's line of thought:** poses the puzzle before explaining it — why would waiting a
  few milliseconds on purpose ever help?

### Step 2 — Setup: the accumulator (`fig: BatchRace`)

- **On screen:** one partition's in-memory buffer filling with records, a dashed line for the
  byte limit and a dashed line for the linger clock, both empty at the start.
- **Caption:** before anything reaches a broker, records sit here — per partition, in memory.
- **Narrator's line of thought:** corrects the intuitive mistake that each `send()` call is its
  own network request; nothing leaves the producer until a batch closes.

### Step 3 — Predict: "the clock runs out before the buffer fills. What happens?" (`fig: BatchRace`)

- **Options:** (a) the batch waits for `batch.size` anyway; (b) the batch is sent as it stands,
  partly full; (c) the partial batch is dropped and retried later.
- **Right answer:** (b). Wrong-but-tempting: (a) assumes the byte limit is a floor, not a
  ceiling; (c) imagines a batch can fail to "qualify" for sending, which nothing in the config
  supports.
- **Narrator's line of thought:** she names why (a) sounds plausible (treating `linger.ms` as a
  minimum instead of a maximum wait) before the reveal.

### Step 4 — Reveal: the race's real numbers (`fig: BatchRace`)

- **On screen:** the same toy run as step 1, now broken down: request count and average batch
  size for both settings.
- **Takeaway:** "Whichever line gets hit first closes the batch — a few milliseconds of wait can
  mean half as many requests."
- **Narrator's line of thought:** answers step 3 directly — this is literally the dashed-line
  race from step 2, now run to completion.

### Step 5 — Reveal: compression is per batch, not per record (`fig: CompressionPanel`)

- **On screen:** the same compressor run once on a single order-event record and once on a full
  eighty-record batch of the same shape, real zstd byte counts and ratios for both.
- **Takeaway:** "A bigger batch compresses far better than a lone record — compression is a
  batch-level trick, not a record-level one."
- **Narrator's line of thought:** ties directly back to step 4 — the same batching that cuts
  request count also makes compression worth doing at all.

### Step 6 — Predict: "no key, three partitions. Sticking to one partition instead of round-robin — bigger batches or smaller?" (`fig: PartitionFill`)

- **Options:** (a) bigger, since more consecutive records land together before switching; (b)
  no real difference, since the same records go out either way; (c) smaller, since one partition
  gets overloaded.
- **Right answer:** (a). Wrong-but-tempting: (b) assumes partitioning strategy is cosmetic; (c)
  confuses "sticks to one partition for a batch" with "sticks to one partition forever."
- **Narrator's line of thought:** she lets the learner reason from step 4's own batching logic
  before confirming it.

### Step 7 — Reveal: sticky vs round-robin, the real fill numbers (`fig: PartitionFill`)

- **On screen:** the identical nine hundred keyless records, routed two ways; batch counts and
  average batch size for each.
- **Takeaway:** "Sticking to a partition until its batch closes fills far bigger batches than
  spreading records thin from the first record."
- **Narrator's line of thought:** answers step 6, and connects back to step 4: this is the same
  batch-size payoff, earned by routing instead of waiting.

### Step 8 — Reveal: acks, and what each level risks (`fig: AcksLadder`)

- **On screen:** three flags planted at increasing distance (leader's socket buffer; leader's
  own log; the full in-sync-replica set), then a real toy leader-crash run: how many records an
  `acks=1` producer believed were safe versus how many it actually kept, next to the same count
  for `acks=all`.
- **Takeaway:** "`acks=all` is the client default since Kafka three-oh precisely because
  `acks=1` can tell a producer a record is safe just before losing it."
- **Narrator's line of thought:** she frames `acks=0`/`1`/`all` as a spectrum of how far the
  producer waits before declaring victory, then lets the crash simulation show the cost of
  stopping too early, directly tying back to Kafka's own 3.0 default change.

### Step 9 — Prove it (`fig: ProvePanel`)

- **On screen:** a results panel with the run's real numbers: request counts for both linger
  settings, the compression ratios, the sticky-vs-round-robin batch sizes, and the acks crash
  counts.
- **Caption:** every number in this reel came from a real toy producer run, just now.

### Step 10 — Recap

- **On screen:** four small icons along a short pipeline sketch (accumulator → compressor →
  partitioner → acks flag), one per takeaway.
- **Handoff line (spoken):** sets up topic 3 — "all of this assumed the leader simply has the
  record once it's written. What makes a follower count as caught up, and what the leader
  actually waits on for `acks=all`, is next."

## Post-notes headings (Deep dive)

- **Internals:** `RecordAccumulator`, `ProducerBatch` (named from the Kafka client source's own
  class names, not quoted or re-derived here); the real byte-based `batch.size` default (sixteen
  thousand three hundred eighty-four bytes) this toy's record-count cap scales down from.
- **Lab:** the toy accumulator, compression comparison, sticky-partitioning comparison and
  acks-crash simulation built and run in `examples.py`; the producer-side half of the 9.1
  chapter lab (`CHAPTER.md`'s lab table), feeding topic 3's loss-counting experiment.
- **Production:** `max.in.flight.requests.per.connection` (not covered here) governs how many
  batches can be outstanding at once and interacts with ordering once retries are involved —
  named as a real knob this topic's single-in-flight toy simplifies away, not taught.
- **Frontier:** idempotence's own sequence-number mechanism, which is what actually makes a
  retried `acks=all` write safe to repeat — named, taught in full at topic 10.
- **Where this goes next:** topic 3 (replication, ISR, high watermark) answers what `acks=all`
  is actually waiting on; topic 10 (idempotent producer) answers how retries stay safe.

## Engagement arc

- **Hook:** step 1 (twice the requests for "lowest latency").
- **Predict:** steps 3 and 6 (two, within the first eight of ten steps).
- **Surprising number:** step 1's two-request-counts-for-the-same-work gap, confirmed in step 9.
- **Takeaways (≥3):** steps 4, 5, 7, 8 (four).
- **Recap:** step 10.

## Examples to execute (`examples.py`)

1. `batch_race`: a single-partition accumulator racing `batch_cap` against `linger_ms`; assert
   a nonzero `linger_ms` strictly reduces request count and increases average batch size versus
   `linger_ms=0`, for the identical record stream.
2. `batch_bytes` + real `zstandard`/`lz4.frame` compression: assert an eighty-record batch
   compresses to a strictly better ratio than a single record of the same shape.
3. `partition_fill`: compare sticky vs round-robin routing of the same keyless record stream
   into the same three partitions under the same batch race; assert sticky's average batch size
   is strictly larger.
4. `acks_crash_sim`: a toy leader plus two followers, each replicating strictly behind the
   leader; assert an `acks=1` producer loses at least one record it believed durable when the
   leader crashes, and an `acks=all` producer loses none.
5. Every number above is asserted, not printed uncomputed, and is what steps one, four, five,
   seven, eight and nine show on screen.

## Claims list (claim → source)

1. A batch closes at `batch.size` or `linger.ms`, whichever first — producer config docs (quoted).
2. `linger.ms` defaults to five, changed from zero in Kafka 4.0, because larger batches tend to
   match or beat the added wait under load — producer config docs (quoted).
3. Compression is of whole batches, not individual records — producer config docs (quoted).
4. The default partitioner sticks to one partition per batch instead of round-robining — KIP-480
   (quoted).
5. The sticky partition changes only when a new batch opens, not mid-batch — KIP-480 (quoted).
6. `acks=0`/`1`/`all` each wait for a different point and give a different guarantee — producer
   config docs (quoted).
7. Kafka 3.0 changed `enable.idempotence` false→true and `acks` 1→all as client defaults — KIP-679
   (quoted, the exact before/after table).
8. Idempotence requires `acks=all` — producer config docs (quoted).

## Concept ledger

- **Introduces:** `producer-batching-linger`, `acks-durability-tradeoff`.
- **Uses:** `partition-segment-index` (topic 1).
- **Declared:** none beyond topic 1.

## Bridge / handoff

- **Bridge** (from topic 1): "A partition is a log a producer writes to. This topic is what a
  producer actually does before that write ever reaches the broker: batching, compressing, and
  deciding how much durability to wait for."
- **Handoff** (to topic 3): "`acks=all` means waiting for every in-sync replica, not just the
  leader. What makes a replica count as in-sync, and what happens when one falls behind or a
  leader dies, is the next topic."
