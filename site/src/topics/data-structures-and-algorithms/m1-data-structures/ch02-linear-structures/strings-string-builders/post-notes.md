---
id: dsa.strings-string-builders
title: Strings and string builders
---

<section data-section="outcomes">

## After this topic you can

- Explain why string immutability trades allocation cost for safety and hashability: every edit allocates a new object, which is exactly why two references can never observe each other's edits, and why a dictionary key's hash can't change out from under the table.
- Explain why naive repeated concatenation is quadratic and why a string builder fixes it, citing topic 1's own amortized-growth result rather than re-deriving it.
- Say why UTF-8 code-point indexing can't be O(1) for free, and name one real language's trade-off: Go's O(n) rune-decoding walk, or Rust's choice to make byte slicing fast but unsafe.

</section>

<section data-section="internals">

## Into the internals

### Immutability's two real benefits, precisely

Python's own glossary states the mechanism plainly: an immutable object "cannot be altered... a new object has to be created if a different value has to be stored." The two benefits this buys are not the same thing, even though they're often named together. Safe sharing means two references to the same string can never observe a change the other made, because there is no mechanism by which either could change it — this is what makes string interning (two equal strings sharing one copy in memory) safe, where it would be a correctness bug for a mutable type. Hashability as a dictionary key is a separate, stronger requirement: a hash table's own invariant depends on an object's hash never changing after it's inserted, and an immutable string's hash can be computed once and trusted forever, which a mutable string's could not be.

### The quadratic shape, and why Python couldn't demonstrate it

Building a string with `s = s + piece` in a loop costs 1 + 2 + 3 + ... + k byte-copies for k pieces — Θ(k²) — for the same reason a dynamic array that reallocated by exactly one element every time (never doubling) would be quadratic: every step re-copies everything built so far into a freshly allocated, exactly-sized buffer. `FACT-CHECK.md` records a real correction made while building this topic: the first instinct was to measure this in Python, and a quick check showed CPython's own `s = s + 'x'` loop runs close to *linear* time, not quadratic, up to 160,000 iterations. CPython has an internal, implementation-specific optimization — a refcount check that lets it resize the left operand's buffer in place when nothing else holds a reference to it — that masks the quadratic cost for exactly this common pattern. That optimization is not part of the Python language and isn't guaranteed across Python versions or other implementations (PyPy, Jython don't have it). `examples.py` measures the real shape with compiled Java instead, where no such optimization exists: naive concatenation's time roughly quadruples each time the input size doubles, converging on the predicted ratio, while `StringBuilder.append`'s time only roughly doubles — even at inputs a hundred to a thousand times larger.

### Byte vs code-point indexing, and why Python's own `str` can't demonstrate that either

A UTF-8 code point takes one to four bytes (the Unicode Standard's own FAQ states the range directly), so the byte offset of logical character *n* depends on how many of characters 0 through *n* − 1 happened to be multi-byte — information that isn't available without walking and decoding them. Go makes this visible by construction: indexing a string with `s[i]` returns a byte in O(1), and the language's only code-point-aware traversal, `for range`, is explicitly defined to decode one UTF-8 rune per iteration, which the Go blog's own worked example shows directly (each rune's starting byte position, printed alongside the rune itself). Rust takes the trade-off further still: `str` offers no single-integer character index at all — `s[0]` simply does not compile — and byte-range slicing, which the documentation says was chosen specifically "to be constant-time," panics at runtime if either boundary doesn't land on a real character start. `examples.py` can't demonstrate this O(n) cost on a Python `str` either, for a different, equally real reason: CPython's internal string representation (PEP 393's "flexible" representation) is fixed-width per string, so code-point indexing on a Python `str` is already O(1) — it just isn't a UTF-8 byte buffer internally. The demonstration instead hand-walks a raw UTF-8-encoded `bytes` object, decoding lead bytes exactly the way Go's `for range` does, to show the real cost on the structure the claim is actually about.

</section>

<section data-section="production">

## In production

The two languages' choices are not interchangeable advice. Code written assuming Go's byte-indexing semantics will silently produce the wrong substring if it slices by what it thinks is a character count; code written assuming Rust's semantics will panic — loudly, at the exact moment it slices across a character boundary it didn't know was there — rather than producing a subtly wrong result. Neither failure mode is "better" in the abstract; a system that must never crash on untrusted input (and can tolerate occasionally-wrong display) leans toward Go's shape, and a system that would rather fail loudly than silently corrupt data leans toward Rust's.

</section>

<section data-section="frontier">

## The frontier

What a person casually calls "one character" can itself be a grapheme cluster spanning several code points — an emoji combined with a skin-tone modifier, or a base letter combined with a separate combining accent mark. Getting *that* right (so that deleting "one character" a user sees actually deletes the whole cluster) is a real, substantially harder problem than anything this topic built, and is named here only, with no mechanism taught.

</section>

<section data-section="questions">

## More questions

- If a UTF-8 byte buffer stores one to four bytes per code point, what exactly goes wrong if you slice it at a byte offset that happens to land in the middle of a multi-byte code point?
- Python's `str` type gives O(1) code-point indexing internally. What does that cost it, compared to a UTF-8 byte buffer, that this topic's trade-off framing (memory for an offset table, or a fixed-width layout) would predict?

</section>

<section data-section="next">

## Where this goes next

A string is a sequence of bytes, and so far this chapter has only ever compared them byte by byte or copied them whole. Turning a string, or any key, into a number fast and safely is a mechanism of its own: next, practical hash functions, and the attack a bad one invites.

</section>
