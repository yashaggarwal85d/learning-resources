# Review — de.bi-tools-as-warehouse

## Content review (self-review, 2026-10-30)

- Every syllabus clause maps to a step (coverage.json): the five named tools by category (Reveal:
  the tools, by category); the three query modes and their warehouse-load trade-off (Reveal:
  import/extract; Reveal: live-query; Reveal: Direct Lake's transcoding); headless BI serving one
  metrics layer to many tools (Reveal: headless BI).
- Sourcing: all five vendor sources fetched cleanly from each vendor's own documentation, except
  Tableau — tableau.com's marketing site returned HTTP 403 to this sandbox's fetcher domain-wide
  (both the homepage and the "what is Tableau" page), consistent with the GitHub-web-page and
  medium.com domain-wide blocks seen on earlier topics in this chapter. Substituted
  help.tableau.com, Tableau's own documentation subdomain (not a third party), which fetched
  cleanly; documented in FACT-CHECK.md's Problem Solving section.
- No vendor comparative benchmark or latency figure is quoted anywhere in this topic — every claim
  is architectural/categorical (what a tool is, what mechanism it uses), consistent with this
  being a 5-minute refresher whose one real teaching point is the query-mode mechanism, not a
  tool-by-tool feature or performance survey.
- This topic has no lab by design (CHAPTER.md: "Lab: none; a refresher") — its hook and Prove It
  steps are reasoned entirely from the three query modes' own documented mechanism.
- The reel's engagement arc holds: two predicts (step 2, and the closing "Prove it"), no takeaway
  on step 3 (the reel test's reference step, "Reveal: the tools, by category"), takeaways on steps
  4, 5, 6, 7.
- Narration (verified via `narration-teaches.mjs`): all nine steps clean, zero lines over the
  50-word floor, description-overlap low across every step (0–14%).
- Takeaways: all five checked and kept under the 20-word limit on first draft; one ("Headless BI
  is...") was drafted at 21 words and trimmed to 17 before being written into reel.tsx, so no
  post-hoc fix was needed.
- Bridge answers topic 8's handoff verbatim per CHAPTER.md; handoff leads into topic 10 (BI
  serving-layer performance) exactly as planned. This opens the chapter's run through §17.7's
  remaining two topics.

## Looks review (self-review, 2026-10-30)

Checked via the topic-scoped reel smoke test (`tests/reels.mjs`) at desktop and phone sizes.

- First run failed on phone with four overlap issues, all on step 3's five-row tool list: each
  row's two-line label (tool name, category) was packed at 40px vertical spacing, too tight for
  phone's larger text scale, so each row's category line ran into the next row's tool name.
- Fixed by widening the row pitch from 40px to 52px and increasing the scene's `Svg h` from 220 to
  300 to fit the now-taller five-row block, following the same "give it more room" fix used on
  earlier topics' single-caption overflow bugs, adapted here to a repeated-row layout instead of a
  single long caption.
- Second run passed cleanly at both sizes with no further issues.

Final `node scripts/check-all.mjs --only reels --topic bi-tools-as-warehouse` run: `test:reels`
passed ("Reel smoke test passed: 1 live reel(s) at desktop and phone sizes"). `test:editor` still
fails with "a save did not open a new GitHub issue" — the same known, pre-existing,
topic-independent Playwright/Chromium sandbox limitation documented on every prior topic's
REVIEW.md in this chapter, not caused by this topic and not a shipping blocker.
