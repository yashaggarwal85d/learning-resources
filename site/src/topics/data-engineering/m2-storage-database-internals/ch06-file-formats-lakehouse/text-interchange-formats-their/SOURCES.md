## RFC 4180: Common Format and MIME Type for Comma-Separated Values (CSV) Files

URL: https://www.rfc-editor.org/rfc/rfc4180
Version: RFC 4180, October 2005

> 5. Each field may or may not be enclosed in double quotes (however
> some programs, such as Microsoft Excel, do not use double quotes
> at all). If fields are not enclosed with double quotes, then
> double quotes may not appear inside the fields.

> 6. Fields containing line breaks (CRLF), double quotes, and commas
> should be enclosed in double-quotes.

> 7. If double-quotes are used to enclose fields, then a double-quote
> appearing inside a field must be escaped by preceding it with
> another double quote.

Contents:
- Section 2, rule 2: the last record in the file may or may not have an ending line break; readers must tolerate both.
- Section 2, rule 5: quoting is optional and inconsistent across producers (Excel never quotes).
- Section 2, rule 6: embedded line breaks, quotes and commas require quoting.
- Section 2, rule 7: an embedded quote is escaped by doubling it, not by a backslash.
- Section 3: CSV's registered MIME type (`text/csv`) and its own silence on character encoding beyond US-ASCII.

## RFC 8259: The JavaScript Object Notation (JSON) Data Interchange Format

URL: https://www.rfc-editor.org/rfc/rfc8259
Version: RFC 8259, December 2017

> This specification allows implementations to set limits on the
> range and precision of numbers accepted. Since software that
> implements IEEE 754 binary64 (double precision) numbers [IEEE754]
> is generally available and widely used, good interoperability can
> be achieved by implementations that expect no more precision or
> range than these provide, in the sense that implementations will
> approximate JSON numbers within the expected precision.

> Note that when such software is used, numbers that are integers
> and are in the range [-(2**53)+1, (2**53)-1] are interoperable in
> the sense that implementations will agree exactly on their
> numeric values.

Contents:
- Section 6: "Numbers": JSON places no limit on a number's magnitude or precision, but warns that real parsers typically use IEEE 754 binary64, so an integer outside ±(2^53 − 1) is not guaranteed to round-trip exactly.
- Section 8.1: JSON text must be encoded as UTF-8 (the RFC's own recommendation; earlier JSON predates this requirement, which is why UTF-16/UTF-32 JSON and stray BOMs still appear in the wild).
- The grammar (Section 2): no distinct type for an integer versus a float; both are "number", which is itself part of why precision is a parser decision, not a format one.

## Unicode FAQ: UTF-8, UTF-16, UTF-32 & BOM

URL: https://www.unicode.org/faq/utf_bom.html
Version: Unicode Consortium FAQ, retrieved 2026-10-30

> A byte order mark (BOM) consists of the character code U+FEFF at
> the beginning of a data stream, where it can be used as a
> signature defining the byte order and encoding form, primarily of
> unmarked plain text files.

> Where a BOM is used with UTF-8, it is only used as an encoding
> signature to distinguish UTF-8 from other encodings — it has
> nothing to do with byte order.

> Note that some recipients of UTF-8 encoded data do not expect a
> BOM. Where UTF-8 is used transparently in 8-bit environments, the
> use of a BOM will interfere with any protocol or file format that
> expects specific ASCII characters at the beginning, such as the
> use of "#!" of at the beginning of Unix shell scripts.

Contents:
- "What is a BOM?": U+FEFF as a signature at the start of a text stream.
- "Is a BOM used only in 16-bit Unicode text?": a BOM exists in UTF-8 form too, purely as an encoding signature, never a byte-order marker there.
- The warning that an unexpected leading BOM breaks ASCII-prefix-sensitive readers (shebang lines, and by the same mechanism, a CSV/JSON parser that doesn't strip it first).

## JSON Lines (jsonlines.org)

URL: https://jsonlines.org/
Version: retrieved 2026-10-30

> Like the JSON standard
> a byte order mark (U+FEFF) must NOT be included.

> This means '\r\n' is also supported because surrounding white space is
> implicitly ignored when parsing JSON values.

Contents:
- "The JSON Lines format has three requirements": UTF-8 encoding with no BOM, one valid JSON value per line, `\n` as the line terminator (with `\r\n` tolerated because surrounding whitespace is ignored).
- JSONL is a convention layered on top of JSON (RFC 8259), not a format RFC 8259 itself defines — one JSON value per line makes a JSON-based format splittable and streamable the way a single big JSON document is not.
