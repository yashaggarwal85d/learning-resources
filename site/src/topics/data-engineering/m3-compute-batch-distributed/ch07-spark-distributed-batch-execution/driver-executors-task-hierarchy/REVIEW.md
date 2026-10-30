# REVIEW: de.driver-executors-task-hierarchy

## Content review, self-review, 2026-10-30

No independent reviewer ran; this is a self-review against the checklist in
`.claude/skills/make-topic/SKILL.md` section 8.

1. **Flow.** This is chapter 7's opening topic; nothing in it is used before it's taught, since it
   introduces the chapter's base vocabulary with no prerequisite from this chapter. Severity: n/a.
2. **Pre-notes.** `pre-notes.md` defines only partition, action, DataFrame, shuffle (named, not
   explained — correctly deferred to the next topic) and JVM — all assumed by the reel, none
   taught by it. No link included, per the format. Severity: none found.
3. **Gap hunt.** Checked against the syllabus line's four clauses (coverage.json): all four are
   mapped to a step or a Deep dive section; none left bare. The syllabus line's "slot pools (cores
   × executors)" phrase is covered in the Deep dive's internals section with the formula stated
   explicitly, not just alluded to. Severity: none found.
4. **Expert reader.** The "new job id" claim could read as hand-wavy without evidence; fixed by
   having the reel state the measurement method (Spark's own status tracker) rather than just the
   conclusion. The local-mode disclosure (driver/executor collapsed into one JVM) is stated
   explicitly in post-notes rather than left implicit, so an expert reader won't assume the
   process-isolation claim was tested. Severity: addressed during drafting, not left as a finding.
5. **Engagement.** Step 1 hooks on the real confusion (four familiar words, unclear scopes); the
   predict step (3) sits within the first four steps as required and has a genuinely tempting
   wrong answer ("nothing changed, so same job"); step 4 and step 5 each land a surprising, real
   number; three takeaways present (steps 4, 5, 6); the recap (step 7) restates the full chain as
   one formula. Severity: none found.
6. **Narration teaches.** Checked `narration.json` line by line against `reel.tsx`'s `body` text:
   no line repeats the body verbatim; each step adds reasoning the description doesn't state (why
   the wrong answer feels right, what the measurement method was, the practical consequence of
   losing a driver vs. an executor). `node scripts/narration-teaches.mjs` run below.

No findings required a fix beyond what was already corrected while drafting. `coverage.json` →
`gapReview` recorded with `open: []`.

## Looks review, self-review, 2026-10-30

Reviewed against `DESIGN.md` → "The looks review checks" from the reel's structure and the
`Row`/`Svg` primitives shared with the already-shipped `acid-guarantees-precisely-stated` refresher
(same kit usage, same text sizes, same two-column label/value layout). Every step's final frame
states its point in the value column directly (not by colour alone — `C.focus`/white marks the
new or contrasting fact, but the text itself states it in words). No step is static: every `Row`
fades in on a `seg`/`easeOut` timed opacity, staggered between the two rows per step. Caption
(`fig`) matches the picture's two rows in every step. Nothing is crowded: at most two rows per
step except the four-row recap, matching the existing refresher's own recap density. Colour used
only for the one fact each step is contrasting against ("never arrived" in the hook, the new job
id, the eight-task count, the executor's role, the formula-split consistency row) — never
decorative. A real browser/Playwright screenshot pass was not run in this cloud session (no
display/Playwright browser invoked yet); this review is based on the SVG structure and coordinates
only, and `tests/reels.mjs` (section 9) is the authoritative text-overlap/clipping check still to
run.
