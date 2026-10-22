## Content review, self-review, 2026-10-22

- Claims traced to sources: immutability's definition and benefits are quoted word for word from
  Python's own glossary; UTF-8's one-to-four-byte range is quoted from the Unicode Standard's own
  FAQ; Go's byte indexing and rune-decoding range loop are quoted from the Go blog's own worked
  example; Rust's choice to index by byte "to be constant-time," and its panic off a character
  boundary, are quoted from Rust's own `String` documentation; the string builder's capacity/overflow
  mechanism is quoted from Java's own `StringBuilder` documentation. All twelve quotes pass
  `sources.mjs check`.
- A real measurement problem was caught and fixed before shipping, not papered over: the first
  instinct was to demonstrate the quadratic-concatenation claim by timing CPython's own
  `s = s + piece` loop. A quick check (recorded in `FACT-CHECK.md`) showed CPython's own interpreter
  masks this cost for exactly this pattern via an internal, implementation-specific refcount
  optimization — not part of the language, not guaranteed across implementations. `examples.py`
  measures the real shape with a compiled Java program instead, where no such optimization exists:
  naive concatenation's measured time converges on roughly quadrupling each time the input size
  doubles (the final doubling measured 4.89x), while `StringBuilder.append`'s time, measured at
  inputs a hundred times larger, stays close to doubling (ratios 1.84x–2.24x across four doublings).
- The UTF-8 byte-vs-code-point indexing claim has the same kind of honesty check: Python's own `str`
  type is internally fixed-width (PEP 393), so it can't demonstrate an O(n) code-point-indexing cost
  either, for a different, equally real reason. `examples.py` instead hand-walks a raw UTF-8-encoded
  `bytes` object, decoding lead bytes the way Go's `for range` does, and confirms the walk takes
  exactly as many steps as the target code point's index, while byte indexing never needs a decode
  step at any position. The one-to-four-byte claim itself is verified directly by encoding four real
  characters (ASCII, an accented Latin letter, a CJK character, an emoji) and asserting their UTF-8
  byte lengths are exactly one, two, three and four.
- FACT-CHECK.md explicitly declines to claim every language's string type is UTF-8 internally
  (Python's and Java's aren't), declines to claim CPython's `s = s + piece` is always quadratic in
  practice (the claim is about the mechanism, demonstrated on a language without CPython's masking
  optimization), and declines to rank Go's or Rust's trade-off as the "right" one.
- Both syllabus clauses in `coverage.json` (immutability; quadratic repeated concatenation; UTF-8
  byte vs code-point indexing costs) are copied word-for-word from
  `syllabus/data-structures-and-algorithms.md` §2.3, matching the raw syllabus line exactly. Twelve
  expert items were written blind, from the syllabus line and sources alone, before any step was
  planned.
- Narration was written directly in the MIT-professor persona (after topic 4's experience needing a
  rewrite pass) and validated clean on the first try: `narration-teaches.mjs` reports zero to five
  percent description overlap on every one of the nine steps, well under the fifty percent limit, and
  every line is under the fifty-word cap.
- Two predict steps (step 4: what actually fixes the naive concatenation loop; step 7: is indexing
  the nth character O(1)) both have matching `answer` arrays in `narration.json`, and both
  predict-question distractors were red-teamed in `FACT-CHECK.md` against the CPython and PEP 393
  nuances this topic uncovered, rather than left as generic wrong answers.
- Three takeaways (steps 3, 5, 8) satisfy the three-minimum rule for a refresher's engagement arc.

## Looks review, self-review, 2026-10-22

Inspected real screenshots at desktop and phone sizes for all nine steps, plus both predict steps'
pre-answer and answered states. Reel-only Playwright check green at all nine steps, both sizes, after
two rounds of fixes.

- Step 1 (Opening): the row of fixed-size record cells and the uneven-width byte row both render
  cleanly, the contrast between them visible at a glance.
- Step 2 (Immutability): the two-box model (original string vs. the new concatenated object) and the
  buys/costs summary read cleanly at both sizes after a two-line split.
- Step 3 (QuadraticCost): the growing discard pile (cherry, dashed) against the final kept buffer
  (caramel, solid) is legible at both sizes; the takeaway and on-screen summary don't repeat each
  other's wording.
- Step 4 (FixPredict) and its answer state: four answer choices legible at both sizes; the answered
  state's single buffer and caption render cleanly.
- Step 5 (Builder): the growing single buffer and the Java-StringBuilder quote, originally two lines
  overflowing phone width plus one more caption line that ran past the frame's right edge entirely,
  are now split into five short lines — confirmed clean at both sizes.
- Step 6 (Utf8Bytes): the byte row with its bracket groupings, and the one-to-four-bytes caption,
  originally one long line running outside the drawing on phone, are now split and confirmed clean.
- Step 7 (IndexPredict) and its answer state: four choices legible at both sizes; the answered
  state's reasoning renders cleanly.
- Step 8 (TwoTradeoffs): Go's and Rust's two blocks, including Rust's panic warning in cherry, are
  legible and distinct at both sizes without any splitting needed.
- Step 9 (ProveIt): the naive-vs-builder bars and the byte-index-vs-decode-steps caption, originally
  one long line running outside the drawing on phone, are now split and confirmed clean.

Two rounds of fixes made and confirmed this session:
1. First Playwright round: five captions (steps 2, 3, 5, 6, 9) ran outside the drawing on phone,
   each fixed in `scenes.tsx` by splitting into shorter lines with a consistent twenty-two-pixel
   line gap, matching the project's established fix pattern.
2. A sixth caption (step 5's opening line) was not flagged by the automated check but was visibly
   clipped at the phone frame's right edge in the screenshot review — fixed the same way, by splitting
   it into two lines, and reconfirmed green on the next reel-check run.

Final reel check: `Reel smoke test passed: 1 live reel(s) at desktop and phone sizes.`
