# Review — de.training-set-versioning-lineage

## Content review (self-review, 2026-10-30)

- Every syllabus clause maps to a step (coverage.json): reproducible datasets via table-format
  snapshots/tags (Hook, Reveal: a moving target vs. a pinned one), lakeFS branches and DVC pins
  (Reveal: lakeFS branches, Reveal: DVC pins, Reveal: the decision by scale), linking dataset
  versions, code and models in an experiment tracker (Reveal: linking it in an experiment
  tracker), and labeling pipelines / label-version drift (Reveal: label-version drift).
- All claims in FACT-CHECK.md are grounded either in a fetched, quote-checked primary source
  (lakeFS's own Internals page, DVC's Internal Files page, MLflow 3.0's own preview docs, Apache
  Iceberg's Branching and Tagging page) or in this topic's own `examples.py`, run for real against
  this sandbox's Postgres cluster and local file hashing: a pinned snapshot proven unaffected by a
  later mutation to its live source table (while the live query does change), a content-hash
  dedup/change check (identical content hashes identically, one changed byte changes the hash), an
  experiment-tracker stand-in correctly searching by dataset digest, and an 18.0% label-flip rate
  (270/1,500) between two churn-window label definitions over the identical feature snapshot.
- The `docs.lakefs.io/understand/model.html` URL named in CHAPTER.md's planning notes now
  301-redirects to `docs.lakefs.io/concepts/internals/`; confirmed via `curl -sIL` and followed to
  its real content, which is the URL actually cited in SOURCES.md and references.md. Documented in
  FACT-CHECK.md's Problem Solving section.
- The reel's engagement arc holds: two predicts (step 2 and the closing "Prove it"), no takeaway
  on step 3 (the reel test's reference step), five takeaways (steps 4, 5, 6, 7, 8), a surprising
  number (the 18.0% label-flip rate) revealed through measurement rather than stated upfront.
- Narration (verified via `narration-teaches.mjs`): zero digits/symbols, every line under the
  50-word floor (one line was originally 57 words and was split in two), highest
  description-overlap 18% (step 1, still well under the 50% flag threshold).
- All five takeaways were initially 21-22 words (over the 20-word limit) and trimmed to 16-20
  words each before the build check was run, catching the limit before it needed a second pass.
- Bridge answers topic 3's handoff verbatim per CHAPTER.md; handoff leads into topic 5 (drift and
  label-delay monitoring) exactly as planned.

## Looks review (self-review, 2026-10-30)

Checked all 10 steps at desktop and phone sizes from
`site/test-results/{desktop,phone}-training-set-versioning-lineage-*.png`.

- The first automated reel-test run found three phone-only layout failures, none present on
  desktop:
  1. Step 1 (Hook)'s bottom caption ran outside the drawing on phone's larger text scale. Fixed by
     splitting the one long caption line into two shorter stacked lines instead of relying on the
     `T` component's `w` prop, which is `fontWeight`, not a text-wrap width — the same
     already-documented gotcha from earlier topics.
  2. Step 6 (`RevealDecisionByScale`)'s bottom caption had the identical problem for the identical
     reason; fixed the same way (two stacked lines).
  3. Step 9 (`Recap`)'s four `Row`-component label/value pairs overlapped on phone: converting them
     to stacked two-line `<T>` blocks (as topics 1 and 3 already established for this exact failure
     mode) fixed the labels but the first attempt used too tight a vertical gap within each pair,
     still overlapping on phone's larger scale — widened the gap (26px within a pair, 60px between
     pairs) and increased the scene's `h` from 220 to 270 to fit the result, which passed cleanly.
- Everything else — the two-query timeline, the predict/reveal row pairs, the commit/branch/tag
  diagram, the DVC dedup diagram, the tracker's three linked boxes, the label-drift comparison, and
  prove-it — reads correctly at both sizes with no other contrast, overlap, or clipping issues.

Final `node scripts/check-all.mjs --only reels --topic training-set-versioning-lineage` run:
`test:reels` passed ("1 live reel(s) at desktop and phone sizes"). `test:editor` still fails with
"a save did not open a new GitHub issue" — the same known, pre-existing, topic-independent
Playwright/Chromium sandbox limitation documented on topics 1-3's REVIEW.md, not caused by this
topic and not a shipping blocker.
