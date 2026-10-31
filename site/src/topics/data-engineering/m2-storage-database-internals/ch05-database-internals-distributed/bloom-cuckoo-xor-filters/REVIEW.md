# Review — de.bloom-cuckoo-xor-filters

## Content review, self-review, 2026-10-31

Read cold, in order: the previous topic's (`de.message-queues-vs-event`) own handoff, then this
topic's own files in order (reel and scenes, narration, post-notes, pre-notes, prerequisites,
registry entry, `coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then the next topic's syllabus
line (HyperLogLog and distinct counting).

1. **Flow.** Clean. The bridge directly answers topic 29's own handoff ("the next section closes
   the chapter with the opposite idea entirely: structures that trade a small, bounded error for
   a massive reduction in memory, starting with the simplest — Bloom, cuckoo and xor filters").
   `uses: ['lsm-write-read-path']` matches `CHAPTER.md`'s own plan (topic 8's own per-file Bloom
   filters, a real, already-seen instance of this family).
2. **Pre-notes.** 6 bullets, no links. The hash function (Chapter 1) and the LSM per-file filter
   (topic 8) are genuinely carried forward, not retaught; bit array, false positive, false
   negative and fingerprint are primers for what this reel actually teaches.
3. **Gap hunt.** Checked the syllabus line (`syllabus/data-engineering.md:282`) clause by clause.
   Four semicolon-delimited clauses, including the trailing cross-reference "Parquet column
   filters (§6.2)" mapped by content to `de.data-skipping-statistics-page` (already built, exact
   quote "optional split-block bloom filters for high-cardinality equality predicates" copied
   from its own syllabus line) rather than to a section number alone. All four clauses mapped to
   real steps or cross-references; no gap against the syllabus line, the four source groups, or
   the expert list (eleven items). `node scripts/check-all.mjs --skip reels,links,narration`
   passed clean on the first run — no `{deep: ...}` or coverage mismatches, unlike the previous
   two topics in this chapter, since the headings referenced ("Internals", "Outcomes", "Frontier",
   "Where this goes next") were checked against `post-notes.md`'s own actual headings before
   writing `coverage.json`.
4. **Expert reader.** The predict step (step 2) was checked for the trap of assuming a crowded
   filter could eventually "forget" an older entry and start reporting false negatives — the wrong
   answer is tempting by analogy with a real cache evicting old entries, and the explain text
   names the real mechanism (bits set on insertion are never cleared) instead of just asserting
   the guarantee. The "Prove it" step was checked against the trap of assuming "a cuckoo filter is
   strictly better, so switching always helps" — the explain text names the specific structural
   reason (this system never deletes a filter without deleting the whole file) rather than a vague
   performance claim.
5. **Engagement.** Hook (step 1) poses a real, concrete claim about a structure answering a
   question about data it never stored. Predict at step 2, within the first two. No takeaway on
   step 3 (the same-hash-positions reveal, this reel's own "from" reference step, deliberately
   left without one, matching the pattern this chapter's other reels use). Four takeaways (steps
   4, 5, 6, 7). Recap (step 8) pulls every layer into one line each. "Prove it" (step 9) is a
   genuine synthesis task (applying the cuckoo-filter capability to a concrete, already-seen
   system from topic 8) rather than a restatement.
6. **Narration teaches.** `narration-teaches.mjs` passed clean on the first run: 0 flags, highest
   overlap 9% (step 3), every line under the 50-word limit. No digits, symbols or code names
   appear in any narration line: filter sizes and rates are described structurally ("a target rate
   for those false alarms", "noticeably less room per item") rather than with the specific numbers
   `examples.py` actually measures.

No findings beyond what's recorded under "Fixes made during this build" below. `coverage.json` →
`gapReview` recorded there.

## Checks run

- `node scripts/sources.mjs check site/src/topics/.../bloom-cuckoo-xor-filters` — 11/11 quotes
  verified word for word on the first attempt, including the Wikipedia substitute source and both
  PDF-extracted sources (cuckoo filter paper's curly quotes, xor filter paper's line-wrapped "bits
  / per entry" phrase), both confirmed to pass `sources.mjs check`'s own normalizer rather than
  assumed.
- `python3 examples.py` — pass. A real Bloom filter, built from scratch (bit array, double
  hashing) and sized by the real formula for a 1% target over 20,000 keys, measures a
  false-positive rate of 1.0205% against 200,000 disjoint held-out keys, against a 1.0039%
  predicted rate; a second run at a looser 10% target over 500 keys measures 10.5000% against a
  10.0647% predicted rate. Zero false negatives in either run. Deterministic: re-running produced
  byte-identical output.
- `node scripts/check-all.mjs --skip reels,links,narration --topic
  data-engineering/.../bloom-cuckoo-xor-filters` — pass on the first run (locked, docs, sources,
  build — 238 pages built).
- `node scripts/check-all.mjs --only links,narration --topic
  data-engineering/.../bloom-cuckoo-xor-filters` — pass, 0 broken links out of 1890 checked; the
  80 reported title mismatches are all pre-existing, unrelated to this topic.
- `node scripts/check-all.mjs --only reels --topic data-engineering/.../bloom-cuckoo-xor-filters`
  — "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes" on the first run (every
  `scenes.tsx` `Row` label/value kept to 1-3 words from the start, applying the lesson from this
  same chapter's earlier topics rather than discovering it as a test failure after the fact). The
  combined check reports `FAIL` only because of the known, topic-independent `test:editor`
  sandbox limitation.

## Fixes made during this build

- No `scenes.tsx` `Row` word-count violations, no `reel.tsx` digit-check trips, and no
  `coverage.json` `{deep: ...}` mismatches occurred during this build — each was checked against
  the real limit or the real `post-notes.md` headings before writing the file, rather than after a
  test failure, applying the lessons already recorded from this chapter's earlier topics.
- The original Bloom filter paper (Bloom, 1970) could not be fetched in this sandbox: the ACM
  Digital Library DOI page is paywalled, and the USPTO-hosted scan returns a blocked CloudFront
  request. Resolved by substituting Wikipedia's own article on the structure, following the
  precedent `de.lsm-trees-write-read` (topic 8) already set for its own unfetchable original
  paper; documented in `FACT-CHECK.md`'s Problem Solving section.
- The cuckoo filter paper's abstract uses UTF-8 curly/smart quotes around "standard"; confirmed
  via `cat -A` that `sources.mjs check`'s own normalizer converts curly and straight quotes alike
  before comparing, so no special handling was needed in `SOURCES.md` itself.

## Looks review, self-review

`check-all.mjs --only reels --topic data-engineering/.../bloom-cuckoo-xor-filters` passed on the
first run at both sizes, with no text-overlap fix needed.

Checked against the full checklist:

- The point lands at a glance and is shown by more than colour: each reveal's own row text (e.g.
  "bloom filter" / "can't delete one", "cuckoo filter" / "deletes a fingerprint") makes the claim
  explicit, not just `C.focus`.
- Every step moves (opacity-staged rows via `easeOut(seg(...))`) and lands on a final frame that
  teaches on its own.
- Nothing crowded, clipped or small at either size.
- Colour is used only where it means something: `C.focus` consistently marks the surprising or
  measured value (the "maybe present" answer, the false-negative question's own second row, the
  measured rate, the cuckoo filter's real delete, the ribbon filter's real cost, every "Prove it"
  conclusion) — never decorative.
- Captions (`fig`) match each scene's own `Svg label` exactly, and match the picture at every
  checked step.

No findings. `coverage.json` → `gapReview`: date 2026-10-31, by "Claude (single session)", open:
[] (recorded in the committed file). All reviews in this file are self-review by the same session
that wrote the content; no independent reviewer ran. Expert sign-off: pending.
