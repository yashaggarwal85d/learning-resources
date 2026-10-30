# Review — de.slo-burn-rate-alerting

## Content review, self-review, 2026-10-30

1. **Two cross-chapter `uses` ids `CHAPTER.md` cites don't resolve.** Chapter 11 §11.3's "Data
   SLIs, SLOs and error budgets" and "Data incident response and blast radius" are not in
   `registry.ts` under any id, because Chapter 11 is unbuilt (confirmed: only a `CHAPTER.md` plan
   exists under `ch11-orchestration-reliability-dataops`, no topic folders). **Fixed** by declaring
   both rather than guessing, logged in `OUTLINE.md` → "Changes from the chapter plan." `littles-law`
   is also declared: it is Chapter 1 DSA-linked material, not resolvable to a single `registry.ts`
   id without ambiguity, so named in prose only (`post-notes.md`) rather than claimed as `uses`.
2. **Gap hunt against the syllabus line:** all five clauses (symptom-based alerts, multi-window
   multi-burn-rate rules, schedule-aware freshness, dedup/owner routing, the actionable-page test)
   mapped in `coverage.json`; no clause left unmapped. The exact-match coverage checker caught one
   mismatch during drafting: the syllabus uses double quotes around "every page must be actionable"
   while the first draft used single quotes — fixed to match the syllabus text exactly.
3. **Flow check:** `status: 'held'`, so `checkFlow` skips this topic (confirmed same as topics 1-2).
   Coverage and topic-file checks both pass.
4. **Expert reader pass:** the recommended-thresholds reveal (step 6) states the workbook's own
   numbers (2%/1hr, 5%/6hr page; 10%/3day ticket) and then immediately shows, with a real computed
   figure (1.4%), that they can silently fail to fire at all for a 90% SLO — the honest caveat the
   workbook itself states, not glossed over.
5. **Engagement:** hook and predict both on step 1-2 (within the first four, matching `CHAPTER.md`'s
   own hook text verbatim); a second predict at step 12 ("Prove it") tests whether the learner can
   pick the one fix (schedule-awareness) that doesn't trade detection speed for fewer false alarms;
   three takeaways at steps checked at 19, 18 and 16 words via a Python word-count pass before the
   build ran; recap at step 11.
6. **Narration teaches, not reads:** one line over the 50-word limit (step 2's predict question) was
   caught and split into two lines during drafting; one stray `"answer": []` on step 6 (a reveal step
   with no `predict` block in `reel.tsx`) was caught and removed before the check ran. Clean on
   `narration-teaches.mjs` after both fixes, description overlap under 26% on every step.
7. **Numbers checked against `examples.py`:** burn rate 1.0 → 30 days, burn rate 14.4 → 50 hours,
   the fixed-threshold ~719-hour reset, the multi-window ~5-minute detect/reset, the 1.4%
   low-availability figure (matches the workbook's own quoted number exactly), and the
   10-false-alarms-vs-0 freshness comparison — every number in `reel.tsx` prose is spelled out as a
   word and traces to an asserted value.

### Checks run

- `node scripts/sources.mjs check`: 10 quotes found word for word, 0 problems.
- `python3 examples.py`: all asserts pass (5 functions, 1 `main`).
- `node scripts/narration-teaches.mjs`: 1 fix (step 2 line over 50 words, split in two), 1 fix
  (stray `answer: []` on step 6 removed); clean after both.
- `node scripts/check-all.mjs` (via `npm run build`): 1 fix during build — `coverage.json`'s
  actionable-page-test clause used single quotes where the syllabus uses double quotes, and the
  Prometheus source item's `deep` pointer used "Lab" where `post-notes.md`'s heading is "Lab: the
  burn-rate freshness alert"; both fixed, build passes clean on the next run (238 pages built).
- `node scripts/check-all.mjs --only reels --topic slo-burn-rate-alerting`: "1 live reel(s) at
  desktop and phone sizes" — passed. `test:editor` failed with the same pre-existing,
  already-tracked GitHub-token issue noted in topics 1-2's `REVIEW.md`; unrelated to this topic's
  content.

## Looks review, self-review, 2026-10-30

Reviewed screenshots in `site/test-results/*-slo-burn-rate-alerting-*.png` (phone size, spot-checked
the hook, predict, a three-row reveal step, and recap):

1. No label/value row overlap at phone width, including the three-row layout (step 7, "the
   recommended thresholds").
2. The predict panel (step 2) renders both option cards cleanly, including the longer multi-sentence
   question text above them.
3. The takeaway panel (step 7) renders fully, italic, clearly separated from the body text, with
   the "MORE" affordance and divider intact.
4. Every reviewed step's readout states its point in words on the right-hand rows ("2% in 1 hour" /
   "consumes 1.4%" / "never"), not through brightness alone.
5. No clipped, crowded or under-size text found at phone width in any reviewed frame.

**No independent reviewer ran this review or the content review above — both are self-reviews by
the same session that wrote the topic.**
