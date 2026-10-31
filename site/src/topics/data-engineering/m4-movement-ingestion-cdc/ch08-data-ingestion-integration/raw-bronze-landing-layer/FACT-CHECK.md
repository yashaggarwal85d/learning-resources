# Fact-check — de.raw-bronze-landing-layer

## Claims against sources

1. **"The Bronze layer is where we land all the data from external source systems."**
   Source: Databricks, "What is a Medallion Architecture?" (SOURCES.md quote 1). Direct match.
   Used only to name the real-world term ("bronze") for the layer this topic's own raw layer
   implements; this topic's own contribution (append-only capture, the three metadata fields,
   replay) is not claimed as Databricks' own design, only as an instance that matches the
   definition.

2. **"The data subject shall have the right to obtain from the controller the erasure of
   personal data concerning him or her without undue delay."**
   Source: GDPR Article 17(1) (SOURCES.md quote 2). Direct match. Used to state the exact legal
   obligation the erasure measurements (steps 9 and 11) answer — not to claim legal advice or a
   complete reading of Article 17's six grounds, only the opening right itself.

3. **"kept in a form which permits identification of data subjects for no longer than is
   necessary for the purposes for which the personal data are processed."**
   Source: GDPR Article 5(1)(e) (SOURCES.md quote 3). Direct match. Used to state the exact duty
   that keeping raw data forever for replayability works against (step 7); the topic does not
   claim to resolve this tension generally, only to name it and show one mitigation.

4. **"A raw record appended as a correction never mutates the earlier record it corrects; the
   current state is derived by replaying the strip, not stored anywhere directly."**
   Measured directly: `raw_capture_is_append_only` appends a correction to `o2` as a fourth
   record; the first three records, re-serialized, are byte-identical to before the correction
   landed; the corrected amount is only visible by replaying all records and taking the
   last-offset-wins value per order id.

5. **"Two builds of a silver table from the identical raw layer and the identical transform land
   on byte-identical checksums."**
   Measured directly: `rebuild_by_replay_is_deterministic` builds the same silver table twice
   from one raw layer with the fixed transform and checksums both; the checksums match exactly.

6. **"Rebuilding with a fixed transform changes only the rows the original bug actually touched,
   leaving every other row identical to the buggy build."**
   Measured directly: `rebuild_with_bug_fix_isolates_the_change` builds silver once with a
   buggy currency transform (ignores the exchange rate entirely) and once with the fixed one;
   only the non-USD orders (`o2`, `o3`) differ between the two builds, while the USD orders
   (`o1`, `o4`) are identical in both, since the bug and the fix agree whenever the rate is 1.0.

7. **"Satisfying an erasure request against a plaintext raw layer requires mutating every
   historical record naming that person; against a tokenized raw layer it requires deleting one
   row from a separate vault, leaving the raw layer's own checksum unchanged."**
   Measured directly: `erasure_against_plaintext_raw_breaks_immutability` finds and mutates
   three historical records naming the target email; `erasure_against_tokenized_raw_preserves_immutability`
   deletes one vault entry and confirms the raw layer's own checksum is identical before and
   after, while the token no longer resolves to an email.

## Predict questions red-teamed

- **Step 2** ("can a replay from the existing raw layer alone fix the bug, with no new
  extraction"): the wrong option claims only a fresh extraction from the live source can fix
  historical numbers, reasoning that the mistake happened at extraction time. Checked against
  the measurement: the buggy and fixed transforms in `examples.py` both read the identical raw
  records (`amount`, `currency`); the only difference is the transform function applied during
  replay. The bug was never in what was captured, only in how it was later interpreted — which
  is exactly what `rebuild_with_bug_fix_isolates_the_change` demonstrates.

- **Step 11** ("what has to change, what must not, for an erasure against a tokenized raw
  layer"): the wrong option reintroduces the plaintext design's own failure by hand (finding and
  blanking every raw record's token field). Checked against the measurement: that is precisely
  what `erasure_against_plaintext_raw_breaks_immutability` shows is unnecessary once tokenization
  is in place — `erasure_against_tokenized_raw_preserves_immutability`'s own checksum comparison
  is the direct proof that the raw strip itself never needs to be touched.

## Scope check against CHAPTER.md / syllabus

The raw syllabus line (`syllabus/data-engineering.md` §8.1) names four clauses: immutable
append-only raw capture; source metadata (ingest time, source offset, schema version); rebuild
by replay; retention and PII implications of keeping raw. All four are covered by direct
measurement in this topic, matching `coverage.json`'s breakdown. No claim here depends on
Chapter 6's table-format snapshots/time travel or Chapter 13's erasure mechanics — both are
named in post-notes as adjacent, more detailed treatments and left untaught here.
