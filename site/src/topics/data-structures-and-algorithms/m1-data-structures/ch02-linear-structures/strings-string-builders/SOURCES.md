## The Unicode Standard FAQ, "UTF-8, UTF-16, UTF-32 & BOM"

URL: https://www.unicode.org/faq/utf_bom.html
Version: current page, fetched 2026-10-22

> In its first version, from 1991 to 1995, Unicode was a 16-bit encoding, but starting with Unicode 2.0 (July, 1996), the Unicode Standard has encoded characters in the range U+0000..U+10FFFF, which amounts to a 21-bit code space. Depending on the encoding form you choose (UTF-8, UTF-16, or UTF-32), each character will then be represented either as a sequence of one to four 8-bit bytes, one or two 16-bit code units, or a single 32-bit code unit.

> A Unicode transformation format (UTF) is an algorithmic mapping from every Unicode code point (except surrogate code points) to a unique byte sequence.

Contents: definition of a UTF as a mapping from code point to byte sequence; the one-to-four-byte range of UTF-8; the code-space bound U+0000..U+10FFFF; the comparison table of UTF-8/16/32 code-unit sizes. This topic uses the one-to-four-byte claim for UTF-8 and the code-point/byte-sequence distinction.

---

## Python 3 documentation, Glossary — "immutable"

URL: https://docs.python.org/3/glossary.html
Version: Python 3.15.1 documentation, fetched 2026-10-22

> An object with a fixed value. Immutable objects include numbers, strings and tuples. Such an object cannot be altered. A new object has to be created if a different value has to be stored. They play an important role in places where a constant hash value is needed, for example as a key in a dictionary. Immutable objects are inherently thread-safe because their state cannot be modified after creation, eliminating concerns about improperly synchronized concurrent modification.

Contents: the glossary's definitions of `immutable`, `hashable`, `mutable`, and `thread-safe`, cross-referencing each other. This topic uses the `immutable` entry in full: the "new object has to be created" cost, the dictionary-key/hashability benefit, and the thread-safety benefit.

---

## The Go Programming Language blog, "Strings, bytes, runes and characters in Go"

URL: https://go.dev/blog/strings
Version: current page (originally published 2013), fetched 2026-10-22

> In Go, a string is in effect a read-only slice of bytes.

> As implied up front, indexing a string accesses individual bytes, not characters.

> A for range loop, by contrast, decodes one UTF-8-encoded rune on each iteration. Each time around the loop, the index of the loop is the starting position of the current rune, measured in bytes, and the code point is its value.

> U+65E5 '日' starts at byte position 0
> U+672C '本' starts at byte position 3
> U+8A9E '語' starts at byte position 6

Contents: Go's string representation as a byte slice; the worked example showing `s[i]` indexes bytes, not characters; the `for range` loop as the mechanism Go provides for walking code points, which must decode one rune at a time rather than jump to an arbitrary one; a three-code-point example where each code point spans a different number of bytes (3, 3, 3 here, but the mechanism generalizes to the 1–4 byte range). This topic uses the byte-indexing claim and the one-rune-at-a-time decoding loop as the direct demonstration of why byte indexing is O(1) and code-point indexing by that same mechanism is O(n).

---

## Rust standard library documentation, `std::string::String`

URL: https://doc.rust-lang.org/std/string/struct.String.html
Version: current stable docs, fetched 2026-10-22

> // The following will not compile!
> println!("The first letter of s is {}", s[0]);

> It is more clear, however, how &s[i..j] should work (that is, indexing with a range). It should accept byte indices (to be constant-time) and return a &str which is UTF-8 encoded. This is also called "string slicing". Note this will panic if the byte indices provided are not character boundaries — see is_char_boundary for more details.

> The bytes and chars methods return iterators over the bytes and codepoints of the string, respectively. To iterate over codepoints along with byte indices, use char_indices.

Contents: Rust's explicit design rationale for why `str` cannot be indexed by a single integer at all (`s[0]` does not compile), why slicing instead takes byte indices ("to be constant-time"), and the panic on a byte index that doesn't land on a UTF-8 character boundary. This topic uses this as its one verified real-language example of a language that chose byte indexing specifically to keep indexing O(1), at the cost of indexing being unsafe (can panic) if the caller doesn't already know where character boundaries fall.

---

## Java SE 21 API documentation, `java.lang.StringBuilder`

URL: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/StringBuilder.html
Version: Java SE 21 & JDK 21, fetched 2026-10-22

> A mutable sequence of characters. This class provides an API compatible with StringBuffer, but with no guarantee of synchronization. This class is designed for use as a drop-in replacement for StringBuffer in places where the string buffer was being used by a single thread (as is generally the case).

> Every string builder has a capacity. As long as the length of the character sequence contained in the string builder does not exceed the capacity, it is not necessary to allocate a new internal buffer. If the internal buffer overflows, it is automatically made larger.

Contents: `StringBuilder`'s own description of itself as a mutable character sequence with a capacity, and the overflow-triggers-a-larger-buffer mechanism. This topic uses this as the real-world name for "a mutable, amortized-growable buffer, i.e. topic 1's dynamic array specialized to bytes/characters" — the same reallocate-and-copy mechanism as `dsa.dynamic-arrays-growth-policy`, named here rather than re-derived.

---

Note: the amortized-growth argument itself (why doubling a buffer's capacity on overflow gives O(1) amortized append, proved by the aggregate method) is not re-derived here. This topic states explicitly, in the reel and in `post-notes.md`, that it is applying `dsa.dynamic-arrays-growth-policy`'s own result to a buffer of bytes/characters rather than proving a new one, and cites that topic's sources (ISO C++ `[vector]`, N4868; Folly's `FBVector.md`) by reference rather than re-quoting them here.
