<section data-section="outcomes">

## Outcomes

Reproduce five real misparses — an unquoted comma, a backslash-escaped quote, an embedded line
break, a JSON integer losing precision, and a byte order mark — and state the exact rule RFC 4180
or RFC 8259 gives for each. Explain why CSV has no escape character at all, so a backslash is
ordinary data to a conformant reader, and why RFC 4180's only escape is a doubled quote. State
precisely what a byte order mark is (a signature, not a byte-order marker, in UTF-8) and why a
reader that doesn't account for it treats it as the file's first character. Explain why none of
CSV, JSON or XML carries a schema or column types, and why all three are still accepted at the
edge of a pipeline and converted immediately rather than stored long-term.

</section>

<section data-section="internals">

## The grammar underneath the traps

RFC 4180's own grammar names exactly two kinds of field: `escaped` (wrapped in double quotes,
allowed to contain a comma, a line break, or a doubled quote) and `non-escaped` (plain text, none
of those three characters allowed). There is no third kind, and no backslash production anywhere
in the grammar — which is the entire reason a backslash escape silently fails: the parser simply
has no rule that treats it as special. RFC 8259's own number grammar is just as narrow: one
production, "number," covering everything from a plain integer to a value with an exponent, with
no distinction between an integer and a float and no stated limit on magnitude. The precision
limit this topic measures is not in the grammar at all; it is what happens once a real
implementation picks a concrete in-memory representation (commonly IEEE 754 binary64) for that
single, unbounded "number" production. JSON Lines layers a third convention on top of both:
one value per line, UTF-8, no byte order mark, a line feed as the terminator — nothing RFC 8259
itself defines, but a convention precise enough that a reader can stream a file one record at a
time instead of parsing it as a single, enormous value.

</section>

<section data-section="lab">

## Lab: evolving a schema across formats

This topic hosts the schema-evolution half of the chapter's §6.1 lab: take the same row — a
customer id, a name, an amount — and write it as CSV and as JSON, then make three changes in
turn: add a new optional column, rename an existing column, and widen a numeric column from an
integer to a value with a decimal point. A CSV reader keyed by column position breaks on the
rename immediately, because CSV carries no column names at all, only position. A JSON reader
keyed by field name survives the rename and the added column without any special handling,
because JSON's own objects are inherently named, but it still has to decide, on its own, whether
the widened numeric column is now a float everywhere or only where a decimal point actually
appears — which is precisely the ambiguity Parquet's own typed columns (Chapter 6, §6.2) remove.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating "the file opened" as "the file parsed correctly."** A naive CSV reader that splits on
every comma, or a line-based reader that splits on every line break, raises no error at all on
the inputs this topic demonstrates — it just silently returns the wrong number of fields or
records. A pipeline that never checks row counts against an expected total can run for a long
time on corrupted data before anyone notices.

**A JSON id truncated by a JavaScript-based pipeline step.** Any pipeline stage written in a
language whose default number type is a double — JavaScript chief among them — will silently
round a sufficiently large integer id the moment it touches that stage, even if every other stage
in the same pipeline (written in a language with arbitrary-precision integers) handled the exact
same file correctly. The bug shows up as two systems disagreeing about one record's own identity,
not as a crash.

</section>

<section data-section="frontier">

## Frontier

This topic deliberately stops at the format level: it does not build Avro's container format,
Protobuf's wire format, or Arrow's in-memory columnar layout, all three of which the syllabus
marks as their own, separate (and here skipped) topics. The schema-evolution comparison this
topic's lab performs across CSV and JSON is exactly the comparison the next full topic (§6.1,
schema evolution rules across formats) extends to those binary formats and to Parquet's own
by-name, by-position and by-field-ID column matching.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A text format with no types and no schema is still, underneath, either a row at a time or a
column at a time. The next topic is that choice itself: row-oriented versus columnar layout.

</section>
