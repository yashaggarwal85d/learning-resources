# FACT-CHECK: Strings and string builders (`dsa.strings-string-builders`)

Adversarial pass, 2026-10-22, re-deriving every claim in `OUTLINE.md` → "Claims list" from the fetched
source texts in `sources/`, and red-teaming each predict question.

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Immutable objects "cannot be altered... a new object has to be created." | Confirmed | `sources/python-glossary.txt`, Glossary "immutable" entry, word for word in `SOURCES.md`. |
| 2 | Immutability gives thread-safety (safe sharing) and hashability as a dict key. | Confirmed | Same entry: "inherently thread-safe because their state cannot be modified after creation"; "a constant hash value is needed, for example as a key in a dictionary." |
| 3 | Naive `s = s + piece` repeated k times is Θ(k²) total. | Confirmed, with a real-measurement correction — see below | Re-derived from the aggregate-method argument (topic 1), then verified by a real, compiled-and-run Java microbenchmark, not a Python one. |
| 4 | A string builder is a mutable, capacity-based buffer that grows when it overflows. | Confirmed | `sources/java-stringbuilder.txt`: "Every string builder has a capacity... If the internal buffer overflows, it is automatically made larger." |
| 5 | A string builder gives O(1) amortized append, O(k) total for k pieces. | Confirmed (reused from topic 1, not re-derived) | Same doubling-capacity mechanism and aggregate-method proof as `dsa.dynamic-arrays-growth-policy`; this topic states explicitly it is applying that result, not re-proving it. |
| 6 | UTF-8 encodes a code point as one to four 8-bit bytes. | Confirmed | `sources/unicode-utf8-faq.txt`: "a sequence of one to four 8-bit bytes." Directly re-verified by encoding four real characters in `examples.py` (see below). |
| 7 | Go indexes a string by byte (O(1)); `for range` decodes one UTF-8 rune per iteration (O(n) to walk). | Confirmed | `sources/go-blog-strings.txt`: "indexing a string accesses individual bytes, not characters"; "A for range loop, by contrast, decodes one UTF-8-encoded rune on each iteration." |
| 8 | Rust's `str` has no single-integer character index (code doesn't compile); byte-range slicing is chosen to be constant-time and panics off a character boundary. | Confirmed | `sources/rust-string-docs.txt`: the `s[0]` "will not compile" example; "It should accept byte indices (to be constant-time)... this will panic if the byte indices provided are not character boundaries." |

## The one real correction this pass made: claim 3's demonstration language

The plan's first instinct was to demonstrate Θ(k²) by timing CPython's own `s = s + piece` in a loop.
**That would have been wrong to ship.** A quick executed check (not in `examples.py`, run only to test
the plan) showed CPython's wall-clock time for `s = s + 'x'` in a loop of up to 160,000 iterations
stays close to *linear*, not quadratic — doubling the iteration count roughly doubles the time, not
quadruples it. CPython has an internal, implementation-specific optimization (a refcount check that
lets it resize the left-hand string's buffer in place when nothing else holds a reference to it) that
can mask the quadratic cost for exactly this common pattern. That optimization is **not part of the
Python language**, is not guaranteed across Python versions, and does not exist in other
implementations (PyPy, Jython) — but it means Python's own interpreter is the wrong tool to *measure*
this claim, even though the claim itself (true for an immutable string in general, and true of
languages without CPython's specific trick) is correct.

**Fix:** `examples.py` measures the claim with a real, compiled Java program instead (`subprocess` +
`javac`/`java`, mirroring the C-microbenchmark pattern `dsa.ring-buffers-bounded-queues` used for its
own cost claim). Java's `String` has no such optimization — `s = s + piece` always allocates — so the
measured growth is the real thing, not an artifact of one interpreter's internal tuning. This is also
why the CHAPTER.md-named real example for the mutable-buffer side is Java's `StringBuilder`, not a
Python list-join trick: the Java measurement and the Java source citation are the same real system.
This CPython nuance itself is not claimed on screen or in narration (it would be a tangent the syllabus
line doesn't ask for); it is recorded here so a future reviewer knows why the benchmark isn't Python.

## Red-teaming the predict questions

**Step 4 ("What actually fixes the loop?"):** the tempting wrong option "a bigger initial string so
fewer reallocations happen" needed checking against the CPython nuance above — could pre-sizing an
*immutable* string actually work, the way `reserve()` works for a mutable buffer? No: an immutable
string, by definition, cannot be filled in place after creation at all; "pre-size it" isn't an
operation immutable strings offer in any of the languages checked. The option stays wrong for the
right reason: it's not that pre-sizing is inferior, it's that it's not available for an immutable
string in the first place. The narration states this distinction explicitly rather than leaving it
implicit.

**Step 7 ("Is indexing the nth character O(1)?"):** checked the tempting option "Yes, because Unicode
code points are a fixed width" against the UTF-8 FAQ's own one-to-four-byte range (confirmed false —
UTF-8 is explicitly variable-width) and against CPython's own internal representation, which **is**
fixed-width per string (PEP 393's flexible representation stores each string at a single width wide
enough for its widest code point) — meaning Python's own `str` type gives O(1) code-point indexing
internally, unlike a UTF-8 byte buffer. This is exactly why `examples.py`'s UTF-8 indexing demonstration
operates on an explicit UTF-8-encoded `bytes` object and a hand-written decode walk, not on a Python
`str` — using `str` directly would (correctly, for Python's own internal representation) fail to show
any O(n) cost at all, for a reason that has nothing to do with the syllabus claim being wrong.

## Claims not made

- No claim that every language's string type is UTF-8-encoded internally (Python's `str` and Java's
  `String`, as of JDK 9's compact strings, are not; this topic's UTF-8 claims are scoped to languages
  and byte buffers that are explicitly UTF-8).
- No claim that CPython's `s = s + piece` is always quadratic in practice — the measured claim is
  about the mechanism (immutable strings require full-copy concatenation) and is demonstrated on a
  language without CPython's masking optimization, not asserted of CPython specifically.
- No ranking of Go's or Rust's trade-off as the "right" one; both are presented as real, shipped,
  opposite choices.
