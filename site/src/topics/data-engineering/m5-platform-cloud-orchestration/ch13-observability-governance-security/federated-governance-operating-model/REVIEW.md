# Review — de.federated-governance-operating-model

## Content review, self-review, 2026-10-30

1. **Declared cross-chapter gap, checked and logged.** `CHAPTER.md`'s plan names `engine-enforced-
   row-column-security` as a `uses` candidate from topic 8; checked directly against `registry.ts`
   and the id does not exist anywhere — topic 8's own entry (read directly) introduces
   `row-column-policies-in-engine` instead, which is what `uses` carries. `CHAPTER.md` also names
   Chapter 11 §11.4 ("Contract enforcement in CI") and Chapter 10 §10.5 (compliance regimes) as
   `uses` candidates; checked directly and neither `section: '11.4'` nor `section: '10.5'` exists
   anywhere in `registry.ts`, so both are unbuilt. Both moved to `declared` with the gap logged in
   `OUTLINE.md`. The other nine planned `uses` ids were each checked directly (`grep -c`) and all
   resolve to live entries.
2. **Gap hunt against the syllabus line:** all four clauses (the operating shape; reverse Conway's
   law; automate vs. human; the §3.4/§19.1 links) mapped in `coverage.json`; caught twice by the
   build's own checks on resources naming a topic title that doesn't match its exact syllabus
   wording (see "Fixes made during drafting").
3. **Flow check:** `status: 'held'`, so `checkFlow` skips this topic. Coverage (two syllabus
   sources, ten expert items) and topic-file checks both pass on the clean build.
4. **Lab honesty.** The self-serve registration gate (`check_schema`, `check_contract`,
   `check_classification`, `register_table`) and the six-decision automate-vs-human split are the
   shop's own policy code — real, asserted Python, not a sourced claim about a third-party product,
   matching `CHAPTER.md`'s own Outcomes line exactly ("decide for six given decisions whether they
   are automated or human and name the steward"; "build and run the self-serve registration check
   ... and show it rejecting a table with a missing tag").
5. **Engagement:** hook on step 1; predict on step 2 (within the first four). Three takeaways at
   steps 4, 5, 7 (midpoint of 10 steps is step 5; this session's established, non-enforced habit of
   clustering takeaways near the midpoint holds here too, loosely). A second predict at step 10
   ("Prove it") tests the same automate-vs-human split from the opposite direction: the earlier
   reveal showed a retention exception as human, this question shows a retention change that stays
   inside the stated limit as automated — the same concept, the opposite answer. Recap at step 9,
   immediately before Prove It.
6. **Narration teaches, not reads:** two lines exceeded the 50-word single-line limit on the first
   `narration-teaches.mjs` run (steps 8 and 9, 72 and 71 words); both split into shorter sentences.
   Clean on recheck, 0–12% overlap across all ten steps, no VERBATIM flags.
7. **Numbers checked against `examples.py`:** the real `register_table()` run admits exactly one of
   three candidate tables and rejects the other two, each with a reason string naming the exact
   gate that caught it (`"contract: missing required field(s): version"`,
   `"classification: column 'note_text' has no classification tag"`); the six `DECISIONS` split
   exactly 3 automated (each with a stated rule) and 3 human (each with a named steward and a
   reason) — every claim in `reel.tsx` prose traces to an asserted value, with no literal digits in
   the prose itself.

### Checks run

- `node scripts/sources.mjs check site/src/topics/.../federated-governance-operating-model`: 14
  quotes found word for word, 0 problems on the first run (every quote re-fetched and re-verified
  against each source's own plain text directly in this session via `sources.mjs fetch`, not
  copied from the research fork's own 125-character-limited fragments).
- `python3 examples.py`: failed on the first run — `check_classification` wrongly required a
  column's `category` tag to be non-null, rejecting the well-formed table's intentionally
  `category: None` non-personal column; fixed by checking for key presence (`tier`/`category` both
  present) rather than non-null values, with `tier` additionally required non-null. Clean on the
  second run, all asserts pass.
- `node scripts/narration-teaches.mjs site/src/topics/.../federated-governance-operating-model`: 2
  fixes (steps 8 and 9, over the 50-word line limit), described above; clean on recheck.
- `node scripts/check-all.mjs` (via `npm run build`): 2 rounds of fixes — first, `coverage.json`'s
  four cross-topic expert items named topic titles that didn't exactly match their syllabus
  wording (e.g. "Data classification and sensitive data" instead of "Data classification and
  sensitive-data discovery"); fixed to the exact syllabus titles. Second, the reel had only two
  takeaways against the build's own three-takeaway minimum; added a third, on the automate-vs-
  human reveal. Clean on the third build, 238 pages built (and a separate `PREVIEW_HELD=1` build,
  272 pages, surfaced the same title-mismatch issue a second time in `prerequisites.mdx`'s
  `<Resource>` components — fixed there too, then clean).
- `PREVIEW_HELD=1 node tests/reels.mjs ... federated-governance-operating-model`: see looks review
  below. `test:editor` was not re-run this topic; it fails with the same known, pre-existing,
  unrelated sandbox limitation (Playwright popup-page event never fires in this cloud container)
  noted in every prior topic's `REVIEW.md` in this chapter; not a blocker.

## Looks review, self-review, 2026-10-30

Three phone screenshots read and visually confirmed clean:

- `phone-federated-governance-operating-model-02-q.png` (Predict, step 2 of 10): both option cards
  render fully alongside the body text; "PICK AN ANSWER TO CONTINUE" is visible beneath.
- `phone-federated-governance-operating-model-07.png` (classification-gate reveal, step 7 of 10):
  the row pair renders with no overlap, the "MORE" truncation control and the takeaway panel both
  render fully and are visually separated by a divider, "TAP TO CONTINUE" is visible beneath.
- `phone-federated-governance-operating-model-10-q.png` (Prove it, step 10 of 10): both predict
  option cards for the second predict question render fully, alongside the top-of-screen summary
  rows ("inside the limit" / "rule, or person?", "the answer" / "not yet revealed").

No overlap, clipping, or crowding in any of the three; predict panels render cleanly; every reveal
states its point in words, not through brightness alone.

**No independent reviewer ran this review or the content review above — both are self-reviews by
the same session that wrote the topic.**

## Fixes made during drafting

- **`examples.py` classification gate bug:** `check_classification` initially required both `tier`
  and `category` to be non-null, rejecting the well-formed table's own intentionally
  `category: None` non-personal column on the very first run; fixed to check key presence instead
  of non-null values for `category`, keeping `tier` required non-null.
- **`coverage.json` / `prerequisites.mdx` cross-topic title mismatches:** four `<Resource>`/expert-
  item references used shortened or paraphrased topic titles ("Data classification and sensitive
  data", "Access control models: RBAC, ABAC", "Row and column security, dynamic masking",
  "Data-quality frameworks") instead of the exact syllabus wording; caught twice by the build (once
  in a normal build via the coverage check, again in a `PREVIEW_HELD=1` build via `<Resource>`'s
  own runtime check on the reels feed page) — fixed to the syllabus's own exact titles in both
  files.
- **Reel takeaway count:** only two takeaways on the first build, against the build's own
  three-takeaway minimum; added a third on the automate-vs-human reveal (step 5).
- **`narration.json` two over-length lines:** steps 8 and 9 each had one line over the 50-word
  limit (72 and 71 words); both split into two or three shorter sentences.
- **6 `scenes.tsx` row-value-length checks performed while drafting:** caught two early drafts
  (`"itself, or a steward"`, `"a rule, or a person?"`) running to four and five words respectively
  before the file was ever run through the build; shortened to three words each
  (`"itself, or steward"`, `"rule, or person?"`) before the first build attempt.
