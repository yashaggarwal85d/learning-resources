# Review — de.pseudonymisation-vs-anonymisation

## Content review, self-review, 2026-10-30

1. **One cross-chapter `uses` id `CHAPTER.md` cites doesn't resolve.** Chapter 10 §10.5 (EU
   regulatory architecture) is unresolvable because Chapter 10 is unbuilt beyond its own
   `CHAPTER.md` (confirmed: no topic folders under `ch10-cloud-data-architecture`), consistent
   with topics 4 and 5's own finding of the same gap. **Fixed** by declaring it rather than
   guessing, logged in `OUTLINE.md` → "Changes from the chapter plan" and again in
   `post-notes.md`'s "Frontier."
2. **Gap hunt against the syllabus line:** all five clauses (the legal line, the CJEU's relative
   approach, the pending Digital Omnibus, keyed vs plain hashing, linkage attacks) mapped in
   `coverage.json`; no clause left unmapped. The initial coverage draft split the syllabus line
   into five separate clauses that didn't each appear as a literal substring of the syllabus
   line's own text (the build's coverage checker requires a word-for-word copy, including the
   syllabus markdown's non-breaking hyphen in "EDPS v SRB (C‑413/23 P..."); fixed by copying three
   clauses verbatim from the cleaned syllabus line instead of paraphrasing clause boundaries. The
   expert list also needed a tenth item to meet the build's ten-item minimum.
3. **Flow check:** `status: 'held'`, so `checkFlow` skips this topic. Coverage and topic-file
   checks both pass.
4. **Expert reader pass:** the CJEU reveal (step 6) and the Digital Omnibus reveal (step 8) are
   tested from two different angles rather than repeating the same claim — one is a decided
   judgment with a stated caveat about which regulation it was decided under, the other is an
   undecided proposal with a stated date and status, and the topic is explicit that the second
   does not inherit the first's authority.
5. **Engagement:** hook and predict both on steps 1–2 (within the first four); a second predict
   at step 11 ("Prove it") requires applying the dictionary-attack-versus-linkage-attack
   distinction to a new scenario (key destroyed, quasi-identifiers intact) rather than recalling
   an earlier claim directly; three takeaways at steps 7, 8, 9 (all after the reel's own midpoint
   of step 6), checked at sixteen, fourteen and eighteen words via a Python word-count pass before
   the build ran; recap at step 10.
6. **Narration teaches, not reads:** clean on the first `narration-teaches.mjs` run. Legal
   citations (the case number, the regulation number, the article number) were deliberately never
   spoken as such — paraphrased as "a case that went through Europe's highest court" and "a
   proposal working its way through Europe's lawmaking process" — consistent with `CHAPTER.md`'s
   own "Spoken numbers" rule that a case or article number is said as words, not read as a code.
7. **Numbers checked against `examples.py`:** nine of ten known emails recovered by the plain-hash
   dictionary attack, zero recovered against HMAC without the key, roughly two in three rows
   uniquely re-identified by the linkage attack with the pseudonymisation key never used — every
   number in `reel.tsx` prose is spelled out as a word and traces to an asserted value.

### Checks run

- `node scripts/sources.mjs check pseudonymisation-vs-anonymisation`: 21 quotes found word for
  word, 0 problems — three fixes needed first: three GDPR citations against `eur-lex.europa.eu`
  (JS-rendered, 0 usable characters) were switched to `gdpr-info.eu`'s plain-text pages; an
  elided quote ("...") in the EDPB guidelines citation was split into two separate exact quotes;
  one Joint Opinion quote's trailing clause was trimmed to stop before a footnote-number artifact
  in the PDF extraction.
- `python3 examples.py`: all asserts pass (three functions built on real `hashlib`/`hmac`
  primitives over synthetic candidate lists, never real personal data), clean on first run.
- `node scripts/narration-teaches.mjs`: clean on first run, no fixes needed.
- `node scripts/check-all.mjs` (via `npm run build`): two fixes during the build — the coverage
  clause-wording mismatch and the expert-list item count, both above; clean on the rebuild, 238
  pages built.
- `node scripts/check-all.mjs --only reels --topic pseudonymisation-vs-anonymisation`: "1 live
  reel(s) at desktop and phone sizes" — passed. `test:editor` failed with the same pre-existing,
  already-tracked sandbox limitation noted in topics 1-5's `REVIEW.md` (a Playwright popup-page
  event that never fires in this container, unrelated to this topic's content).

## Looks review, self-review, 2026-10-30

Reviewed screenshots in `site/test-results/phone-pseudonymisation-vs-anonymisation-*.png` (phone
size, spot-checked the predict frame, the controller's-duty reveal, the linkage-attack reveal and
the "Prove it" frame):

1. No label/value row overlap at phone width in any reviewed frame.
2. Both predict panels (steps 2 and 11) render their option cards cleanly alongside multi-sentence
   body text and the explain block's first line.
3. The three takeaway panels render fully, italic, clearly separated from the body text.
4. Every reviewed step's readout states its point in words on the right-hand rows ("stops the
   attack" / "matched, no key" / "no excuse" / "destroyed"), not through brightness alone.
5. No clipped, crowded or under-size text found at phone width in any reviewed frame.

**No independent reviewer ran this review or the content review above — both are self-reviews by
the same session that wrote the topic.**
