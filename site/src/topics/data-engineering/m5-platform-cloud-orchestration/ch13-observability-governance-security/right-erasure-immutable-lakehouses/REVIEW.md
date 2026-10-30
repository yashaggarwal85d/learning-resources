# Review — de.right-erasure-immutable-lakehouses

## Content review, self-review, 2026-10-30

1. **No declared cross-chapter gap.** `CHAPTER.md`'s prerequisites panel names Chapter 6's
   table-format topics and Chapter 9's Kafka-retention topic as background reading, not as `uses`
   ids this topic's own concepts structurally depend on — the mechanisms needed (snapshots,
   delete files, compaction, log retention) are sourced and explained directly in this topic's
   own reveals. `uses` carries only `dek-kek-envelope-hierarchy` (topic 5, built and live).
   Logged in `OUTLINE.md`'s concept ledger.
2. **Gap hunt against the syllabus line:** all seven clauses (deletes vs. time travel; MOR delete
   files; VACUUM/expire_snapshots/orphan removal; replicas/backups/Kafka topics; crypto-shredding
   and its cost; proving deletion to an auditor; retention policies as code) mapped in
   `coverage.json`; no clause left unmapped.
3. **Flow check:** `status: 'held'`, so `checkFlow` skips this topic. Coverage and topic-file
   checks both pass on the clean build.
4. **Lab honesty, checked explicitly:** the table leg and the crypto-shredding leg in
   `examples.py` are real, runnable code (a genuine local Delta Lake table; an actually
   irreversible toy-KMS key deletion). The Kafka-topic and backup legs are disclosed, documented
   stand-ins (no broker or backup tool in this environment), exactly matching `CHAPTER.md`'s own
   allowance for this topic. Nothing claims to be a real broker or backup tool that isn't one.
5. **Engagement:** hook and predict both on steps 1–2 (within the first four); a second predict
   at step 12 ("Prove it") tests a scenario where crypto-shredding runs but a table-level
   `DELETE` never does, checking that the reader has separated the two mechanisms rather than
   recalling step 7's claim directly; three takeaways at steps 8, 9, 10 (all after the reel's own
   midpoint of step 6); recap at step 11. One takeaway initially ran to 21 words (an apostrophe
   miscount); trimmed to 20 after the build's own word-count check caught it.
6. **Narration teaches, not reads:** clean on the first `narration-teaches.mjs` run (0–19%
   description overlap across all 12 steps).
7. **Numbers checked against `examples.py`:** a real Delta table's time-travel query still
   returns the deleted row until `VACUUM` runs, after which the same query fails; a backup copied
   before the delete still carries the subject; a Kafka-style tombstone keeps its key present
   until its own retention window elapses, then drops it; one key deletion makes all three
   synthetic copies unreadable at once, touching zero bytes in any of the three — every claim in
   `reel.tsx` prose traces to an asserted value, with no literal digits in the prose itself.

### Checks run

- `node scripts/sources.mjs check right-erasure-immutable-lakehouses`: 16 quotes found word for
  word, 0 problems on the first run.
- `python3 examples.py` (requires `pip install deltalake pyarrow`): all asserts pass (four
  functions plus a `CompactedLog` class and a `ToyKMS` class, one `main`), clean after one fix
  (the backup leg initially copied the table directory after `VACUUM` had already run, so the
  backup came up empty — fixed by copying before the erasure, matching "last night's backup").
- `node scripts/narration-teaches.mjs`: clean on first run, no fixes needed.
- `node scripts/check-all.mjs` (via `npm run build`): 1 fix during the build — a takeaway at
  21 words, over the 20-word cap; clean on the rebuild, 238 pages built.
- `node scripts/check-all.mjs --only reels --topic right-erasure-immutable-lakehouses`: "Reel
  smoke test passed: 1 live reel(s) at desktop and phone sizes" — passed. `test:editor` failed
  with the same known, pre-existing, unrelated sandbox limitation (Playwright popup-page event
  never fires in this cloud container) noted in every prior topic's `REVIEW.md` in this chapter;
  not a blocker.

## Looks review, self-review, 2026-10-30

Three phone screenshots read and visually confirmed clean:

- `phone-right-erasure-immutable-lakehouses-02.png` (Predict, step 2 of 12): both option cards
  render fully alongside the body text and the start of the "NOT QUITE" explain block.
- `phone-right-erasure-immutable-lakehouses-08.png` (the key-management-cost reveal, step 8 of
  12): three rows render with no overlap, the "MORE" truncation control and the takeaway panel
  both render fully and are visually separated by a divider, "TAP TO CONTINUE" is visible beneath.
- `phone-right-erasure-immutable-lakehouses-12.png` (Prove it, step 12 of 12): both predict
  option cards for the second predict question render fully, alongside the top-of-screen summary
  rows ("table delete" / "never ran", "the query now" / "not yet revealed").

No overlap, clipping, or crowding in any of the three; predict panels render cleanly; every
reveal states its point in words, not through brightness alone.

**No independent reviewer ran this review or the content review above — both are self-reviews by
the same session that wrote the topic.**

## Fixes made during drafting

- **`examples.py` backup ordering:** the backup copy was originally taken after the table's own
  `DELETE` and `VACUUM` already ran, so the backup came up with the row already gone — fixed by
  copying the table directory immediately after the initial write, before any erasure runs,
  matching the Hook's own story of a backup taken the night before the request arrived.
- **Row lengths (`scenes.tsx`):** six separate 4+ word values/labels caught while writing the
  file (e.g. "writes a new snapshot", "marks the row gone", "a key to store", "no snapshot points
  there", "when it was deleted", "a fresh call, each time", "a snapshot, not erasure", "outside
  it, all three") — all shortened to 1–3 words per the house rule before the build ran.
- **A stray `"answer": null`** left on a non-predict step (`narration.json`, the key-management
  cost step) while drafting — caught and removed before running `narration-teaches.mjs`.
