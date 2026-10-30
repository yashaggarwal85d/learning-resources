# Review — de.row-column-security-dynamic

## Content review, self-review, 2026-10-30

1. **No declared cross-chapter gap this time.** Unlike topics 6 and 7, the one cross-chapter id
   `CHAPTER.md` cites (`explain-triage`, Chapter 2) resolves cleanly: confirmed by reading
   `registry.ts`'s `de.reading-explain-across-engines` entry, which is `status: 'live'` and
   introduces `explain-triage`. No gap to declare, logged in `OUTLINE.md`.
2. **Gap hunt against the syllabus line:** all five clauses (enforce in the engine not the app;
   row filters/column masks/dynamic masking; the five named engines; pruning/caching impact;
   bypass paths) mapped in `coverage.json`; no clause left unmapped.
3. **Flow check:** `status: 'held'`, so `checkFlow` skips this topic. Coverage and topic-file
   checks both pass on the clean build.
4. **Expert reader pass:** the three bypass reveals (derived table, extract, direct file read)
   each state a distinct reason the same underlying fact holds — none of the three ever re-runs
   the policy's own evaluation — rather than restating the same point three times.
5. **Engagement:** hook and predict both on steps 1–2 (within the first four); a second predict
   at step 11 ("Prove it") applies the bypass-path/timing distinction to two new artefacts (an
   export, a materialized view refreshed the day before the mask) rather than recalling step
   7–8's claims directly; three takeaways at steps 7, 8, 9 (all after the reel's own midpoint of
   step 5–6); recap at step 10. One takeaway initially ran to 22 words; trimmed to 19 after the
   build's own word-count check caught it.
6. **Narration teaches, not reads:** clean on the first `narration-teaches.mjs` run (0–11%
   description overlap across all 11 steps).
7. **Numbers checked against `examples.py`:** a row policy scoped to one region returns two of
   five synthetic rows; a direct file read, a stale materialized view, and an old export all
   still return every row's `ssn` unmasked, five for five; a pushed-down row policy examines two
   rows versus five for one that isn't pushed down — every claim in `reel.tsx` prose traces to an
   asserted value, with no literal digits in the prose itself.

### Checks run

- `node scripts/sources.mjs check row-column-security-dynamic`: 17 quotes found word for word
  (one fix mid-draft — a Snowflake quote's trailing comma/period mismatch, described below).
- `python3 examples.py`: all asserts pass (six functions, one `main`), clean on first run.
- `node scripts/narration-teaches.mjs`: clean on first run, no fixes needed.
- `node scripts/check-all.mjs` (via `npm run build`): 1 fix during the build — a takeaway at
  22 words, over the 20-word cap; clean on the rebuild, 238 pages built.
- `node scripts/check-all.mjs --only reels --topic row-column-security-dynamic`: "Reel smoke
  test passed: 1 live reel(s) at desktop and phone sizes" — passed. `test:editor` failed with
  the same known, pre-existing, unrelated sandbox limitation (Playwright popup-page event never
  fires in this cloud container) noted in every prior topic's `REVIEW.md` in this chapter; not a
  blocker.

## Looks review, self-review, 2026-10-30

Three phone screenshots read and visually confirmed clean:

- `phone-row-column-security-dynamic-02.png` (Predict, step 2 of 11): both option cards render
  fully alongside the body text and the start of the "NOT QUITE" explain block; nothing clipped.
- `phone-row-column-security-dynamic-07.png` (the derived-table reveal, step 7 of 11): both rows
  render with no overlap, the "MORE" truncation control and the takeaway panel both render fully
  and are visually separated by a divider, and "TAP TO CONTINUE" is visible beneath the takeaway.
- `phone-row-column-security-dynamic-11.png` (Prove it, step 11 of 11): both predict option cards
  for the second predict question render fully, alongside the top-of-screen summary rows
  ("export, last month" / "before the mask", "view, refreshed yesterday" / "not yet revealed").

No overlap, clipping, or crowding in any of the three; predict panels render cleanly; every
reveal states its point in words, not through brightness alone.

**No independent reviewer ran this review or the content review above — both are self-reviews by
the same session that wrote the topic.**

## Fixes made during drafting

- **Sources:** the Snowflake masking-policy quote "In Snowflake, masking policies are
  schema-level objects." used a period where the source text has a comma continuing into a
  dependent clause ("...which means a database and schema must exist..."); fixed by quoting the
  full sentence verbatim.
- **Row lengths (`scenes.tsx`):** nine separate 4+ word values/labels caught while writing the
  file (e.g. "only that app's calls", "runs before the user's", "every row, then filtered",
  "treats it as just a table", "a copy, off the table", "never governed the copy", "read the file
  path", "no query, no engine", "no policy ever asked", "one idea, its own cost", "outside it,
  all three") — all shortened to 1–3 words per the house rule before the build ran.
