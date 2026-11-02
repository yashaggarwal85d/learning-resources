# Fact-check — de.snapshot-based-table-metadata

## Claims table

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | Iceberg tracks individual data files instead of directories, adding files to the table only in an explicit commit. | Apache Iceberg table spec, "Overview" | Verified, quoted directly |
| 2 | A table version/snapshot is defined by an explicit, immutable metadata file; all changes create a new file and swap it in atomically. | Apache Iceberg table spec | Verified, quoted directly |
| 3 | An atomic metadata-file swap is the basis for serializable isolation; a reader keeps using the snapshot current when it loaded the table. | Apache Iceberg table spec | Verified, quoted directly |
| 4 | Writers commit optimistically: they assume the current version won't change, then swap the pointer from base to new version. | Apache Iceberg table spec | Verified, quoted directly |
| 5 | The specific atomic-swap mechanism isn't standardized by the Iceberg spec — it can be filesystem atomic rename (HDFS) or a metastore check-and-put. | Apache Iceberg table spec | Verified, quoted directly, both mechanisms named explicitly |
| 6 | A reader pinned to an old snapshot, reading it again after a second writer's commit, sees an identical, unchanged file list. | This sandbox's own `examples.py`, real file reads before/after a real second commit | Measured directly in this sandbox |
| 7 | Two writers racing to claim the same commit slot: exactly one wins, the other gets a real, immediate rejection (not a silent corruption). | This sandbox's own `examples.py`, real `os.open(..., O_EXCL)` race | Measured directly in this sandbox |
| 8 | Delta Lake's table state is also defined as a single serial history of atomic, monotonically increasing versions. | Delta Lake protocol spec (PROTOCOL.md) | Verified, quoted directly |
| 9 | Delta readers use the transaction log to choose which data files to process — not a directory listing. | Delta Lake protocol spec | Verified, quoted directly |
| 10 | A Delta commit creates "the latest atomic version" by adding one new entry to the log. | Delta Lake protocol spec | Verified, quoted directly |
| 11 | A catalog-managed Delta commit can rely on a real PUT-if-absent primitive to ratify and publish a version in one atomic step. | Delta Lake protocol spec | Verified, quoted directly |
| 12 | Iceberg and Delta, despite different file formats and terminology, converge on the same underlying shape: immutable versioned state plus one atomic pointer move. | Editorial synthesis across both specs, consistent with CHAPTER.md's own framing of topics 12-13 | Editorial framing, backed by items 1-11 |

## Currency note (as of this writing, 2026-10-31)

Both sources are living, actively maintained specification documents (the Iceberg table spec and
the Delta Lake protocol), fetched and quoted at research time. The specific mechanisms quoted
(atomic metadata-file swap, optimistic commit, PUT-if-absent) are foundational, long-standing
design decisions in both projects, not recent or unstable features — both specs describe them as
the core commit mechanism, present across their version history (the Iceberg quotes span v1
through the current spec; Delta's "atomic version" language is foundational to the whole
protocol document, not version-gated).

## Red-team items

1. **This topic's own demonstrations run on real local disk with `os.replace`/`os.open(O_EXCL)`,
   not against a real catalog or a real object store's actual conditional-write API** (topic 10
   already demonstrated the real HTTP-level `412` behavior against a real S3-compatible server).
   The claim here is narrower and disclosed as such in `examples.py`'s own docstring: POSIX
   guarantees `os.replace`/`O_EXCL` are atomic within one filesystem, and that's the same atomicity
   primitive a metastore check-and-put or an object store's conditional write provides — the
   mechanism is the same shape, not a claim that local disk IS a catalog or object store.
2. **The "two writers race" demo is a deliberate, scripted sequence (writer A's open call runs
   before writer B's in the script), not a genuine simultaneous race between two OS processes.**
   This reproduces the shape of the guarantee (exactly one commit can ever claim a given slot) —
   the real guarantee this topic claims is that `O_EXCL` makes the *second* attempt fail
   deterministically, regardless of timing, which the demo verifies directly even though it isn't
   a true concurrent race.
3. **Iceberg's own spec explicitly declines to standardize the exact atomic-swap mechanism** —
   this topic names both documented examples (HDFS atomic rename, metastore check-and-put) rather
   than picking one and implying it's the only way, since the spec itself is explicit that it is
   implementation-defined.
4. **Delta's quoted "PUT-if-absent" sentence describes one specific commit-coordinator design**
   (a catalog publishing directly to the filesystem) among several Delta supports (staged commits,
   inline commits, ratified-then-published commits) — this topic cites it as one real example of
   the same underlying pattern, not as Delta's only commit mechanism.
5. **This topic does not cover conflict *validation* in any depth** (what exactly counts as a
   conflicting change — an overlapping overwrite vs. a disjoint append) — that's explicitly the
   next topic's (13, optimistic commits and conflict resolution) job, and this topic's own
   recap/handoff names that boundary rather than blurring it.

## Problem solving

- The Iceberg spec's "Snapshots" field table (a literal table with interleaved column headers)
  was unusable for direct quoting — its rendered text output alternates field names and
  required/optional markers in a way that produces no clean quotable sentence. Used the prose
  "Overview" and "Optimistic Concurrency" sections instead, which cover the same content in
  genuine sentences.
- Two Iceberg quotes initially failed `sources.mjs check` because the source text carries a
  footnote marker (`[1]`) immediately after "HDFS" and after "check-and-put operation" that the
  first SOURCES.md draft dropped when copying the sentence. Fixed by re-copying the footnote
  marker exactly as it appears in the fetched source; check then passed.
- One Delta quote initially failed because the source uses markdown italic underscores
  (`_snapshot_`, `_transaction log_`, `_data files_`) that the first SOURCES.md draft silently
  cleaned up into plain words. Fixed by re-copying the underscores verbatim; check passed 13/13
  on the next run.
- The raw GitHub markdown fetch of Delta's `PROTOCOL.md` (2,905 lines) did not trigger the
  diagram-stripping bug seen on topic 9's ORC spec fetch — no unclosed `<`/`>` table syntax
  appeared near the quoted sections, confirmed by checking line counts and surrounding context
  around every quoted line before finalizing SOURCES.md.
