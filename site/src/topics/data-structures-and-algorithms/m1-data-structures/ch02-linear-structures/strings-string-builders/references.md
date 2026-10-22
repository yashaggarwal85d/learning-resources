Last verified: 2026-10-22. Expert sign-off: pending.

- The Unicode Standard FAQ, "UTF-8, UTF-16, UTF-32 & BOM" — the one-to-four-byte range of UTF-8. [source](https://www.unicode.org/faq/utf_bom.html)
- Python 3 documentation, Glossary — "immutable" — the immutability definition this topic quotes in full. [source](https://docs.python.org/3/glossary.html)
- The Go Programming Language blog, "Strings, bytes, runes and characters in Go" — byte indexing and the rune-decoding range loop. [source](https://go.dev/blog/strings)
- Rust standard library documentation, `std::string::String` — why `str` has no character index, and why byte slicing panics off a boundary. [source](https://doc.rust-lang.org/std/string/struct.String.html)
- Java SE 21 API documentation, `java.lang.StringBuilder` — the capacity/overflow mechanism named as the real string builder. [source](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/StringBuilder.html)

Canonical numbers (the naive-concatenation-vs-string-builder timing ratios, the UTF-8 byte lengths for
one-, two-, three- and four-byte code points, and the decode-walk step counts) are computed and
asserted in this topic's `examples.py`, via a real compiled Java benchmark — see `FACT-CHECK.md` for
why Python's own interpreter is the wrong tool to measure the concatenation claim.

Related tracks (see Prerequisites): this chapter's "Dynamic arrays and growth policy" (the amortized
result this topic applies rather than re-derives).

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=strings-string-builders:%20).
