# Review — de.right-erasure-immutable-lakehouses

## Content review, self-review, 2026-11-01

1. **Apache Kafka's own documentation site is entirely unfetchable in this sandbox.**
   `kafka.apache.org/documentation/#compaction` and every versioned variant tried all return the
   same ~877-character JavaScript-redirect page that never resolves to static text. Substituted
   Confluent's own Kafka Log Compaction documentation -- maintained by Kafka's original authors'
   company, describing the identical open-source mechanism -- fetched cleanly, and explicitly
   disclosed as a substitution in `SOURCES.md`'s own "Note on source naming" paragraph.
2. **This sandbox has no Spark/Iceberg cluster, Kafka broker or backup tool.** Per CHAPTER.md's
   own explicit allowance ("where the machine has no Kafka broker or backup tool, the topic leg
   uses the documented tombstone-and-retention behaviour on a local log and discloses it"),
   `examples.py` builds a toy model (`ToyTable`, `ToyCompactedLog`) that reproduces each system's
   own *documented* mechanics -- verified against the fetched Iceberg/Delta/Confluent quotes --
   rather than fabricating a real-system measurement or skipping measurement entirely. This is
   disclosed in `examples.py`'s own module docstring, `SOURCES.md` and `references.md`.
3. **An early draft of `toy_decrypt` had a nonsensical leftover fragment** (calling `.join([])`
   on a `bytes` object with a broken `or`-fallback). Caught and cleaned up to a straightforward
   keystream-XOR-then-decode implementation before `examples.py` was ever run, so no faulty
   assertion masked it.
4. **Coverage gap caught proactively before the build check, applying a lesson from two earlier
   topics this session:** the syllabus clause's "proving deletion to an auditor; retention
   policies as code" sub-clause had no step mapped on the first `reel.tsx` draft. Added an 11th
   step (`RevealProvingDeletion`) and the corresponding `OUTLINE.md`/`coverage.json` entries
   before running the build check, rather than discovering the gap from a failure.
5. **Coverage's syllabus clause must match the raw syllabus line, not CHAPTER.md's backtick-
   decorated restatement.** The coverage checker strips Markdown (`clean()` in `src/lib/
   syllabus.ts` removes backticks, bold and italics) from the syllabus file's own scope text
   before comparing; a clause copied with backticks around `VACUUM`/`expire_snapshots` failed
   the "clause is not in the syllabus line" check even though it matched CHAPTER.md's own
   quoting of the same line. Fixed by copying the clause with the backticks removed.
6. **`coverage.json`'s expert items started at 9, one short of the ≥10 minimum** that failed the
   build check on both previous topics this session. Added a 10th item (retention-as-code's own
   tie to a scheduled maintenance job) before running the build check this time, rather than
   waiting for the failure to reveal it.
7. **Phone-layout overflow on the tombstone-expiry scene:** `scenes.tsx`'s `RevealTombstoneExpires`
   used four-word labels ("right after tombstone" / "after retention elapses") that ran into
   their values on phone. Fixed by shortening to two- and three-word labels ("right after" /
   "after the window"), following the same total-rendered-width lesson from earlier topics this
   session.
8. **Gap hunt against the syllabus line:** the single clause (snapshots/time-travel, MOR delete
   files, VACUUM/expire_snapshots/orphan removal, replicas/backups/Kafka tombstones and
   retention, per-subject crypto-shredding and its cost, proving deletion and retention-as-code)
   is mapped across 7 of the reel's 11 steps in `coverage.json`; no part of the clause is left
   unmapped. Orphan-file removal and replicas are named as `expert.items` with `out` reasons
   (this topic's own measurement models snapshot expiry/compaction and a backup/Kafka log, not
   an orphaned write artifact or a database replica specifically) rather than claimed as
   measured.
9. **`declared: []`** matches CHAPTER.md's own implicit scope (no explicit "Declared:" line
   needed any new cross-chapter term beyond what `uses` already resolves against existing
   registry ids).
10. **Flow check:** `status: 'held'`, so `checkFlow` skips this topic.
11. **Engagement:** hook at step 1; predicts at steps 3 and 6; three takeaways at steps 5, 8 and
    11 (Recap), each trimmed to 18-20 words after initial drafts ran long.
12. **Narration teaches, not reads:** rewrote every line as the professor's own framing rather
    than restating `reel.tsx`'s body sentences; split one step 9 line that initially ran 53
    words into two lines to stay under the 50-word limit. No raw digits anywhere.
13. **Numbers checked against `examples.py`:** the time-travel read still showing subject 42, the
    post-compaction data file no longer containing them, the tombstone persisting immediately
    after being written and disappearing only after `delete.retention.ms` elapses, and all three
    copies (table, log, backup) going unreadable at once after one key deletion while a
    different subject's data in the same copies stays readable -- every claim in `reel.tsx`
    prose traces to an asserted value from this toy-but-documented-mechanism model, not an
    unverified or hypothetical claim.

### Checks run

- `node scripts/sources.mjs check`: 11 quotes found word for word, 0 problems (after the Kafka
  tombstone quote correction above).
- `python3 examples.py`: "all claims verified" against the toy snapshot/delete-file model, the
  toy compacted-log tombstone model, and the toy per-subject crypto-shredding model.
- `node scripts/check-all.mjs --topic .../right-erasure-immutable-lakehouses --only build`: 2
  fixes during the build (the coverage clause's stray backticks, and a 53-word narration line);
  clean on rebuild, 238 pages built.
- `node scripts/check-all.mjs --topic .../right-erasure-immutable-lakehouses --skip reels,links`:
  locked, docs, sources, build, narration all pass.
- `PREVIEW_HELD=1 npx astro build` (471 pages, all held topics included) and `PREVIEW_HELD=1 node
  tests/reels.mjs http://localhost:4321/learning-resources/ right-erasure-immutable-lakehouses`:
  reel smoke test failed once (step 7 phone overlap), fixed per item 7 above, then passed at
  desktop and phone sizes.

## Looks review, self-review, 2026-11-01

Learned from two earlier topics this session's phone-overlap failures: still hit one on the
tombstone-expiry scene's four-word labels on the first draft; fixed by shortening to two- and
three-word labels rather than relying on short individual words within a longer label. Reel
smoke test covered both desktop and phone sizes across all 11 steps, including both predict
panels (steps 3 and 6) and the three-row Recap scene, with no overflow or swipe-caption failures
after the fix.

**No independent reviewer ran this review or the content review above — both are self-reviews by
the same session that wrote the topic.**
