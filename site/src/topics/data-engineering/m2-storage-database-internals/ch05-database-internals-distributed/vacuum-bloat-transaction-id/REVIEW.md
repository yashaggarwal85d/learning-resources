# Review — de.vacuum-bloat-transaction-id

## Content review, self-review, 2026-10-24

Read in order: `mvcc-append-versions-vs/reel.tsx` + `mvcc-append-versions-vs/post-notes.md`
(previous topic's reel and Deep dive), then this topic's `reel.tsx`, `scenes.tsx`,
`narration.json`, `post-notes.md`, `pre-notes.md`, `prerequisites.mdx`, `registry.ts` entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`, and the next topic's syllabus line
(`CHAPTER.md`, "8. LSM trees: write and read paths").

1. **[Expert reader] Step 7's autovacuum-tuning depth was thin on first pass.** The body named
   "a configured base value plus a scale factor" without ever saying these are the actual two
   knobs an administrator sets (`autovacuum_vacuum_threshold`, `autovacuum_vacuum_scale_factor`
   — both already correctly named in `post-notes.md` and `FACT-CHECK.md`, but absent from the
   step that teaches the formula). **Fix applied:** added "the two knobs an administrator
   actually tunes" to the body, naming the formula's two terms as real, settable things rather
   than an abstract equation. Severity: minor (the formula itself was already correct and
   sourced; this was a depth gap, not an error).

2. **[Gap hunt] Checked the "32-bit" clause against the actual on-screen text.** `reel.tsx`
   deliberately never shows the literal "32-bit" phrase (it isn't backed by `examples.py`, since
   this sandbox can't execute billions of transactions to demonstrate wraparound), but step 8's
   body still teaches the mechanism precisely — "compared in a circle, not a line" — and the
   exact bit width and thresholds are in `post-notes.md` → Production failures, which the
   coverage map points to. Checked `coverage.json`'s mapping for this clause against both
   locations; both actually teach it. No fix needed.

3. **[Gap hunt] Checked the visibility map's own coverage.** The syllabus names it as its own
   clause; `reel.tsx` step 3's body folds it into one sentence ("the visibility map is what lets
   vacuum... skip a page it already knows is all-visible") rather than giving it a dedicated
   step. Checked this against the source (`pg-routine-vacuuming.txt` §24.1.4) and the mapping in
   `coverage.json`: the sentence states both of the source's two stated purposes (vacuum skip,
   index-only scan skip), so the clause is actually taught, not just named. No fix needed.

4. **[Flow] Continuity with the previous topic and the next topic's syllabus line, both
   checked.** This topic's Hook body opens directly from `mvcc-append-versions-vs`'s own handoff
   ("Postgres's own append-only MVCC never overwrites a row in place, which means every update
   leaves an old version behind"), matched close to verbatim. This topic's own handoff is the
   verbatim bridge `CHAPTER.md` gives for the next topic (LSM trees), confirmed by reading that
   topic's own entry, which explicitly answers this topic's handoff ("This topic is the other
   family entirely — a structure built from the start around never updating in place: the LSM
   tree").

5. **[Pre-notes] Checked against the reel's own vocabulary assumptions.** All six bullets
   (transaction/XID, `xmin`/`xmax`, snapshot, heap tuple, index, `REPEATABLE READ`) are terms the
   reel assumes rather than teaches; dead tuple, HOT update, the visibility map, the xmin
   horizon, autovacuum's threshold, and freezing/wraparound are deliberately **not** in
   pre-notes since the reel itself teaches every one of them (outcomes 1–4). No links present,
   within the 4–14 bullet range. No fix needed.

6. **[Engagement] Arc checked end to end.** Step 1 hooks with the previous topic's own handoff as
   an open question; two predicts (step 4 and step 10 "Prove it", satisfying the full-topic
   requirement); a surprising number (step 6's middle checkpoint — VACUUM runs and reclaims
   nothing); four takeaways (steps 2, 3, 6, 8 — more than the minimum three); a recap (step 9)
   that pulls the dead tuple, the horizon, and the counter together as one mechanism at three
   scales. No fix needed.

7. **[Narration teaches] Checked `node scripts/narration-teaches.mjs` directly.** All ten steps
   passed on the first run: description-overlap between zero and five percent, longest line
   thirty-five words (under the fifty-word limit), no verbatim flags. No fix needed — writing
   each line from "what would surprise someone running this," not from the step's own body text,
   held up without iteration.

8. **[Gap hunt] Checked the multixact "declared, out of scope" decision against the next
   topic.** Multixacts are marked `out` in `coverage.json → expert`, reasoned as "a distinct
   counter and wraparound path." Confirmed this doesn't quietly drop syllabus content: multixacts
   aren't named anywhere in this topic's own syllabus line (only "32-bit XID freezing," singular
   mechanism), so leaving them for `post-notes.md` → Frontier rather than teaching them is a
   scope choice, not a gap. No fix needed.

`coverage.json → gapReview` recorded below.
