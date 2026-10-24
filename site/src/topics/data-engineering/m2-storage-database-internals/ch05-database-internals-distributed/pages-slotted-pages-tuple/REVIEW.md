# Review — de.pages-slotted-pages-tuple

## Content review, self-review, 2026-10-24

Read cold, in order: Chapter 4's last topic (`de.native-extensions-rust-pyo3`)'s reel and
handoff, then this topic's own files in order (reel and scenes, narration, post-notes,
pre-notes, prerequisites, registry entry, `coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then
the next topic's syllabus line (buffer pool and page replacement).

1. **Flow.** Clean. This is the first topic of a new chapter, so the hook names the real
   handoff Chapter 4's last topic left open (every acceleration in that chapter still assumed a
   database engine already existed underneath; this topic opens that engine itself) rather than
   a generic restatement. No `uses` concepts from earlier chapters, matching `CHAPTER.md`'s own
   framing of this topic as the chapter's entry point.
2. **Pre-notes.** Checked against `notes-rules.ts` (5 bullets, under 400 words, no links). Every
   term (page, heap tuple, TOAST, transaction ID, VACUUM) is genuinely assumed rather than taught
   by this reel, except where the term itself (page, heap tuple, TOAST) is exactly what the reel
   teaches — those bullets name the term as a primer, not the mechanism the reel reveals.
3. **Gap hunt.** Checked the syllabus line (`syllabus/data-engineering.md:230`) clause by clause
   against `coverage.json`'s mapped clauses, copying each clause from the markdown-*stripped*
   scope (per `site/src/lib/syllabus.ts`'s `clean()`) rather than the raw `.md` text — the fourth
   clause's cross-reference to *Rust Systems Engineering* originally kept its raw asterisks and
   failed the coverage check on the first build run; fixed by stripping them, matching the gotcha
   already recorded from topic 37. All three clauses present after the fix, each mapped to real
   steps. Every `at.step`/`at.deep` reference checked against the real `reel.tsx` step titles and
   the real, standardized `post-notes.md` headings — one step title had been shortened in
   `reel.tsx` after `coverage.json` was first written (the predict step's own title), caught by
   the build's own coverage check rather than a manual diff, and fixed by re-syncing both
   references. No gap found against the syllabus line, the four sources, or the expert list (ten
   items).
4. **Expert reader.** The predict step (step 4) was checked for the trap of assuming a CTID is a
   physical address: the wrong answer is genuinely tempting, since `psql`'s own display of a CTID
   (`(0,4)`) looks exactly like a coordinate pair into physical space, and the reveal (step 5)
   demonstrates the real indirection directly with a real `VACUUM` run rather than asserting it.
   The InnoDB step (step 8) was checked for honesty: the claim (InnoDB has its own, genuinely
   different overflow-page mechanism) is kept separate from anything that would need a real
   InnoDB instance to measure, which this sandbox doesn't have — matching the disclosed,
   sourced-only pattern Chapters 1–4 already established.
5. **Engagement.** Hook (step 1) poses the real open question left by Chapter 4's own handoff.
   Predict at step 4, within the first four. Three takeaways (steps 5, 6, 7) — no takeaway on
   step 2 (the first reveal after the hook), deliberately, to avoid the documented
   phone-caption-collision gotcha at the first non-predict step, matching the pattern established
   on topics 35–36. Recap (step 9) pulls every layer into one line each. "Prove it" (step 10) is a
   genuine synthesis task: reasoning about whether a held CTID survives a concurrent `VACUUM`
   elsewhere in the same table, directly extending this topic's own real measurement to a new
   scenario rather than just restating it.
6. **Narration teaches.** `narration-teaches.mjs` passed clean on the first run; 0 flags, highest
   overlap 24% (step 5), well under the threshold, every line under the 50-word limit. No digits,
   symbols or code names appear in any narration line: "PostgreSQL"/"Postgres" is spoken as "this
   sandbox's own database," "CTID" as "the handle" or "that handle," "line pointer" as "a slot"/
   "a small, fixed slot number," "TOAST" as "something has to give"/"chopped into pieces," and
   "InnoDB" as "a different engine."

No other findings. `coverage.json` → `gapReview` recorded below.

## Checks run

- `node scripts/sources.mjs check` — 15/15 quotes verified word for word.
- `python3 examples.py` — pass, "pages-slotted-pages-tuple examples: all checks pass," run
  repeatedly for stability against this sandbox's own PostgreSQL 16 cluster: a real page's
  `pd_lower`/`pd_upper`/`pd_special` ordering confirmed; a real `DELETE` of three rows followed by
  a real `VACUUM`, with the two surviving rows' CTIDs confirmed bit-for-bit identical before and
  after while their line pointers' own stored offsets moved (`{4: '(0,4)'}`/`{5: '(0,5)'}`
  unchanged; offsets 8032→8152 and 7992→8112); a real inserted row with one null column, its
  `t_bits` read directly (`'11000000'`, third bit 0) against a row with no null (`t_bits` absent
  entirely); a real 8000-byte incompressible value chunked into 5 real TOAST rows, leaving a
  46-byte in-heap row that round-trips to the exact original 8000 bytes.
- `node scripts/narration-teaches.mjs .../pages-slotted-pages-tuple` — pass on the first run; 0
  flags, highest overlap 24%, every line under the 50-word limit, no digits.
- `node scripts/check-all.mjs --skip reels,links,narration --topic pages-slotted-pages-tuple` —
  failed twice (a coverage-clause markdown-asterisk mismatch and a stale step-title reference
  after a late title edit, then three over-length takeaways), passed clean on the fourth run
  (locked, docs, sources, build).
- `node scripts/check-all.mjs --only links,narration --topic pages-slotted-pages-tuple` — pass, 0
  broken links; no new blocked or title-mismatch warnings traced to this topic.
- `node scripts/check-all.mjs --only reels --topic pages-slotted-pages-tuple` — failed once (one
  phone-only text-overlap at step 2), passed on the second run (see Looks review below), "Reel
  smoke test passed: 1 live reel(s) at desktop and phone sizes."

## Fixes made during this build

- **A TOAST demonstration's first draft used a highly repetitive string**, which PostgreSQL's own
  compression collapsed well under the inline threshold before out-of-line storage could ever
  trigger. Caught directly (the real chunk count came back zero) rather than assumed to have
  worked; fixed by switching to `os.urandom`-derived, base64-encoded data, which reliably
  triggers real, measurable chunking.
- **`coverage.json`'s fourth syllabus clause, copied with its literal cross-reference
  asterisks, failed the coverage check** even though it matched the raw `.md` file byte for byte,
  because the build's own `syllabus.ts` strips all markdown emphasis before comparing — the same
  gotcha already recorded from topic 37, applied here on the second attempt rather than
  rediscovered from scratch, though the first coverage.json draft was still written before the
  predict step's title was shortened in `reel.tsx`, so two of `coverage.json`'s own `at.step`
  references went stale and had to be re-synced.
- **Three narration-adjacent takeaway strings in `reel.tsx` exceeded the 20-word limit** (22, 27,
  and 23–21 words across two rounds of shortening) — fixed by trimming each to exactly 20 words
  or fewer without changing their claims.
- **One `scenes.tsx` row overlapped on phone** (step 2, "line pointers, then items" / "grow
  toward each other") — the same plain label/value text-too-long-for-the-row-width class hit on
  every prior topic in this chapter's predecessor chapter. Fixed by shortening both the label and
  the value; the second run passed cleanly on both sizes.

## Looks review, self-review

First `check-all.mjs --only reels --topic pages-slotted-pages-tuple` run failed on phone only, at
step 2 — plain label/value row text too long for the row width at phone size (not the
takeaway-caption-collision gotcha, since step 2 deliberately carries no `takeaway`). Fixed by
shortening the row. Re-ran; the second run passed cleanly on both desktop and phone.

Opened a representative set of screenshots from `site/test-results/` and judged them against
`DESIGN.md`'s looks-review checklist:

- `phone-pages-slotted-pages-tuple-02.png` (the five-parts reveal, phone, post-fix) — renders
  cleanly, no overlap.
- `desktop-pages-slotted-pages-tuple-05.png` (step 5, the VACUUM reveal, desktop) — the
  before/after row contrast renders cleanly, sidebar and fig caption both legible.
- `desktop-pages-slotted-pages-tuple-04-q.png` (step 4, predict frame, desktop) — both
  answer-option cards render fully, no clipping.
- `phone-pages-slotted-pages-tuple-09.png` (Recap, phone) — all four rows render cleanly with no
  overlap.

Checked against the full checklist:

- The point lands at a glance and is shown by more than colour: each reveal's own row text (e.g.
  "before VACUUM" / "offset A" vs. "after VACUUM" / "offset B, same CTID") makes the mechanism
  explicit, not just `C.focus`.
- Every step moves (opacity-staged rows via `easeOut(seg(...))`) and lands on a final frame that
  teaches on its own.
- Nothing crowded, clipped or small at either size, including the step-2 fix above.
- Colour is used only where it means something: `C.focus` consistently marks the surprising or
  measured value (the line-pointer contents, the post-VACUUM offset, the null bit, the TOAST
  pointer, InnoDB's own different answer, the fix in "Prove it") — never decorative.
- Captions match the picture at every checked step.

No findings beyond the text-overlap fix already made above. `coverage.json` → `gapReview`: date
2026-10-24, by "Claude (single session)", open: [] (recorded in the committed file). All reviews
in this file are self-review by the same session that wrote the content; no independent reviewer
ran. Expert sign-off: pending.
