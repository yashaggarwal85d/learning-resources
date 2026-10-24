---
title: "Parsers as security boundaries"
---

## Outcomes

- Measure that a naive parser's own unchecked slice genuinely panics on a declared length claiming more bytes than the real buffer holds, while a checked parser rejects the identical input cleanly, with no panic.
- Measure that a declared length genuinely fitting the real buffer, but exceeding this format's own stated maximum payload size, is accepted by the naive parser and rejected by the checked parser.
- Measure that a real 32-bit addition of two attacker-influenced lengths that genuinely overflows wraps silently to a small number when done with plain arithmetic, and is correctly detected when done with `checked_add`.
- State, from the Rust standard library's own `checked_add` documentation and Cargo's own reference on `overflow-checks`, the real mechanisms this topic's own two comparisons measure directly.

## Internals

Real, structure-aware fuzzing with `cargo-fuzz` or `arbitrary`, the syllabus's own named tooling, would discover inputs like this topic's own two hand-crafted ones (and many more) automatically, across a much larger real input space; this topic measures two specific, deliberately chosen malformed inputs directly, by hand, to keep its own crate's dependency list to exactly what its three measured claims need, rather than pull in a fuzzing harness for two fixed, known cases.

## In production

A real nesting-depth policy, the syllabus's own other named limit alongside maximum size, applies to a format that can recursively contain records of its own kind (a length-prefixed list of length-prefixed records, say); this topic's own flat record format, one tag, one length, one payload, has no real nesting to bound, so this topic measures only the size policy directly.

## The frontier

Real, duplicated and inconsistent fields, in a richer record format (two conflicting length fields describing the same payload, or a checksum that doesn't match its own payload), are each a real, additional kind of malformed input the syllabus names alongside the two kinds this topic measures directly, truncated and oversized.

## Where this goes next

A boundary that checks a real length before trusting it catches a real, adversarial input at the exact moment it arrives; the next real question is whether the code trusted to run at all, the dependencies nobody wrote by hand, is actually trustworthy in the first place.
