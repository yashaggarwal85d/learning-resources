# Fact-check — de.why-hive-style-tables

## Claims table

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | A Hive partitioned table stores data for each distinct partition-column combination in its own sub-directory. | Hive DDL wiki; Hive VLDB 2009 paper | Verified, primary source |
| 2 | `/wh/T/ds=20090101/ctry=US` is Hive's own canonical directory-as-partition example. | Hive VLDB 2009 paper | Verified, primary source, quoted directly |
| 3 | Hive does not validate that a partition column's value matches the data it's derived from — it trusts the writer. | Apache Iceberg's own "Problems with Hive partitioning" docs | Verified, Iceberg's own stated motivation for its design |
| 4 | The Hive metastore does not auto-update when files/directories are added or dropped on disk; it goes stale until a sync (MSCK REPAIR TABLE). | Cloudera partition-refresh docs | Verified, primary vendor doc |
| 5 | MSCK REPAIR's full-table sync cost scales with the number of partitions. | Cloudera partition-refresh docs | Verified, quoted directly |
| 6 | Before Hive 0.13's transactions, atomicity/consistency/durability were only guaranteed at the partition level, not across partitions. | Apache Hive's own "Hive Transactions" wiki | Verified, primary source, quoted directly |
| 7 | Streaming into existing Hive partitions without ACID caused readers to get dirty reads and left many small files pressuring the NameNode. | Apache Hive's own "Hive Transactions" wiki | Verified, quoted directly — this is Hive's own documented motivation for adding ACID, not an outside critique |
| 8 | A real two-partition write, paused mid-write, lets a concurrent directory listing see one partition complete and the other partial. | This sandbox's own `examples.py`, real `os.walk()`/file-write sequencing on local disk | Measured directly in this sandbox |
| 9 | Directory listing cost (`os.scandir()`) grows as file count grows. | This sandbox's own `examples.py`, real timed `os.scandir()` calls at 100/1,000/5,000 files | Measured directly in this sandbox |
| 10 | Iceberg and other modern table formats replace file listing with an explicit, versioned table state as their fix for exactly these problems. | Apache Iceberg documentation (general framing); this chapter's own topic 12 (snapshot-based metadata) picks this up next | Verified, matches Iceberg's documented design rationale |
| 11 | Changing a Hive table's partitioning scheme can break queries written against the old scheme. | Apache Iceberg's "Problems with Hive partitioning" docs | Verified, quoted directly (Iceberg's own stated contrast) |
| 12 | Hive's own partitioning predates and motivated newer table formats; it is not itself deprecated or wrong, just a different, earlier design point. | General chapter framing, consistent with topic 9's ORC/Hive material | Editorial framing, not a sourced fact |

## Currency note (as of this writing, 2026-10-31)

Three historical records with no currency concern: the Hive VLDB 2009 paper (a fixed, dated
publication), Hive's partition-level-atomicity-until-0.13 fact (a fixed historical milestone), and
Hive's own DDL documentation (describes a design that hasn't changed since Hive's partitioning
model was introduced). The Cloudera and Iceberg docs are living pages; both were fetched and
quoted at research time (2026-10-31) and describe current, stable behavior (MSCK REPAIR's
partition-count-scaling cost and Hive's lack of partition-value validation are both long-standing,
unchanged characteristics of the designs in question, not recent features likely to shift).

## Red-team items

1. **The local-filesystem substitution for object storage is disclosed, not hidden.** `examples.py`'s
   own docstring states explicitly that a local directory stands in for a real object store here,
   and that the specific mechanics demonstrated (directory listing reflecting only currently-
   existing files, listing cost growing with file count) are the same mechanics a real object-store
   LIST call has — this sandbox cannot run a multi-petabyte S3 bucket, but it can run the real
   underlying filesystem/listing behavior the Hive design depends on.
2. **The listing-latency numbers are this sandbox's own local disk, not representative of S3's
   actual LIST latency or its documented per-prefix request-rate limits** (those specific,
   quantified guarantees were already covered with real AWS-sourced numbers in topic 10). This
   topic's listing-cost demo only claims the qualitative shape — cost grows with file count — not
   any absolute latency figure, and says so in its own narration and reel body text.
3. **The partial-write demo is a deliberately paused, single-process sequential write, not a true
   concurrent multi-threaded race.** This is disclosed as a reproduction of the *shape* of the
   problem (a reader's listing can be taken at any point in an unprotected multi-file write and see
   a subset of it), not a claim about exact timing or a specific race condition between two live
   Hive writer processes.
4. **"Dirty reads" in the Hive Transactions wiki's own wording refers to readers seeing in-progress
   writes within a single partition from streaming ingestion** (not necessarily the cross-partition
   case this topic's own reproduction demonstrates). The topic draws the connection explicitly
   (same underlying cause — no atomic commit boundary — different specific scenario) rather than
   conflating the two as identical.
5. **Hive 0.13 is referenced as a historical fact (pre/post state), not as the sole or final word on
   Hive's current ACID capabilities** — Hive has continued to add ACID features since, and this
   topic's own "Handoff" line correctly frames this as what motivated *other* table formats
   (Iceberg, Delta, and — unmentioned here, consistent with the chapter's skip — Hudi) rather than
   claiming Hive itself never solved it.

## Problem solving

- The `sources.mjs` GitHub raw-markdown diagram-stripping bug (confirmed on topic 9) did not recur
  here since no raw markdown GitHub source with unclosed `<`/`>` table syntax was used — all
  sources were fetched as rendered HTML pages or a PDF.
- The VLDB PDF fetched cleanly via `sources.mjs fetch` (title metadata came back empty, which is
  expected for a PDF with no embedded `<title>` tag — the body text extracted fine and all 4
  quotes from it matched word-for-word on the first check).
- Initial SOURCES.md draft used a numbered-list quote format instead of the required `>`
  blockquote format, which made `sources.mjs check` silently report "0 quote(s) found" (not an
  error, just zero matches attempted) — caught immediately by comparing against topic 10's own
  SOURCES.md format, fixed by rewriting with `>` blockquotes, and the check then passed 15/15 on
  the very next run.
