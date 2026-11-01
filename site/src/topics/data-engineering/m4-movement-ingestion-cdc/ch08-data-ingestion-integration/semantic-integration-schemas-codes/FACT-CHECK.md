# Fact-check — de.semantic-integration-schemas-codes

## Claims against sources

1. **"The purpose is to facilitate unambiguous electronic communication of quantities together
   with their units."**
   Source: UCUM (SOURCES.md quote 1). Direct match. Named directly in the reveal step "one
   meaning per unit string."

2. **"Every expression in The Unified Code for Units of Measure is mapped to one and only one
   semantic element."**
   Source: UCUM (SOURCES.md quote 2). Direct match. Named directly in the same reveal step.

3. **"provides information about the relationships between currencies and their minor units"**
   Source: Wikipedia, ISO 4217 (SOURCES.md quote 3). Direct match. Named directly in the reveal
   step "the currency's own minor-unit exponent," read via Wikipedia since iso.org itself
   returned HTTP 403 to a direct fetch.

4. **"contains code and data that represent the history of local time for many representative
   locations worldwide"**
   Source: IANA Time Zone Database (SOURCES.md quote 4). Direct match. Named directly in the
   reveal step "a UTC instant plus its own zone."

5. **"is updated periodically to reflect changes made by political bodies to time zone
   boundaries"**
   Source: IANA Time Zone Database (SOURCES.md quote 5). Direct match. Named only, per
   `pre-notes.md` and `post-notes.md`'s Internals section — why a local timestamp needs a
   version of the rules, not just a zone name.

6. **"Converts given time stamp without time zone to time stamp with time zone, assuming the
   given value is in the named time zone."**
   Source: PostgreSQL 18 docs, Date/Time Functions and Operators (SOURCES.md quote 6). Direct
   match. This is the exact operator `examples.py` uses directly to find the real DST transition
   and convert the local wall-clock time correctly across it.

7. **Rahm and Bernstein's own taxonomy (schema-level vs. instance-level, element vs. structure,
   linguistic vs. constraint-based matching).**
   Named only, from secondary summaries, not quoted — the paper itself sits behind a sign-in
   wall and its own mirror refused a direct fetch on a certificate mismatch, confirming
   CHAPTER.md's own plan-time note. Disclosed in `SOURCES.md` and `REVIEW.md`.

## Measured claims (examples.py, against this sandbox's own real PostgreSQL cluster)

- **A slowly changing crosswalk joins each fact to the mapping valid at its own event time.**
  Measured directly: a legacy code's own mapping is re-categorized partway through a window; an
  order placed before the re-categorization gets the old target and one placed after gets the
  new one, via a real point-in-time join.

- **The minor-unit exponent and a dated rate avoid the integer-cents bug.** Measured directly:
  dividing a legacy integer-cents figure by the correct exponent before applying a dated rate
  lands on the same major-unit figure the shop's own decimal-native source already carries;
  skipping that division is measured to be off by exactly a factor of one hundred — the exact
  scale EUR's own two-decimal minor unit implies.

- **A UTC instant plus zone survives a real DST transition a fixed-offset conversion gets
  wrong.** Measured directly: this sandbox's own PostgreSQL finds the real Europe/Berlin
  transition by scanning real `AT TIME ZONE` output (not assuming a date), then confirms a
  zone-aware conversion of a local wall-clock time after the transition lands exactly one hour
  away from a naive fixed-offset conversion, while the two methods agree on a day safely before
  the transition.

- **A mapping test fails the moment an unmapped code appears.** Measured directly: a real
  anti-join query passes with zero orphans against known codes, fails and names the orphan the
  moment a new, unmapped code is inserted, and passes again once the missing crosswalk row is
  added.

## Predict questions red-teamed

- **Step 2** ("are these two bugs the same fix"): the wrong option claims one general
  unit-reconciliation fix resolves both. Checked against the two measured functions directly:
  the currency fix (dividing by a minor-unit exponent) and the timestamp fix (a zone-aware
  conversion) touch entirely disjoint code paths in `examples.py`, with neither function's own
  correction affecting the other's inputs or outputs in any way.

- **Step 10** ("Prove it"): the wrong option claims an unmapped code silently becomes UNKNOWN.
  Checked against the measured mapping-test function directly: the anti-join genuinely fails
  and names the orphan code the moment it is inserted, confirmed by running the same query
  before and after the insert and before and after adding the missing crosswalk row — the test
  catches the gap rather than letting it fall through to a default.

## Scope check against CHAPTER.md / syllabus

The raw syllabus line for this topic splits at its own three semicolons into four clauses:
schema matching and mapping; reference/lookup data and crosswalk tables; reconciling units,
currencies and time zones; and owning the mapping as versioned, tested data. All four are
covered — one reveal step each for the first, second and fourth clauses, and three reveal steps
(units, currency exponent, time zone) for the third. No claim here depends on record linkage,
blocking, clustering, survivorship or golden-record construction (the skipped syllabus topics),
the plant and ISA-95 data model, time-series time handling, or data contracts with CI
enforcement, all named in CHAPTER.md's own "Leaves out" line. This topic's own disclosed access
barriers — Rahm and Bernstein's survey unreachable, and ISO 4217 read via Wikipedia instead of
iso.org — are recorded in `SOURCES.md` and `REVIEW.md` rather than left unexplained.
