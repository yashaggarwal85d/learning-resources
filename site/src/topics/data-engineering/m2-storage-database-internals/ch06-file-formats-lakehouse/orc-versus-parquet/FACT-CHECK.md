# Fact-check — de.orc-versus-parquet

## Claims table

| # | Claim | Source |
|---|---|---|
| 1 | ORC files consist of stripes, large (~200MB) and processed independently. | ORCv1.md, "Stripes" |
| 2 | Each column is stored as several named streams (e.g. PRESENT, DATA) placed next to each other in the file. | ORCv1.md, "Stripes" |
| 3 | Each stream's kind, column id and byte length are recorded in the StripeFooter. | ORCv1.md, "Stripes" |
| 4 | ORC's ROW_INDEX stream has one entry per row group, row groups defaulting to 10,000 rows. | ORCv1.md, "Row Group Index" |
| 5 | Index streams sit at the front of a stripe and are only read for predicate pushdown or seeking, not a plain scan. | ORCv1.md, "Row Group Index" |
| 6 | ORC's Bloom Filter Index is a further, separate opt-in structure (from Hive 1.2.0 onward). | ORCv1.md, "Bloom Filter Index" |
| 7 | Hive provided only partition-level ACID before 0.13; row-level ACID arrived in Hive 0.13. | Hive ACID wiki |
| 8 | Hive's first ACID release supported only ORC, because only ORC's integration work (for a storage format with a row id) had been done. | Hive ACID wiki |
| 9 | ACID tables must be bucketed; external tables cannot be ACID tables. | Hive ACID wiki |
| 10 | A background Compactor (Initiator/Worker/Cleaner/AcidHouseKeeperService) merges Hive's delta files back into base files. | Hive ACID wiki |
| 11 | Parquet is explicitly designed to be used by any framework, "without the cost of extensive and difficult to set up dependencies." | Parquet project docs, "Motivation" |
| 12 | Parquet has a broad, independent ecosystem of implementations across languages and engines. | Parquet project docs, "Overview" |

## Currency

The ORC quotes are read from `orc.apache.org`'s own rendered specification page, served from
`apache/orc`'s `main` branch — a living, unversioned document, same status as every other
in-repository spec this chapter cites. The Hive ACID wiki page and Parquet's own project
documentation are both living pages with no version number to pin to; both were fetched
2026-10-31 and are cited as "as of this writing."

## Red-team

- **Is the "ORC's index beats Parquet's bare row-group stats" claim rigged by picking row-group
  sizes to favor ORC?** Disclosed directly in `post-notes.md`'s Frontier section: Parquet's row
  group size is a writer-chosen configuration value, not a fixed constant — this topic's 25,000-row
  example is a plausible, commonly-seen default, not the only one. A writer that sets a 10,000-row
  Parquet row group would match ORC's granularity exactly; the real, durable difference this topic
  measures is that ORC's index is a fixed 10,000-row default present unconditionally, while
  Parquet's matching precision requires either a smaller row group (fewer rows per group, less
  compression locality) or its separate, opt-in page index.
- **Is the metadata-byte accounting (`STAT_ENTRY_BYTES = 20`) a faithful measure, or an arbitrary
  number?** It is a simplification, disclosed as such in a comment in `examples.py`: a real
  `ColumnStatistics`/`Statistics` entry's encoded size varies with the column's type and encoding.
  The 20-byte estimate (min + max as 8-byte integers, plus a 4-byte null count) is used
  consistently across all three measured structures (ORC's row index, Parquet's row-group stats,
  Parquet's page index), so the *relative* comparison — 10 entries vs. 4 vs. 40 — holds regardless
  of the exact per-entry constant.
- **Does "ORC became Hive's own default" overstate a correlation as causation?** No — the Hive
  ACID wiki page states the mechanism directly: transactions needed a row id, the integration work
  for determining how updates/deletes apply to base records "has only been done for ORC," which is
  a stated engineering reason, not an inferred one.
- **Is "why Parquet became the lakehouse default" backed by a real source, or asserted from
  general knowledge?** Backed by Parquet's own stated design motivation (built to be used by any
  framework, not tied to one ecosystem) plus this chapter's own forward reference to §6.3, where
  the table formats (Delta Lake, Iceberg, Hudi) are introduced choosing Parquet as their default
  storage format — a fact this topic's handoff states as a claim about what's coming, not as an
  ORC-versus-Parquet spec detail requiring its own citation.
- **Does the topic claim ORC is obsolete?** No — `post-notes.md` and the reel's final reveal both
  name concrete production estates (legacy Hive tables, some Trino deployments reading them) where
  ORC still appears, consistent with the syllabus line's own "when ORC still appears" framing.

## Problem solving

The ORC specification's raw-markdown fetch (`raw.githubusercontent.com/apache/orc/main/...`)
silently dropped the entire "Stripes" section when checked against `sources.mjs`'s own cache —
the known diagram/table-stripping bug (an unclosed `<` inside a `1 <= x <= 24` table row is
treated by the HTML-tag-stripping regex as an open tag, and everything up to the next real `>`
character, more than 150 lines later at `<a id="column-encoding-section">`, is silently eaten).
Fixed by citing `orc.apache.org`'s own rendered HTML specification page instead of the raw
markdown file — the same content, served without the raw `<`/`>` characters that triggered the
bug.
