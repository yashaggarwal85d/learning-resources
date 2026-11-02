# Review — de.pseudonymisation-vs-anonymisation

## Content review, self-review, 2026-11-01

1. **EUR-Lex/InfoCuria sources unfetchable in this sandbox.** Both serve JavaScript-rendered
   pages here (0 characters of text). Substituted `gdpr-info.eu` for the GDPR articles/recital
   (clean fetch) and the CJEU's own official press release PDF for the judgment, which
   `CHAPTER.md`'s own wording explicitly permits ("the Court's press release is the official
   summary").
2. **CHAPTER.md's cited Digital Omnibus EUR-Lex number appears wrong.** CHAPTER.md says
   "EUR-Lex 52025PC0837"; the EDPB-EDPS Joint Opinion 2/2026 (a primary source, fetched directly)
   consistently cites the proposal in its own footnotes as "COM(2025) 836 final." Used the
   primary document's own number, documented the discrepancy in `SOURCES.md`'s "Note on source
   naming" rather than silently picking either number.
3. **The judgment's actual outcome is mixed, not a clean confirmation.** The CJEU set aside the
   General Court's ruling overall (on a separate point about personal opinions "relate to" their
   author) while specifically confirming the relative-identifiability reasoning this topic
   teaches. Documented explicitly in `SOURCES.md` and `FACT-CHECK.md`; the reel itself presents
   only the confirmed holding, never the case's outcome as a whole.
4. **Gap hunt against the syllabus line:** the single clause (relative identifiability, EDPS v
   SRB, Digital Omnibus, keyed vs plain hashing, linkage attacks) is fully mapped across all 10
   reel steps in `coverage.json`; no part of the clause left unmapped.
5. **Two quotes failed `sources.mjs check` on the first pass** — both from the EDPB-EDPS Joint
   Opinion, spanning across mid-sentence footnote-reference numbers. Fixed by truncating each
   quote to end immediately before the footnote marker. Re-ran: 16 quotes, 0 problems.
6. **Flow check:** `status: 'held'`, so `checkFlow` skips this topic.
7. **Engagement:** hook at step 1; predicts at steps 3 and 6 (both within or just past the
   reel's first half, each followed by its own reveal); three takeaways at steps 5, 8 and 10
   (Recap), each checked under 20 words by hand (18, 17, 19).
8. **Narration teaches, not reads:** rewrote every line as the professor's own framing (why this
   matters, what the measurement actually shows) rather than restating `reel.tsx`'s body
   sentences — the exact failure mode caught on an earlier, unrelated topic this session
   ("50% of its narration is the description word for word"). No raw digits in any narration
   line; all counts ("most of the table," "a real, measurable fraction") paraphrased from the
   reel's own prose, never stated as a number.
9. **`declared` placeholders:** `keyed-hash`, `cryptographic-hash` and
   `eu-regulatory-residency-architecture` follow the already-shipped repo convention (seen in
   `de.data-classification-sensitive-data` and `de.envelope-encryption-kms-key`) for a
   cross-chapter concept with no single resolvable `introduces` id, rather than inventing a false
   match.

### Checks run

- `node scripts/sources.mjs check`: 16 quotes found word for word, 0 problems (after the
  footnote-marker fix above).
- `python3 examples.py`: all three claims verified, confirmed robust across reseeding.
- `node scripts/check-all.mjs --topic .../pseudonymisation-vs-anonymisation --only build`: pass.
- `node scripts/check-all.mjs --topic .../pseudonymisation-vs-anonymisation --skip reels,links`:
  locked, docs, sources, build, narration all pass.
- `PREVIEW_HELD=1 npx astro build`: 466 pages built, clean.
- `PREVIEW_HELD=1 node tests/reels.mjs http://localhost:4321/learning-resources/
  pseudonymisation-vs-anonymisation`: "Reel smoke test passed: 1 live reel(s) at desktop and
  phone sizes."

## Looks review, self-review, 2026-11-01

Reel smoke test covered both desktop and phone sizes for all 10 steps, including the two predict
panels (steps 3 and 6) and the four-row Recap scene, with no overflow or swipe-caption failures.
Row label/value pairs in `scenes.tsx` kept to 1-3 words each throughout.

**No independent reviewer ran this review or the content review above — both are self-reviews by
the same session that wrote the topic.**
