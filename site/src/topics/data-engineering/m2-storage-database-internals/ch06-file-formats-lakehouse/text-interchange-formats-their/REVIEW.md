# Review — de.text-interchange-formats-their

## Content review, self-review

- Claims checked against FACT-CHECK.md's 13-row table; all verified against
  the fetched, cached source text in `sources/` (RFC 4180, RFC 8259, the
  Unicode BOM FAQ, jsonlines.org).
- One genuine correction made during fact-check: the original draft
  overstated RFC 8259's BOM/UTF-8 rules. The actual text (§8.1) requires
  UTF-8 outside a closed ecosystem, forbids a writer from adding a BOM, and
  only *permits* (does not require) a reader to tolerate one. SOURCES.md,
  OUTLINE.md and FACT-CHECK.md were corrected to state this precisely.
- Five claims (numbers) sourced from `examples.py`'s real asserts, which all
  pass (`python3 examples.py`): the 4-vs-3-field naive split, the
  backslash-vs-doubled-quote escape, the 3-vs-2-record embedded newline, the
  9,007,199,254,740,993 → 9,007,199,254,740,992 precision loss, and the
  BOM-prefixed JSON parse failure.
- No problem-solving example in this topic (refresher kind); documented as
  "None" in FACT-CHECK.md.

## Looks review, self-review

Viewed all 16 screenshots in `site/test-results/` (8 steps × desktop and
phone) plus the phone predict-question frame (`-02-q.png`). Judged against
DESIGN.md's looks-review checks (point visible at a glance, no crowded or
clipped text, caption matches picture).

- All 8 steps read cleanly at both sizes: no overlapping or clipped text, no
  orphaned labels, generous spacing throughout.
- Step 2 (predict) at phone size shows the two answer options and the
  "not quite" explainer without crowding; the `02-q.png` frame (before an
  answer is picked) also renders cleanly.
- Two bug fixes already applied and re-verified before this review round
  (see FACT-CHECK/OUTLINE history): `TallRow` introduced and applied to
  steps 5 (surprising number), 7 (no types, no schema) and 8 (recap) to fix
  phone-width overlap on long label/value pairs — confirmed fixed in the
  current screenshots.
- No further issues found. `tests/reels.mjs` (Playwright smoke test) passes
  for this topic at both sizes.
