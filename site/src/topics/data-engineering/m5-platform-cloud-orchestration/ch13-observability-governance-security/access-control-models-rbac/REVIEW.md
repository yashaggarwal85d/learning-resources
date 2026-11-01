# Review — de.access-control-models-rbac

## Content review, self-review, 2026-11-01

1. **The syllabus clause includes "periodic access reviews," which the initial 10-step reel draft
   left uncovered.** Added an eleventh step ("Reveal: entitlements drift, so a periodic access
   review is the catch policy alone misses") before the recap, with its own `scenes.tsx` visual
   and `coverage.json` mapping, rather than shipping a topic that skips a stated outcome
   ("design an access review and say what it catches that policy alone does not").
2. **NIST's RBAC project page moved** — the URL CHAPTER.md might imply
   (`nist.gov/programs-projects/role-based-access-control`) 404s; the current page is
   `csrc.nist.gov/projects/role-based-access-control`, found via search and fetched cleanly.
3. **Three quotes failed `sources.mjs check` on the first pass** — a Cedar quote and an RFC 7644
   quote had been written as single sentences joined across an ellipsis, which the checker
   doesn't match; split each into separate quote blocks. A second RFC 7644 quote also crossed a
   PDF-extracted hyphenated line break ("multi-\ndomain"); replaced it with a different sentence
   from the same document's Introduction that doesn't cross a line-wrapped hyphen. Re-ran: 12
   quotes, 0 problems.
4. **Gap hunt against the syllabus line:** all six clauses (role explosion, attribute/tag-based
   policies, decision vs enforcement points, policy engines, IdP federation, periodic reviews)
   are now mapped across the reel's 11 steps in `coverage.json`; no clause left unmapped.
5. **`declared` placeholders:** `cloud-iam-identity-ch10` and `catalog-credential-vending-ch10`
   follow the repo's established convention for a cross-chapter `uses` that CHAPTER.md names but
   that Chapter 10 (unbuilt beyond its own `CHAPTER.md`) cannot resolve; `role` and `permission`
   per CHAPTER.md's own "Declared: the idea of a role and a permission."
6. **Flow check:** `status: 'held'`, so `checkFlow` skips this topic.
7. **Engagement:** hook at step 1; predicts at steps 3 and 6 (both within or just past the
   reel's first half); three takeaways at steps 5, 8 and 11 (Recap), each trimmed to exactly 20
   words by hand after initial drafts ran 21-27 words over three rounds.
8. **Narration teaches, not reads:** rewrote every line as the professor's own framing rather
   than restating `reel.tsx`'s body sentences. One line in step 9 ran 52 words (over the
   50-word voice limit) on the first draft; split into two lines.
9. **Numbers checked against `examples.py`:** 2,520 total roles, 3 new RBAC roles for one new
   dataset across three environments, 0 new ABAC edits for the same change — every number in
   `reel.tsx` prose traces to an asserted value, and the role-count arithmetic was additionally
   swept across nine other team/dataset/environment combinations to confirm it generalises.

### Checks run

- `node scripts/sources.mjs check`: 12 quotes found word for word, 0 problems (after the fixes
  above).
- `python3 examples.py`: all claims verified (role counts, new-dataset cost comparison, and the
  ABAC rule tested on four distinct cases).
- `node scripts/check-all.mjs --topic .../access-control-models-rbac --only build`: 1 fix during
  the build (the coverage expert-item count below 10, and a 52-word narration line); clean on
  rebuild, 238 pages built.
- `node scripts/check-all.mjs --topic .../access-control-models-rbac --skip reels,links`:
  locked, docs, sources, build, narration all pass.
- `PREVIEW_HELD=1 npx astro build` and `PREVIEW_HELD=1 node tests/reels.mjs
  http://localhost:4321/learning-resources/ access-control-models-rbac`: reel smoke test passed
  at desktop and phone sizes.

## Looks review, self-review, 2026-11-01

First Playwright run failed on phone: the Hook scene's second row ("new restricted dataset" /
"one change or fourteen?") ran the value text into the label, because the value held four
words. Fixed by shortening both the label and the value to two and four words respectively
("new dataset" / "one change, or many?"); re-ran clean.

Reel smoke test then covered both desktop and phone sizes across all 11 steps, including both
predict panels (steps 3 and 6) and the three-row Recap scene, with no overflow or
swipe-caption failures. Row label/value pairs in `scenes.tsx` kept to 1-3 words each elsewhere.

**No independent reviewer ran this review or the content review above — both are self-reviews by
the same session that wrote the topic.**
