# Outline: Self-describing page formats (`rust.self-describing-page-formats`)

Chapter 19, topic 48 (first of four). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Measure, with a real, fixed-size page built as an explicit byte buffer, that an untouched page's own header fields round-trip exactly, and that a real CRC32C checksum validates on it.
2. Measure that a single corrupted byte anywhere in the page's own body is genuinely caught by the checksum, with no help from outside the page.
3. Measure that a deliberately wrong magic number is caught as an invalid format, even though the checksum alone, recomputed over the changed bytes, still validates — showing the checksum and the magic number each catch a different thing.
4. Measure that the page's own encoding is explicitly little-endian, not whatever the platform happens to use: the same raw bytes read back in the wrong byte order genuinely produce a different value.
5. State, from PostgreSQL's own documentation, the page header's own fields (the WAL-tracking LSN field, the checksum field, the version indicator) and the item identifier's own permanence guarantee.

## Changes from the chapter plan

None. All four of this topic's own claims are measured directly against a real, explicit byte buffer and a real CRC32C implementation (the `crc32c` crate, matching the syllabus's own named algorithm, since `std` has no CRC32C of its own); nothing here needs root access or hardware the sandbox lacks.

## Reel steps (storyboard)

1. **"Build a real, fixed-size page as a byte buffer. It has its own header: a magic number, a format version, a checksum, a page LSN. Does a corrupted byte anywhere in that page actually get caught, or does the page just silently hand back the wrong data?"** (predict, hook) — `fig`: a real page, with one byte deliberately flipped somewhere in its body. Options: it's silently handed back as if nothing happened / the page's own checksum genuinely catches it, no matter where the corruption is (correct) / it's only caught if the corruption happens to land inside the header itself.
2. **"Measured: an untouched page's own checksum validates cleanly, and a single corrupted byte anywhere in its body genuinely invalidates that same checksum"** — `fig`: the real, measured round-trip, then the real, measured corruption. NO takeaway (the reel's swipe-test "from" step).
3. **"Now instead of corrupting a byte, change the page's own magic number to something else, and recompute the checksum over those new bytes. Does the checksum alone catch that the format itself has changed?"** (predict) — `fig`: a page with its magic number changed, checksum recomputed over the new bytes. Options: yes, the checksum still catches it, since it covers the whole page / no, a checksum recomputed over consistent new bytes still validates; only the magic number check catches this (correct) / it depends on which byte of the magic number changed.
4. **"Measured: the checksum, recomputed over the new bytes, still validated cleanly — only checking the magic number itself caught that the format had changed"** — `fig`: the real, measured pair: checksum valid, format invalid. Takeaway: "A checksum catches damage to bytes that were supposed to stay the same; a magic number catches a deliberate, consistent change the checksum alone can't see."
5. **"The page's own multi-byte fields, like its LSN, are encoded in a specific byte order, chosen on purpose. Read those same raw bytes back in the opposite byte order. Does it matter, or is a byte order a byte order?"** (predict) — `fig`: the same raw bytes, read two different ways. Options: it doesn't matter; any consistent byte order reads the same value back / it matters completely; the wrong byte order gives a different, wrong value (correct) / it only matters for values large enough to need every byte.
6. **"Measured: the same raw bytes, read in the chosen byte order, gave back the exact original value; read in the opposite byte order, they genuinely gave back a different value"** — `fig`: the real, measured pair of reads. Takeaway: "A page's own byte order has to be explicit and enforced, not left to whatever the reading platform happens to use."
7. **"PostgreSQL's own documentation describes what its page header's very first field actually tracks. What does it say?"** (predict) — `fig`: the documentation's own description of the header's first field. Options: the page's own total size, for a quick sanity check / the most recent log entry related to that page (correct) / the identifier of the process that last wrote the page.
8. **"The documentation's own words: the first field tracks the most recent log entry related to this page, and the second field holds the page's own checksum, when checksums are enabled"** — `fig`: the quoted documentation, shown directly. NO takeaway (a connecting step restating the documented finding directly, not a new measured claim).
9. **"The same documentation also says something stronger about an item identifier's own index inside a page: it's never moved until freed, so it can be used to reference an item on a long-term basis, even while the item itself moves around during compaction. That's the whole reason a slot and a physical offset are two different things"** — `fig`: the documentation's own permanence guarantee, shown directly. Takeaway: "A page's own line pointers are the reason an item's identity can outlive it being physically moved around that same page."
10. **Recap** — a real page's checksum genuinely catches a corrupted byte anywhere in its body, but a checksum alone can't catch a deliberate, consistent format change; only a magic number check does. A page's own byte order has to be explicit and enforced, not assumed. And PostgreSQL's own documentation describes exactly this: a self-describing header, and an item identifier that outlives the item being moved. Handoff: a page that can describe itself is the foundation; the next question is how a record inside that page keeps a stable identity while its own physical location can still change.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7.
- Surprising fact: step 9 (the item identifier's own permanence guarantee, quoted directly, setting up the next topic).
- Takeaways: steps 4, 6, 9 (three — step 2 deliberately has none, being the swipe test's "from" step; step 8 deliberately has none, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| the first field of PostgreSQL's page header tracks the most recent WAL entry related to the page; the second field contains the page checksum if data checksums are enabled | PostgreSQL docs (quoted) |
| pd_pagesize_version stores both the page size and a version indicator | PostgreSQL docs (quoted) |
| an item identifier is never moved until it is freed, so its index can be used on a long-term basis to reference an item, even while the item itself moves to compact free space | PostgreSQL docs (quoted) |
| every pointer to an item (ItemPointer, CTID) consists of a page number and the index of an item identifier | PostgreSQL docs (quoted) |
| the `crc32c` crate provides the CRC-32-Castagnoli algorithm | `crc32c` crate docs (quoted) |
| an untouched real page's own header fields round-trip exactly, and its real CRC32C checksum validates | `examples/runtime-demo/src/self_describing_page_catches_corruption.rs` (executed, measured) |
| a single corrupted byte anywhere in a real page's body genuinely invalidates its own checksum | `examples/runtime-demo/src/self_describing_page_catches_corruption.rs` (executed, measured) |
| a deliberately wrong magic number, with the checksum recomputed over the new bytes, still passes the checksum but fails a format check | `examples/runtime-demo/src/self_describing_page_catches_corruption.rs` (executed, measured) |
| the same raw multi-byte field read in the wrong byte order genuinely produces a different value than reading it in the chosen byte order | `examples/runtime-demo/src/self_describing_page_catches_corruption.rs` (executed, measured) |

## Concept ledger

- `introduces`: `self-describing-page-header` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `repr-c-fixed-layout`, `derive-checked-byte-view`
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Chapter 18 closed on a request correctly bounded and ordered at a service boundary; this chapter is about what sits behind that boundary once the request lands and needs to be stored."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "A page that can describe itself is the foundation; the next question is how a record inside that page keeps a stable identity while its own physical location can still change."
