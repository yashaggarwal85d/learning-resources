# OUTLINE: Semantic integration: schemas, codes and units (`de.semantic-integration-schemas-codes`)

## Learning outcomes
1. Map two schemas by name, type and instance evidence and write the mapping as a SQL
   transformation.
2. Build a slowly changing crosswalk and join a fact to the correct version.
3. Convert units and currencies with explicit, dated rates and store time as an instant plus a
   zone; add tests that fail when a source introduces an unmapped code.

## Engagement arc
- Hook: step 1 (integer cents plus local time vs. decimals plus UTC, off by a hundred and an
  hour).
- Predict: step 2 (are the two bugs the same fix); step 10 (what happens the moment an unmapped
  code is loaded).
- Takeaways: step 6 (a currency conversion needs both the scale and the dated rate), step 7 (a
  fixed offset fails on exactly the nights that matter), step 9 (recap: meaning is reconciled
  explicitly, like identity).

## Steps (storyboard)

### 1. Hook
- **fig:** integer cents and local Berlin time vs. decimals and UTC; off by a hundred and an
  hour on the clock-change night.

### 2. Predict
- **fig:** does fixing the currency bug also fix the timestamp bug?
- **Options:** (a) one fix for both [wrong]; (b) two separate problems [correct].

### 3. Reveal — matching two schemas by evidence
- **fig:** matched by name, type, sample values; written as a transformation.

### 4. Reveal — a crosswalk joined by event time
- **fig:** a crosswalk's own validity window; a fact joins to the row valid at its own time.

### 5. Reveal — one meaning per unit string
- **fig:** a unit standard maps every string to one checkable meaning.

### 6. Reveal — the currency's own minor-unit exponent
- **fig:** skip the exponent, the conversion is off by exactly that scale.
- **takeaway:** "A currency conversion is correct only once the minor-unit scale and the dated
  rate are both applied."

### 7. Reveal — a UTC instant plus its own zone
- **fig:** zone-aware conversion survives a real DST transition; a fixed offset misses it by an
  hour.
- **takeaway:** "A fixed offset agrees with a real time zone almost every night and fails on
  exactly the nights that matter."

### 8. Reveal — owning the mapping as tested data
- **fig:** a new unmapped code fails a test by name, instead of falling to unknown.

### 9. Recap
- **fig:** all four pieces, side by side.
- **takeaway:** "Meaning is reconciled the same way identity is: explicitly, with a rule and a
  test, not assumed."

### 10. Prove it
- **fig:** a new unmapped code appears — what happens on load?
- **predict options:** (a) silently becomes UNKNOWN [wrong]; (b) the mapping test fails, naming
  the code [correct].

## Post-notes headings
- **Internals:** measured directly against this sandbox's own real PostgreSQL cluster; Rahm and
  Bernstein's own survey is named only, disclosed.
- **Production:** treating integer-cents as decimal; converting local time with a fixed offset
  instead of a real zone.
- **Frontier:** record linkage (skipped topics), the plant/ISA-95 model, time-series time
  handling, data contracts with CI, named only.
- **Where this goes next:** the chapter's own handoff into Chapter 9 (Kafka's internals).

## Concept ledger
- **Introduces:** `semantic-integration-crosswalk`, `unit-currency-timezone-reconciliation`.
- **Uses:** `scd-type-2`, `backdated-fact-scd2-mapping`, `decimal-precision-scale`,
  `timestamp-resolution`, `dbt-tests-data-unit`, `mdm-styles` — all confirmed live.
- **Declared:** none beyond topic 23.

## Changes from the chapter plan
Rahm and Bernstein's own schema-matching survey sits behind a sign-in wall and its own mirror
refused a direct fetch on a certificate mismatch, confirming CHAPTER.md's own plan-time note
that the PDF route returned HTTP 404; its taxonomy is named from secondary summaries rather than
quoted. ISO 4217 is read via Wikipedia since iso.org itself returned HTTP 403.

## Claims list (for fact-check)
1. UCUM's own unambiguous-meaning property — SOURCES.md; named directly in the reveal.
2. ISO 4217's minor-unit concept — SOURCES.md; named directly in the reveal, measured directly
   in examples.py.
3. The IANA time zone database's own contents and its own changing rules — SOURCES.md; named
   directly in the reveal.
4. A real DST transition found by scanning, and a zone-aware versus fixed-offset conversion
   measured directly — examples.py.
5. A slowly changing crosswalk joined by event time, and a mapping test that fails on an
   unmapped code — examples.py.
