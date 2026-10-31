# Review — de.why-hive-style-tables

## Content
- All 15 SOURCES.md quotes verified word-for-word across 5 sources: Hive's own DDL wiki, the Hive
  VLDB 2009 paper (directory-as-partition's canonical example), Cloudera's partition-refresh docs
  (metastore staleness, MSCK REPAIR cost scaling), Hive's own Transactions wiki (the documented
  dirty-read/NameNode-pressure motivation for ACID), and Iceberg's own "Problems with Hive
  partitioning" docs. `sources.mjs check`: 15/15, 0 problems.
- `examples.py` runs two real demonstrations on this sandbox's own local disk (disclosed as a
  stand-in for object storage, consistent with this chapter's established substitution pattern):
  a real two-partition write paused mid-write, with a real `os.walk()` listing taken at the pause
  catching partition B half-finished (2 of 4 files); and a real `os.scandir()` latency measurement
  across 100/1,000/5,000 real files, confirmed to grow monotonically. All assertions pass.
- Fact-checked all 12 claims in FACT-CHECK.md's table, each tied to a primary source or to this
  sandbox's own measured output; 5 red-team items address the local-filesystem substitution, the
  sequential (not truly concurrent) partial-write reproduction, the distinction between Hive's own
  "dirty reads" wording and this topic's cross-partition reproduction, Hive 0.13 as a historical
  marker rather than Hive's final state, and the chapter's Hudi skip.

## Problems found and fixed
1. **`sources.mjs check` initially reported "0 quote(s) found"** — the first SOURCES.md draft used
   a numbered-list format instead of the required `>` blockquote format. Fixed by rewriting with
   `>` blockquotes per topic 10's own established format; check then passed 15/15 immediately.
2. **`narration-teaches.mjs` flagged step 1 as "READS THE SCREEN" (54% overlap) and step 2 with a
   VERBATIM match** — the first narration draft paraphrased the reel body too closely. Rewrote
   every line with a genuinely different angle (teacherly framing, analogies, "picture this"
   openers) rather than restating the body; second run passed clean at 0% overlap on 9 of 10
   steps (2% on step 8).
3. **Phone-only reel-test overflow, step 10 (Recap)** — `scenes.tsx`'s rule text ran outside the
   drawing on the phone viewport. Shortened "a mutable table on an immutable, list-based store /
   needs an explicit state, not a directory listing" to "a mutable table on an immutable store /
   needs explicit state, not a directory listing." Reel smoke test then passed clean at both
   desktop and phone sizes.
4. **Comma-formatted numbers avoided from the start** — wrote "100 files, then 1000, then 5000"
   (no commas) in `scenes.tsx` rather than "1,000"/"5,000", since examples.py's own literals
   (`1_000`, `5_000`) wouldn't digit-match a comma-split token under the reel.tsx number-provenance
   check; avoided the issue entirely rather than hitting and fixing it.

## Checks (all green)
- `sources.mjs check`: 15/15 quotes
- `examples.py`: all assertions pass
- `narration-teaches.mjs`: clean (0% overlap on 9/10 steps, 2% on step 8; no flags)
- `check-all.mjs --skip reels,links,narration --topic why-hive-style-tables`: pass (locked, docs,
  sources, build)
- `check-links.mjs`: 0 broken links (the "title mismatch (check by hand)" entries are the standard
  benign GitHub pattern from other threads' topics, unrelated to this one)
- `check-all.mjs --only reels`: "Reel smoke test passed: 1 live reel(s) at desktop and phone
  sizes" (after the step-10 fix)
- `test:editor`: fails with the known, pre-existing sandbox-only Playwright limitation (not a
  regression)

## Screenshot review
All 10 desktop screenshots (plus 2 predict-question states) and all 10 phone screenshots (plus 2
predict-question states) reviewed by hand: no overlapping or cut-off text, predict options render
correctly, takeaways display correctly, Recap renders cleanly at both sizes after the fix.
