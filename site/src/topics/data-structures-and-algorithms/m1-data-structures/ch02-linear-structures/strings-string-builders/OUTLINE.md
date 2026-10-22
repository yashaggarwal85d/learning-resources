# OUTLINE: Strings and string builders (`dsa.strings-string-builders`)

Content plan, written 2026-10-22 against this topic's entry (#6) in [`CHAPTER.md`](../CHAPTER.md).

- **Syllabus line (DSA §2.3, refresher):** "immutability, quadratic repeated concatenation, UTF-8 byte vs code-point indexing costs."
- **Previous topic (live):** "Ring buffers and bounded queues." Its handoff: "Every structure so far has held fixed-size records at known offsets. The next one doesn't: a string's own length, in bytes, isn't the length a person reading it would count."
- **Concepts used, not re-taught:** `dynamic-array-doubling`, `growth-factor`, `amortized-cost`, `aggregate-method`, `contiguous-storage` (all from topic 1, `dsa.dynamic-arrays-growth-policy`).
- **Kind:** refresher, about 6 minutes, 9 steps: open (1), immutability (2), quadratic concatenation (3), predict (4), string builder (5), UTF-8 bytes vs code points (6), predict (7), two real trade-offs (8), prove it (9).
- **Running example:** the chapter's 10,000-line build log — one log line's bytes (for the UTF-8 strip) and the whole log assembled one line at a time (for the concatenation-vs-builder comparison), carried from the dynamic-array topic's own "building a log" framing.

## Learning outcomes

1. Explain why string immutability trades allocation cost for safety and hashability.
2. Explain why naive repeated concatenation is quadratic and why a string builder fixes it, citing topic 1's own result.
3. Say why UTF-8 code-point indexing can't be O(1) for free, and name one real language's trade-off.

## Conventions (chapter grammar, `DESIGN.md` briefing theme)

Colour: `caramel` the structure/mechanism in focus (the builder, the byte-indexed string); `cinnamon` the compared alternative (the naive loop, code-point indexing); `cherry` the one failure frame (the discarded buffers, the Rust panic); `taupe`/`latte` axes and quiet labels; `crema` records/bytes. At most two accents per step.

## Reel steps

### 1. The simplest-looking structure in the chapter (Opening)
Recaps the previous topic's handoff: every structure so far held fixed-size records at known offsets. A string looks like it should be the simplest of all of them — and it hides this chapter's whole toolkit (amortized growth, a reallocation, an indexing cost) inside something that looks like plain text.

### 2. Immutability: every edit is a new string
"Modifying" a string — concatenating, slicing, changing case — allocates a brand-new string and copies into it; the original is untouched. Python's own glossary: immutable objects "cannot be altered... a new object has to be created." What it buys: safe sharing between two references (neither can see an edit the other made, because there are none) and hashability (a dictionary key's hash can't change out from under the table). What it costs: every apparent edit is a full copy.

### 3. The real cost of building one, piece by piece
Building a long string with `s = s + piece` in a loop, k times: each `+` allocates a whole new buffer sized to the string built so far, and copies everything into it. Total cost: 1 + 2 + 3 + ... + k ≈ k²/2 — Θ(k²), the same shape as a dynamic array that reallocates by exactly one element every time instead of doubling. **Takeaway** (≤20 words): "Immutability makes every `+=` in a loop copy the whole string so far — the loop itself, not any one `+`, is quadratic."

### 4. What actually fixes the loop? (predict)
The loop above is quadratic. What's the fix?
- Options: "A smarter immutable string that detects the pattern" / "A bigger initial string so fewer reallocations happen" / **"A separate mutable buffer that the immutable string is built from, once"** (correct) / "There's no way around it — strings are just slow to build".
- Answer: you don't make the immutable string smarter; you stop using it as the thing you mutate. Build in a genuinely mutable buffer, and only convert to an immutable string once, at the end.

### 5. The string builder: topic 1's mechanism, applied here
That mutable buffer is a string builder (Java/C#'s `StringBuilder`, Python's `list` of parts joined once, C++'s `std::string` used with `reserve`/`append`). Its own documentation: "Every string builder has a capacity... If the internal buffer overflows, it is automatically made larger" — exactly topic 1's doubling dynamic array, specialized to bytes. The same aggregate-method argument gives the same bound: O(1) amortized per append, O(k) total for k pieces. **Takeaway** (≤20 words): "A string builder isn't a new idea — it's topic one's growable array, wearing a different name."

### 6. One character, one to four bytes
UTF-8 encodes every Unicode code point as one to four bytes (the Unicode Standard's own FAQ: "a sequence of one to four 8-bit bytes"). ASCII code points take exactly one byte and are byte-identical to ASCII text; most accented letters and non-Latin scripts take two or three; many emoji take four. Visual: the log line's bytes drawn as a row, with a second row of brackets grouping bytes into code points — one multi-byte character sized visibly wider than its neighbours.

### 7. Is indexing the nth character O(1)? (predict)
A UTF-8 string's byte array supports `bytes[i]` in O(1) — it's just array indexing. Does indexing "the nth character" cost the same?
- Options: **"No — it depends on how many earlier characters were multi-byte"** (correct) / "Yes, every language decodes a lookup table at parse time" / "Only if the string is pure ASCII, otherwise it's undefined" / "Yes, because Unicode code points are a fixed width".
- Answer: the byte offset of code point n depends on how many of code points 0..n-1 took more than one byte, and there's no way to know that without walking and decoding them — so it's O(n) in general, unless the structure keeps extra information to avoid the walk.

### 8. Two real languages, two real trade-offs
Go indexes a string by byte directly — `s[i]` is a byte, O(1) — and gives you exactly one code-point-aware traversal, `for range`, which is defined to decode one UTF-8 rune per iteration: an O(n) walk by construction, not a missed optimization. Rust goes further: `str` has no single-integer indexing operator at all (`s[0]` does not compile); byte-range slicing is offered instead, chosen "to be constant-time," and it panics at runtime if a boundary doesn't land on a real character start. Both languages chose O(1) byte access and paid for it by making character-aware access either an explicit walk (Go) or a possible panic (Rust) — the alternative, paying up front for O(1) code-point indexing (a side offset table, or a fixed 4-bytes-per-code-point layout), is also real and used elsewhere, at the cost of memory or UTF-8's compactness. **Takeaway** (≤20 words): "O(1) byte indexing and O(1) character indexing are different promises — no language gets both for free."

### 9. Prove it
`examples.py` builds the same ten-thousand-line log two ways — naive `s = s + line` versus a list-of-parts joined once — and counts bytes copied (not just wall-clock time, which is too noisy for a shape claim): the naive loop's copied-byte total grows quadratically with line count while the builder's grows linearly, matching the Θ(k²) vs Θ(k) prediction. A second check walks a string containing multi-byte UTF-8 characters and times "get the nth byte" against "get the nth code point" as n grows, confirming the first stays flat while the second grows with n.

## Claims list

1. Immutable objects "cannot be altered... a new object has to be created" — Python 3 Glossary, "immutable".
2. Immutability gives thread-safety/safe-sharing and hashability-as-dict-keys — Python 3 Glossary, "immutable".
3. Naive `s = s + piece` repeated k times is Θ(k²) total — derived from the same aggregate-method argument as topic 1, applied to a buffer that grows by exactly the new piece's size each time rather than doubling.
4. A string builder is a mutable, capacity-based buffer that reallocates and grows when it overflows — Java SE 21 `StringBuilder` docs.
5. A string builder gives O(1) amortized append, O(k) total for k pieces — topic 1's own aggregate-method result, applied here, not re-derived.
6. UTF-8 encodes a code point as one to four 8-bit bytes — The Unicode Standard FAQ.
7. Go indexes a string by byte (O(1)) and decodes one UTF-8 rune per `for range` iteration (O(n) to walk code points) — the Go blog, "Strings, bytes, runes and characters in Go".
8. Rust's `str` has no single-integer character index (doesn't compile); byte-range slicing is chosen to be constant-time and panics off a character boundary — Rust `std::string::String` docs.

## Concept ledger

- **Introduces:** `string-immutability`, `quadratic-concatenation`, `string-builder`, `utf8-byte-vs-codepoint`.
- **Uses:** `dynamic-array-doubling`, `growth-factor`, `amortized-cost`, `aggregate-method`, `contiguous-storage`.
- **Declared:** none new.

## Bridge and handoff

- **Bridge:** "Every structure in this chapter has held records whose size you knew in advance. A string looks like it should be the simplest of all of them, and it hides the chapter's whole toolkit — amortized growth, a reallocation, an indexing cost — inside something that looks like plain text."
- **Handoff:** "A string is a sequence of bytes, and so far this chapter has only ever compared them byte by byte or copied them whole. Turning a string, or any key, into a number fast and safely is a mechanism of its own: next, practical hash functions, and the attack a bad one invites."

## Progress

Research done (`SOURCES.md`, 12/12 quotes verified; `coverage.json` → `expert`, 12 items). This content plan written. Next: `FACT-CHECK.md`, `coverage.json` → `syllabus`/`sources`, then build every file.
