# OUTLINE: Raw/bronze landing-layer design (`de.raw-bronze-landing-layer`)

## Learning outcomes
1. Design a raw record envelope with the three source-metadata fields.
2. Rebuild a downstream table by replay and prove it equals the original.
3. Explain what an immutable raw layer costs in storage and in PII risk and name the
   mitigations.

## Engagement arc
- Hook: step 1 (a currency-conversion bug found a year later; the silver table was overwritten
  in place, the raw files were already deleted, and the rebuild arrow points at an empty box).
- Predict: step 2, within the first four steps (whether fixing the bug and rebuilding silver
  from the *same* raw layer is even possible without re-extracting from the live source).
- Takeaways: step 4 (two builds from the identical raw layer land on the identical checksum),
  step 6 (a bug-fixed replay changes only the rows the bug actually touched, nothing else),
  step 9 (keeping raw forever directly works against the storage-limitation duty, and
  tokenizing the one identifying field turns erasure into a one-row deletion that never
  touches the raw strip).
- Recap: step 10. Prove it: step 11 (an erasure request arrives for a tokenized raw layer —
  what has to change, and what must not).

## Steps (storyboard)

### 1. Hook
- **fig:** a bug in last year's currency conversion is found; the silver table was overwritten
  in place months ago, and the raw files that could rebuild it correctly were deleted after
  thirty days of retention. The rebuild arrow points at an empty box.
- **On screen:** an arrow from "raw" to "silver", the raw box empty, the silver box showing a
  number everyone now knows is wrong.

### 2. Predict
- **fig:** the raw layer this topic measures was never deleted. Can fixing the transformation
  and rebuilding silver from *that* raw layer alone reproduce the correct numbers, with no new
  extraction from the live source at all?
- **Options:** (a) yes — the raw layer already holds everything the transformation needs, so a
  replay with the fixed logic is enough [correct]; (b) no — only a fresh extraction from the
  live source can fix historical numbers, because the original mistake happened at extraction
  time [wrong — the mistake was in the *transform*, not the capture; the raw layer's own
  unprocessed records are untouched by a bug that lived downstream of them].

### 3. Reveal — raw capture is append-only, measured
- **fig:** the real run: a correction to an order's amount arrives later, not as an edit to the
  original record, but as a brand-new record with a later offset. The first three records are
  byte-for-byte unmutated.
- **Moves:** a new record appended to the end of the strip, the earlier record's own cells
  staying still.

### 4. Reveal — rebuild by replay, measured
- **fig:** the real run: silver built twice from the identical raw layer, using the identical
  transform, checksummed both times.
- **takeaway:** "Two builds from the identical raw layer land on the identical checksum — the raw layer alone decides silver's contents."

### 5. Reveal — source metadata, the three fields
- **fig:** every raw record stamped with when it arrived, where it came from in the source, and
  which version of the schema it arrived under — the three fields that make a replay possible
  and a defect traceable to its exact input.
- **Narrator's line of thought:** she treats these three fields as the reason a raw record can
  ever be trusted to rebuild anything — strip any one of them out and a replay becomes a guess.

### 6. Reveal — a bug fix, isolated by replay, measured
- **fig:** the real run: the identical raw layer rebuilt once with last year's buggy transform
  and once with the fixed one. Only the rows the bug actually touched differ between the two;
  every other row lands identical in both.
- **takeaway:** "A bug-fixed replay changes only the rows the bug actually touched — proof the fix didn't quietly break something else."

### 7. Reveal — what keeping raw forever costs
- **fig:** an append-only strip that never shrinks, next to the exact legal duty it works
  against: personal data kept no longer than necessary for the purpose it was collected for.
- **Narrator's line of thought:** she names this as a real tension, not a problem with an easy
  default answer — replayability and the storage-limitation duty pull in opposite directions on
  the same raw record.

### 8. Reveal — tokenizing the one field that matters
- **fig:** instead of a customer's email sitting in every raw record that mentions them, a
  token sits there instead, and a small, separate, mutable vault maps the token back to the
  real email. A correction or a deletion happens in that one vault, not in the raw strip.
- **Narrator's line of thought:** she treats the vault as deliberately the only mutable thing in
  the whole design — everything else stays append-only because this one small table absorbed
  the part of the system that legally has to change.

### 9. Reveal — erasure against plaintext versus tokenized raw, measured
- **fig:** the real run: a plaintext raw layer satisfies an erasure request only by mutating
  every historical record that named the person, breaking immutability for all of them at once.
  A tokenized raw layer satisfies the identical request by deleting one row from the vault; the
  raw layer's own checksum does not change at all.
- **takeaway:** "Tokenizing the one identifying field turns an erasure into a one-row deletion that never touches the raw strip at all."

### 10. Recap
- **fig:** the append-only strip, its three metadata fields, the replay that rebuilds silver,
  and the vault that carries the one thing that has to be allowed to change — side by side.

### 11. Prove it
- **fig:** an erasure request arrives for a person whose records sit in a tokenized raw layer.
  What has to change, and what must not?
- **predict options:** (a) the vault's mapping for that person's token is deleted; every raw
  record keeping that token stays exactly as it is [correct]; (b) every raw record naming that
  person is found and has its token field blanked out [wrong — this is exactly the plaintext
  design's own failure mode, reintroduced by hand; the whole point of the token is that raw
  never has to be touched].

## Post-notes headings
- **Internals:** none claimed independently — Chapter 3 topic 19's medallion layers and failure
  modes are the architecture this topic's design sits inside, used and not re-derived; this
  topic's own contribution is the raw layer's envelope and the replay proof.
- **Lab:** none of its own, per `CHAPTER.md` — the rebuild-by-replay check (step 4) and the
  bug-fix-isolation check (step 6) are this topic's own measured examples.
- **Production:** the hook's own scenario (a bug found a year later, the raw files already gone,
  the rebuild arrow pointing at an empty box) as the concrete shape immutable raw capture with
  real retention exists to prevent.
- **Frontier:** none claimed — append-only capture, replay and tokenization are each
  established, long-documented practice.
- **Where this goes next:** everything built so far in this section can be hand-rolled, and
  every part of it is ongoing maintenance. Whether to build it at all, or buy a connector that
  someone else maintains, is the next topic.

## Concept ledger
- **Introduces:** `raw-layer-replay-metadata`.
- **Uses:** `medallion-bronze-silver-gold`, `medallion-failure-modes` (Chapter 3 topic 19),
  `exactly-once-effect-recipe`, `deterministic-batch-id` (topic 6), `object-store-commit-protocols`
  (topic 5) — all confirmed live via the registry-parsing script.
- **Declared:** none beyond topic 6.

## Changes from the chapter plan
None. All five named `uses` ids resolve live in `registry.ts`.

## Claims list (for fact-check)
1. "The Bronze layer is where we land all the data from external source systems." — SOURCES.md
   (Databricks, "What is a Medallion Architecture?").
2. "The data subject shall have the right to obtain from the controller the erasure of personal
   data concerning him or her without undue delay" — SOURCES.md (GDPR Article 17(1)).
3. "kept in a form which permits identification of data subjects for no longer than is necessary
   for the purposes for which the personal data are processed" — SOURCES.md (GDPR Article
   5(1)(e)).
4. A raw record appended as a correction never mutates the earlier record it corrects; the
   current state is derived by replaying the strip, not stored anywhere directly. — measured
   directly in `examples.py`.
5. Two builds of a silver table from the identical raw layer and the identical transform land
   on byte-identical checksums. — measured directly in `examples.py`.
6. Rebuilding with a fixed transform changes only the rows the original bug actually touched,
   leaving every other row identical to the buggy build. — measured directly in `examples.py`.
7. Satisfying an erasure request against a plaintext raw layer requires mutating every historical
   record naming that person; against a tokenized raw layer it requires deleting one row from a
   separate vault, leaving the raw layer's own checksum unchanged. — measured directly in
   `examples.py`.
