# Review — de.data-classification-sensitive-data

## Content review, self-review, 2026-10-30

1. **Two cross-chapter `uses` ids `CHAPTER.md` cites don't resolve.** Chapter 10 §10.5 (EU
   regulatory architecture) and §10.2 (cloud discovery products) are not in `registry.ts` under
   any id, because Chapter 10 is unbuilt (confirmed: only a `CHAPTER.md` plan exists under
   `ch10-cloud-data-architecture`, no topic folders). **Fixed** by declaring both rather than
   guessing, logged in `OUTLINE.md` → "Changes from the chapter plan" and named again in
   `post-notes.md`'s "Frontier."
2. **Gap hunt against the syllabus line:** all five clauses (classification schemes, automated
   discovery, tag propagation, false negatives in free text, classification as policy input)
   mapped in `coverage.json`; no clause left unmapped.
3. **Flow check:** `status: 'held'`, so `checkFlow` skips this topic (confirmed same as topics
   1-3). Coverage and topic-file checks both pass.
4. **Expert reader pass:** the vendor reveal (step 5) names the exact phrase each vendor uses for
   its own technique ("agentic AI system" for Databricks, "infoType" for Google, "sensitive
   information types" for Purview, "managed data identifiers" for Macie) rather than flattening
   four different products into one generic description.
5. **Engagement:** hook and predict both on steps 1-2 (within the first four); a second predict
   at step 10 ("Prove it") requires the learner to multiply a miss rate by a sensitive fraction,
   not just recall a fact; three takeaways at steps 6, 7, 8 (all after the reel's own midpoint of
   step 5), checked at 15, 15 and 14 words via a Python word-count pass before the build ran;
   recap at step 9.
6. **Narration teaches, not reads:** two fixes caught by `narration-teaches.mjs` before this
   topic shipped — a stray `"answer": []` on step 6 (a reveal step with no `predict` block,
   the exact mistake made and caught in topic 3's own narration, caught again here before the
   check even ran) was removed; "infoType" in prose tripped the code-name detector and was
   respelled "info type"; two lines flagged as reading the screen verbatim (steps 3 and 10) were
   rewritten to make the same point in different words. Clean after all four fixes, description
   overlap under 22% on every step.
7. **Numbers checked against `examples.py`:** ninety-one percent precision and full recall on two
   hundred structured rows, fifty percent recall and three of six notes missed on free text, and
   ten percent of columns left sensitive and unprotected (fifty percent miss rate times a fifth
   of columns truly sensitive) — every number in `reel.tsx` prose is spelled out as a word and
   traces to an asserted value. One bug caught and fixed while writing `examples.py`: an initial
   precision/recall calculation produced an impossible recall over 100%, from double-counting a
   row's decoy order-reference number; rewritten to count true and false positives per row
   directly rather than aggregating across two separate loops.

### Checks run

- `node scripts/sources.mjs check`: 11 quotes found word for word, 0 problems (one quote fixed
  during drafting: the Google infoType quote was initially written from memory and didn't match
  the cached source text; replaced with the source's own actual sentences).
- `python3 examples.py`: all asserts pass (10 functions, 1 `main`), after fixing the
  precision/recall bug above. The free-text ground truth was deliberately built with two PII
  mentions no phone-or-card regex built for structured columns can match at all (a spelled-out
  phone number, and a card reference given only as its last four digits), so the scanner's own
  recall gap is real and measured, not assumed.
- `node scripts/narration-teaches.mjs`: 4 fixes (stray answer removed, one code-name respelled,
  two verbatim-overlap lines rewritten); clean after all four.
- `node scripts/check-all.mjs` (via `npm run build`): clean on the first run after the files
  above were fixed; 238 pages built.
- `node scripts/check-all.mjs --only reels --topic data-classification-sensitive-data`: "1 live
  reel(s) at desktop and phone sizes" — passed. `test:editor` failed with the same pre-existing,
  already-tracked GitHub-token issue noted in topics 1-3's `REVIEW.md`; unrelated to this topic's
  content.

## Looks review, self-review, 2026-10-30

Reviewed screenshots in `site/test-results/*-data-classification-sensitive-data-*.png` (phone
size, spot-checked the hook, predict, the four-row vendor reveal, and recap):

1. No label/value row overlap at phone width, including the four-row layout (step 5, "ML and LLM
   classifiers, by vendor") — the row most at risk of crowding at phone width.
2. The predict panel (step 2) renders both option cards cleanly alongside the longer multi-sentence
   hook/predict body text.
3. The takeaway panel renders fully, italic, clearly separated from the body text.
4. Every reviewed step's readout states its point in words on the right-hand rows ("91%
   precision" / "3 of 6" / "tier and category"), not through brightness alone.
5. No clipped, crowded or under-size text found at phone width in any reviewed frame.

**No independent reviewer ran this review or the content review above — both are self-reviews by
the same session that wrote the topic.**
