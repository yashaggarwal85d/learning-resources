Last verified: 30 October 2026. Every number on screen is executed and asserted directly
(`examples.py`, pure Python, no external service needed): a naive comma-split's wrong field
count against a real CSV parser's correct one; a backslash-escaped quote's corrupted read-back
against RFC 4180's doubled-quote form; a naive line-split's wrong record count against a real
parser's correct one; a sixteen-digit JSON integer's exact value against what a double-precision
parse returns for the same text; and a BOM-prefixed JSON document's parse failure against the
same document with the BOM stripped.

- RFC 4180, "Common Format and MIME Type for Comma-Separated Values (CSV) Files": [rfc-editor.org](https://www.rfc-editor.org/rfc/rfc4180). October 2005. The quoting, escaping and embedded-newline rules this topic's own CSV examples are built on.
- RFC 8259, "The JavaScript Object Notation (JSON) Data Interchange Format": [rfc-editor.org](https://www.rfc-editor.org/rfc/rfc8259). December 2017. The number grammar and the UTF-8/BOM rules this topic's own JSON examples are built on.
- Unicode Consortium, "FAQ — UTF-8, UTF-16, UTF-32 & BOM": [unicode.org](https://www.unicode.org/faq/utf_bom.html). Retrieved 2026-10-30. The byte order mark's actual role (a signature, not a byte-order marker, in UTF-8).
- "JSON Lines": [jsonlines.org](https://jsonlines.org/). Retrieved 2026-10-30. The JSONL convention named in the syllabus line, as a layer on top of JSON rather than part of RFC 8259 itself.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=text-interchange-formats-their:%20).
