# Outline: Partitioned log storage: segments and indexes (`de.partitioned-log-segments-indexes`)

## Progress

- [x] Research (SOURCES.md, 11 quotes verified via `node scripts/sources.mjs check`)
- [x] Expert list (below, folded into this file ahead of `coverage.json` — not yet committed to `coverage.json` as its own commit)
- [ ] Content plan / storyboard (this file — in progress)
- [ ] Fact-check (`FACT-CHECK.md`)
- [ ] Coverage map (`coverage.json`)
- [ ] Build every file (`examples.py`, `reel.tsx`, `scenes.tsx`, `post-notes.md`, `references.md`, `pre-notes.md`, `prerequisites.mdx`, `narration.json`, registry entry)
- [ ] Content review (`REVIEW.md`)
- [ ] Checks and looks review
- [ ] Narrate (or queue in `renarration.json`)
- [ ] Ship (merge, check, push, held)

**Note for whoever resumes this topic:** the chapter plan (`../CHAPTER.md`) is this topic's contract. This is the first topic of a 27-topic chapter; nothing in this chapter builds on an earlier chapter-9 topic yet.

## Learning outcomes

1. Draw a partition's on-disk layout from segment and index files, and explain why the offset index is sparse rather than one entry per record.
2. Demonstrate active-segment rolling with real byte counts on a toy log.
3. State precisely what a zero-copy read avoids, and why it matters once many consumers read the same partition.
4. Explain why offsets are a consumer-owned concept, not something the broker tracks per record, and what that buys (cheap acknowledgement, free rewind).

## Expert list (from the syllabus line and SOURCES.md, before any plan)

1. A partition is a directory of segment files; only one segment (the active one) is open for appends at a time — *here.*
2. Within a segment, the `.log` file holds the actual records; a parallel `.index` file holds a sparse offset→byte-position map and a `.timeindex` file holds a sparse timestamp→offset map — *here* (`item` sourced from the Kafka storage module's own file-layout convention, read not quoted, per SOURCES.md).
3. The index is sparse (not one entry per record) because Kafka only needs to narrow a seek down to "which segment, roughly where in it", then do a short linear scan from there — *here.*
4. A segment rolls to a new file once it crosses `log.segment.bytes` or `log.roll.ms`; the active segment is never eligible for compaction, confirmed by Kafka's own log-cleaner configuration docs — *here* (quoted in SOURCES.md).
5. Reads are served from the OS page cache, not a Kafka-managed in-process cache, and the broker explicitly chooses this design over an in-heap cache — *here* (quoted: "Persistence" / "Don't fear the filesystem!").
6. `sendfile` lets the broker hand the kernel a file descriptor so bytes move pagecache→NIC directly, skipping the kernel-space→user-space→kernel-space round trip a naive read/write loop would pay — *here* (quoted).
7. The zero-copy optimization compounds with multiple consumers: the same pagecache bytes are reused for every consumer reading the same region, not re-copied per consumer — *here* (quoted).
8. Kafka deliberately does not track "has consumer X read record Y" on the broker; the consumer's position in a partition is a single integer (an offset) it owns and checkpoints itself — *here* (quoted: "Consumer Position").
9. Because the broker holds no per-record consumption state, a consumer can rewind to an old offset and re-read, which plain queue semantics don't allow — *here* (quoted).
10. `sendfile`/zero-copy is not used when TLS/SSL is enabled, because TLS termination happens in user space — *out of scope here* (a security/transport concern, not this topic's storage-layout scope; named in passing in post-notes "frontier" if space allows, otherwise dropped per the plan's "leaves out").
11. Log compaction physically rewrites segments out of append order, which is why it needs its own topic (chapter topic 6) rather than being folded into this one — *later syllabus topic* (de.retention-log-compaction).
12. What a producer actually sends before any of this applies (batching, acks) is the next topic, not this one — *later syllabus topic* (de.producer-batching-compression-acks).

## The reel's steps, storyboarded

### Step 1 — Hook: "the seek that shouldn't be fast" (`fig: PartitionStrip`)

- **On screen:** a 50 MB toy partition drawn as the partition strip (several segment boxes), with a search target offset marked far into the strip. Portrait: strip runs top-to-bottom in one column; landscape: strip runs left-to-right.
- **What moves:** `Decode` reveals a naive "scan every record" sweep crawling the whole strip (slow, counted in milliseconds on screen, real numbers from `examples.py`) side by side with a second sweep that jumps straight to the right segment via the index (fast). Both are real runs, not illustrations.
- **Final frame:** the fast arrow landed on the right record, a real elapsed-time number next to each sweep, the gap large and specific (e.g. "41 comparisons vs 2,000,000", the exact figures `examples.py` asserts).
- **Caption:** a seek through a partition most people assume is "a big slow file" lands in a couple of index hops.
- **Narrator's line of thought:** she doesn't explain "here's an index" yet — she poses the puzzle: *how can reading record four million out of a log be fast, when nothing says the log is sorted by anything useful for lookup?* The answer (a sparse index) is what the rest of the reel earns.

### Step 2 — Setup: a partition is files on disk (`fig: PartitionStrip`)

- **On screen:** the strip relabeled: this is one partition directory; each box is a segment, a real file; one is drawn with an open right edge (still being written), the rest sealed.
- **What moves:** `Draw` lays down the directory listing, box by box, with real filenames (`00000000000000000000.log`, etc., using real base-offset names `examples.py` actually creates).
- **Final frame:** the full strip, one open segment on the right, its byte count ticking.
- **Caption:** every partition is just this: ordinary files, append-only, one of them open.
- **Narrator's line of thought:** corrects the intuitive mistake that "a partition" is some abstract queue object — it's bytes on a real filesystem, and that's deliberate (connects, lightly, to why Kafka leans on the OS instead of fighting it — paid off fully in step 6).

### Step 3 — Predict: "the segment is full. What happens to the next record?" (`fig: PartitionStrip`)

- **Options:** (a) the broker blocks until space frees up; (b) a new segment opens and the write continues there; (c) the oldest segment is deleted to make room.
- **Right answer:** (b). Wrong-but-tempting: (a) feels safe (bounded resource); (c) conflates this with retention, which is a different, later mechanism (topic 6) triggered by age/size policy, not by a segment simply filling up.
- **Narrator's line of thought:** she asks the question squarely before revealing anything, naming why (a) and (c) are each a reasonable guess from a different, wrong mental model (a fixed-capacity buffer; a ring buffer), before the reveal in step 4 shows neither is what happens.

### Step 4 — Reveal: active segment rolls (`fig: PartitionStrip`)

- **On screen:** the open segment's byte count hits a real configured limit on screen; a new box appears to its right with an open edge, the old one's edge sealing shut.
- **What moves:** `Surface` the roll happening live as records keep being appended past the limit in `examples.py`'s real run; `count` the exact byte number at which the roll triggers.
- **Final frame:** two sealed segments and one new open one, with the real trigger byte count labeled.
- **Takeaway:** "A segment rolls at a size limit; only the newest one can still be appended to."
- **Caption:** the file that keeps growing is never the only file for long.
- **Narrator's line of thought:** ties back to the predict — this is exactly answer (b), and the sealed segment is now the kind of object retention and compaction (topic 6, named not taught) will later act on as a whole unit, never a half a segment.

### Step 5 — Mechanism: the sparse index (`fig: SparseIndexLadder`)

- **On screen:** one segment box opened up to show its two companion files beside it: the `.log` file as a strip of records with real offsets ticked, and a short `.index` file drawn as a ladder of a handful of rungs, each rung pointing at one byte position, not one per record.
- **What moves:** `Decode` a seek for a specific offset: jump to the nearest rung at or before it (binary search over a handful of entries, not millions), then a short linear scan forward in the `.log` file to the exact record — both counted on screen from the real toy index built in `examples.py`.
- **Final frame:** the seek landing exactly on the target record, with "2 index entries checked, 41 records scanned" (real numbers) next to it.
- **Takeaway:** "The index is sparse on purpose — a few entries get you close, a short local scan finishes the job."
- **Caption:** you don't index every record to find one fast; you index just enough.
- **Narrator's line of thought:** this is the answer to step 1's puzzle — she makes the connection explicit ("remember the fast arrow from the very first picture — this is what it actually does") rather than leaving it implicit.

### Step 6 — Mechanism: reads come from the page cache, with zero-copy (`fig: PageCachePath`)

- **On screen:** two side-by-side data paths from disk to a consumer's socket: a naive four-copy path (disk→kernel pagecache→user-space buffer→kernel socket buffer→NIC) and Kafka's real path (disk→kernel pagecache→NIC via `sendfile`, no user-space hop).
- **What moves:** `Draw` traces both paths; `count` the number of copies and context switches on each (4 vs effectively 1 extra, straight from the quoted source).
- **Final frame:** the short path highlighted, the long path's two middle copies crossed out in `C.bad`.
- **Takeaway:** "Zero-copy skips the detour through user space — the OS hands bytes straight from its own cache to the network."
- **Caption:** the fastest way to serve a read is to never really touch it.
- **Narrator's line of thought:** connects back to step 2's "files on disk" framing — leaning on the OS's own pagecache, instead of fighting it with a separate in-process cache, is exactly why this shortcut is even available; and flags the multi-consumer payoff (one cached copy, reused by every reader) as the detail that makes this matter at Kafka's actual scale, not just a microbenchmark trick.

### Step 7 — Mechanism: offsets belong to the consumer, not the broker (`fig: OffsetOwnership`)

- **On screen:** the partition strip again, now with a small marker labeled "consumer A's offset" sitting on top of one record, clearly outside the broker's own segment/index files.
- **What moves:** `Surface` the broker's state shown as unchanged regardless of where the marker sits; `Draw` the marker sliding backward (a deliberate rewind) and the same records becoming readable again, with no broker-side bookkeeping touched at all.
- **Final frame:** the marker moved back several positions, re-reading records it had already passed, with a caption confirming nothing on the broker side changed.
- **Takeaway:** "An offset is just an integer the consumer keeps — which is exactly why rewinding and re-reading is free."
- **Caption:** the broker never asks who has read what; it only ever answers "what's at offset N."
- **Narrator's line of thought:** poses the contrast directly: most message queues the learner may already know (and she names the general shape, not a specific product) track per-message delivery state on the broker and pay for it in complexity; Kafka's refusal to do that is presented as the payoff of everything shown so far — the log doesn't need to know who's reading it.

### Step 8 — Prove it: run the real toy log (`fig: PartitionStrip` + a results panel)

- **On screen:** a terminal-style results panel showing `examples.py`'s actual printed output: segment roll trigger byte count, index entry count vs record count, seek comparison counts for the naive vs sparse-index seek, and a rewind-and-reread confirmation.
- **What moves:** `Surface` each number landing into place as if freshly computed (they are — these are the asserted values from the real run).
- **Final frame:** all four numbers present at once, labeled.
- **Caption:** every number in this reel came from an actual toy log, run just now, not made up for the picture.
- **Narrator's line of thought:** this is the "don't just believe me" step — she treats it as evidence, not decoration, pointing at specific numbers and what each one proves.

### Step 9 — Recap

- **On screen:** the partition strip one more time, with four small icons stamped along it corresponding to the four takeaways (roll, sparse index, zero-copy, consumer-owned offset).
- **Caption / narration:** ties the four back to the single idea that opened the reel — a fast seek into a huge file, explained end to end.
- **Handoff line (spoken):** sets up topic 2: "none of this says anything yet about what a producer actually sends, or when — that's next."

## Post-notes headings (Deep dive)

- **Internals:** the real Kafka source file names (`OffsetIndex`, `TimeIndex`, `LogSegment` — named from the storage module read in SOURCES.md, not quoted) and the actual configuration names (`log.segment.bytes`, `log.roll.ms`, `log.index.interval.bytes` — the real knob controlling how sparse the index is, to be fetched and confirmed at build time if not already in SOURCES.md).
- **Lab:** the toy segmented log and offset index, built and run in `examples.py`; this is the full "build a toy segmented log with an offset index and consumer offset tracking" leg of the 9.1 chapter lab (`CHAPTER.md`'s lab table).
- **Production:** what actually goes wrong in practice — a segment size set too large delays compaction/retention's granularity (foreshadowing topic 6, named only); a segment size set too small multiplies file-handle and index overhead; TLS disabling zero-copy as a real, named operational cost of enabling encryption (from SOURCES.md's TLS/SSL note).
- **Frontier:** tiered storage (topic 8) moving whole closed segments to object storage, named as the direct extension of "a segment is the unit everything else in 9.1 operates on."
- **Where this goes next:** topic 2 (producer batching) and topic 3 (replication) both assume this topic's segment/offset vocabulary without re-teaching it.

## Engagement arc

- **Hook:** step 1 (the surprising seek).
- **Predict:** step 3 (within the first four steps, as required).
- **Surprising number:** step 1's comparison-count gap, confirmed with real numbers in step 8.
- **Takeaways (≥3):** steps 4, 5, 6, 7 (four, one to spare).
- **Recap:** step 9.

## Examples to execute (`examples.py`)

1. Build a toy segmented log: append records with a configurable segment-byte limit; assert the segment rolls at the real configured byte count, not before or after.
2. Build a sparse offset index over the toy log (one index entry every N records, matching Kafka's own `log.index.interval.bytes` idea conceptually); assert a seek for a given offset touches a small, bounded number of index entries plus a short local scan, and assert the exact record returned is correct.
3. Compare that seek's seek-"cost" (comparisons/records touched) against a naive linear scan over the same log, for the same target offset; assert the sparse-index seek touches orders of magnitude fewer records.
4. Model consumer offset tracking as a single integer external to the log; assert that rewinding the stored offset and re-reading returns the same records as before, with no mutation to the log or index structures at all (proving "the broker's state is untouched").
5. Every number from 1-4 above is asserted, not printed uncomputed, and is what steps 1, 4, 5, 7 and 8 show on screen.

## Claims list (claim → source)

1. A partition is a directory of segment files, one of which is open for appends — Kafka Design doc, "Persistence"/general architecture framing (SOURCES.md).
2. An offset index is sparse, not one entry per record, by Kafka's own storage-module file-layout convention — SOURCES.md (read, not quoted; to be reconfirmed against `log.index.interval.bytes` documentation at FACT-CHECK time).
3. The active segment is never compacted, even past the minimum compaction lag — Kafka Design doc, "Configuring The Log Cleaner" (quoted).
4. Kafka favors the OS page cache over an in-process cache by design — Kafka Design doc, "Don't fear the filesystem!" (quoted).
5. `sendfile` avoids a user-space copy on the read path — Kafka Design doc, "End-to-end Batch Compression"/efficiency section (quoted).
6. The zero-copy optimization's benefit compounds across multiple consumers of the same data — Kafka Design doc (quoted).
7. The broker does not track per-consumer, per-record consumption state; the consumer's position is a single integer it owns — Kafka Design doc, "Consumer Position" (quoted).
8. A consumer can rewind to an old offset and re-read — Kafka Design doc, "Consumer Position" (quoted).
9. `sendfile`/zero-copy is not used when TLS is enabled — Kafka Design doc (quoted; used only in post-notes "Production", not a reel claim).

## Concept ledger

- **Introduces:** `partition-segment-index`, `zero-copy-log-read`.
- **Uses:** none (first topic of the chapter).
- **Declared:** basic familiarity with append-only files and binary search.

## Bridge / handoff

- **Bridge** (from Chapter 8 topic 24): "Chapter 8 moved data from where it is produced to where it can be read, once and in order. This chapter takes the other kind of source: not a database to be read, but a stream someone is already appending to. This topic is the thing every later topic in this chapter assumes exists: the partitioned log itself, as bytes on disk."
- **Handoff** (to topic 2): "A partition is a log a producer writes to. What a producer actually sends, and when, and what it risks by not waiting for an acknowledgement, is the next topic."
