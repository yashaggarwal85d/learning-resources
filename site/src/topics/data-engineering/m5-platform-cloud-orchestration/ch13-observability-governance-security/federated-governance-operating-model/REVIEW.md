# Review — de.federated-governance-operating-model

## Content review, self-review, 2026-11-02

1. **No real multi-service governance platform built; a toy registration gate instead.** Per
   CHAPTER.md's own lab description ("build the self-serve registration flow that validates
   schema, contract and classification tags"), `examples.py` builds exactly that check
   directly in Python rather than standing up a real policy engine or catalog integration.
2. **Both primary sources fetched cleanly this time** -- martinfowler.com and melconway.com
   both resolved on the first try, unlike several earlier topics' GitHub/Kafka substitutions.
3. **Conway's thesis quoted from the paper's own "Conclusion" section**, not from his 2010
   "author's note" informal restatement, to match CHAPTER.md's "in his own words" instruction
   with the actual 1968 text rather than a later paraphrase of it.
4. **Gap hunt against the syllabus line:** the mesh shape, reverse Conway's law, and the
   automate-vs-human split are each mapped across 5 of the reel's 9 steps in `coverage.json`;
   no part of the clause left unmapped. Team topology (§19.1) is named only, per CHAPTER.md's
   own "pointed to by name and not taught here."
5. **declared: []** matches CHAPTER.md's own "Declared: none" for this topic.
6. **Flow check:** `status: 'held'`, so `checkFlow` skips this topic.
7. **Engagement:** hook at step 1; predicts at steps 3 and 6; three takeaways at steps 4, 7 and
   9 (Recap). The first takeaway draft ran to 24 words and needed trimming twice to fit the
   20-word limit.
8. **Phone-layout overflow on two scenes:** the Hook's "no central rules" row and the
   registration-gate reveal's "missing classification tag" row packed too much value text onto
   one row. Fixed by shortening each to one or two words.
9. **Prerequisites.mdx stayed links-only** -- a prose sentence about Chapter 19's team-topology
   material was moved into its own "Goes deeper later" section with a `Resource` link, rather
   than left as bare prose outside a `Resource` tag.

## Checks run

- `node scripts/sources.mjs check .`: 9 quotes found word for word, 0 problems on the first
  check (no fixes needed).
- `python3 -I examples.py`: "all claims verified" -- the registration gate's admit and
  reject-by-name behavior.
- `node scripts/check-all.mjs --topic .../federated-governance-operating-model --only build`:
  clean on the first run, 238 pages built -- no unmeasured-number or narration-reads-the-
  description fixes needed this topic.
- `node scripts/check-all.mjs --topic .../federated-governance-operating-model --skip
  reels,links`: locked, docs, sources, build, narration all pass.
- `node scripts/check-docs.mjs`: all relative links and anchors resolve across 3368 Markdown
  files.
- `PREVIEW_HELD=1 npx astro build` (518 pages, all held topics included) and `PREVIEW_HELD=1
  node tests/reels.mjs http://localhost:4321/learning-resources/
  federated-governance-operating-model`: reel smoke test failed once (phone overflow on two
  rows), fixed per item 8, then passed at desktop and phone sizes.

## Looks review, self-review, 2026-11-02

Hit a phone-overflow failure on two scenes packing a longer value onto a label/value row --
fixed by shortening each value to one or two words rather than a full phrase. Reel smoke test
covered both desktop and phone sizes across all 9 steps, including both predict panels (steps
3 and 6) and the three-row mesh-shape, split-answer, stewardship-answer and Recap scenes, with
no overflow or swipe-caption failures after the fix.

**No independent reviewer ran this review or the content review above — both are self-reviews by
the same session that wrote the topic.**
