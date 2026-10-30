# Review — de.envelope-encryption-kms-key

## Content review, self-review, 2026-10-30

1. **Four cross-chapter `uses` ids `CHAPTER.md` cites don't resolve.** Chapter 10 §10.2 (cloud
   KMS mechanics) and §10.5 (EU key-residency) are unresolvable because Chapter 10 is unbuilt
   beyond its own `CHAPTER.md` (confirmed: no topic folders under `ch10-cloud-data-architecture`).
   Chapter 6's table-format files are unresolvable because Chapter 6 has only one topic built
   (`de.text-interchange-formats-their`), which introduces no Iceberg/Parquet/manifest-level id
   (confirmed by checking its `registry.ts` entry). `cryptographic-hash` is a different track (DSA),
   not a cross-track `uses`. **Fixed** by declaring all four rather than guessing, logged in
   `OUTLINE.md` → "Changes from the chapter plan" and named again in `post-notes.md`'s "Frontier."
2. **Gap hunt against the syllabus line:** all six clauses (DEK/KEK hierarchy, rotation vs
   compromise, customer-managed/BYOK/external, TLS/mTLS, client- vs server-side, crypto-shredding)
   mapped in `coverage.json`; no clause left unmapped. One coverage-checker mismatch caught during
   the build: an expert item's `quote` field cited words ("a sensitivity tier") not literally
   present in topic 4's syllabus clause text; fixed to quote "classification schemes," which is.
3. **Flow check:** `status: 'held'`, so `checkFlow` skips this topic. Coverage and topic-file
   checks both pass.
4. **Expert reader pass:** the rotation-versus-compromise reveal (step 4) and the "Prove it" step
   both hinge on the same AWS-documented distinction (rotation ≠ a fix for a leaked key), tested
   from two different angles — a direct statement, then an applied scenario with a twist (two
   rotations since the leak) — rather than repeating the same framing twice.
5. **Engagement:** hook and predict both on steps 1-2 (within the first four); a second predict
   at step 10 ("Prove it") requires applying the rotation-vs-compromise distinction to a new
   scenario rather than recalling the step 4 claim directly; three takeaways at steps 4, 6, 8 (all
   after the reel's own midpoint of step 5), checked at 13, 15 and 13 words via a Python
   word-count pass before the build ran; recap at step 9.
6. **Narration teaches, not reads:** clean on the first `narration-teaches.mjs` run — jargon terms
   (DEK, KEK, KMS, TLS) were deliberately paraphrased in prose ("the first key," "the key
   management service," "a secure connection") rather than spoken as abbreviations, both to avoid
   the code-name/unspeakable-line checks that caught problems in topics 3 and 4's drafts and
   because an MIT-professor narrator explaining a diagram out loud would say it that way anyway.
7. **Numbers checked against `examples.py`:** zero data blocks touched by rotation, fifty
   blocks forced to re-encrypt after a compromise, one in ten blocks (five of fifty) left
   unreadable after one customer's key deletion with every other customer's blocks fully intact —
   every number in `reel.tsx` prose is spelled out as a word and traces to an asserted value.

### Checks run

- `node scripts/sources.mjs check`: 15 quotes found word for word, 0 problems — three quotes
  (an AWS external-key-store definition, a Google Cloud EKM definition, and two AWS rotation/
  deletion quotes) were initially written from memory and didn't match the cached source text on
  the first check; all four replaced with the sources' own actual sentences.
- `python3 examples.py`: all asserts pass (a toy XOR-based key store, 5 functions, 1 `main`),
  clean on first run.
- `node scripts/narration-teaches.mjs`: clean on first run, no fixes needed.
- `node scripts/check-all.mjs` (via `npm run build`): 1 fix during the build — the coverage quote
  mismatch above; clean on the rebuild, 238 pages built.
- `node scripts/check-all.mjs --only reels --topic envelope-encryption-kms-key`: "1 live reel(s)
  at desktop and phone sizes" — passed. `test:editor` failed with the same pre-existing,
  already-tracked GitHub-token issue noted in topics 1-4's `REVIEW.md`; unrelated to this topic's
  content.

## Looks review, self-review, 2026-10-30

Reviewed screenshots in `site/test-results/*-envelope-encryption-kms-key-*.png` (phone size,
spot-checked the predict frame, the four-row control-scale reveal, and the three-row reveals):

1. No label/value row overlap at phone width, including the four-row layout (step 5,
   "customer-managed, BYOK, external").
2. The predict panel (step 2) renders both option cards cleanly alongside the multi-sentence
   body text and the explain block's first line.
3. The takeaway panels render fully, italic, clearly separated from the body text.
4. Every reviewed step's readout states its point in words on the right-hand rows ("least
   control" / "most risk too" / "imported key"), not through brightness alone.
5. No clipped, crowded or under-size text found at phone width in any reviewed frame.

**No independent reviewer ran this review or the content review above — both are self-reviews by
the same session that wrote the topic.**
