<section data-section="outcomes">

## Outcomes

Explain Avro's writer/reader schema resolution — a reader field with a default resolves quietly
when missing from the writer; one without a default errors — with a real resolved record and a
real raised error. State Protobuf's field-number rule and reproduce, byte for byte, why reusing a
deleted field's number silently decodes as the wrong value rather than failing to parse. Contrast
Parquet's by-name, by-position and by-field-ID column matching on one real renamed-plus-inserted
schema change, showing by-position silently return each shifted column's wrong data while
by-field-ID resolves every real column correctly. State, as a forward pointer, that table formats
add a stable column ID on top of the file itself (§6.3) to make this safe in general.

</section>

<section data-section="internals">

## Three mechanisms, one shared requirement

Every one of this topic's three examples is really the same question asked in a different
vocabulary: what identity does a reader trust to mean "the same field" across a schema change?
Avro's answer is the field's name, made safe by requiring a default for anything the name might
not find. Protobuf's answer is a number, made safe only by human discipline — `reserved` is not a
runtime check at all; it only makes the *compiler* refuse to let a deleted number be reused, which
is exactly why a team that skips it gets silent corruption instead of a build failure. Parquet
can use any of name, position or a `field_id`, and this topic's own worked example is deliberately
built to make the three disagree: a rename defeats name-matching cleanly (it fails safe, as
missing), while an insertion defeats position-matching dangerously (it fails by returning another
column's real data under the wrong name). A `field_id` defeats neither, because it was never tied
to the name or the position in the first place.

</section>

<section data-section="lab">

## Lab: evolving a schema across formats

This topic hosts the §6.1 chapter lab's schema-evolution half: take the CSV and JSON rows from
topic 1 and carry the same three changes — add a column, rename a column, widen a numeric column
from an integer to a value with a decimal point — through Avro, Protobuf and Parquet, recording
which reader, under which matching strategy, breaks on which change. The pattern this topic's own
`examples.py` follows (hand-roll each spec's stated rule and assert the real resolved value,
rather than trust a library's behavior) is the one the lab extends across all three formats and
all three changes.

</section>

<section data-section="production">

## Production failures this topic warns about

**Deleting a Protobuf field without reserving its number.** This is, by a wide margin, the most
dangerous mistake this topic covers, because it produces no error of any kind — not at compile
time, not at parse time, not at runtime. The bug surfaces later as a value that looks plausible
but is quietly wrong, often long after the field was deleted and the original developer has moved
on. The fix costs one line (`reserved N;`) and converts an invisible data-corruption bug into a
`protoc` compile error the moment anyone tries to reuse the number.

**Assuming "by position" is simpler and therefore safer.** A pipeline stage that reads Parquet
columns by index rather than by name or field ID looks simpler to write, and works correctly right
up until a column is added anywhere but the very end of the schema — at which point every column
after the insertion point silently reads another column's data, with no error to signal it.

</section>

<section data-section="frontier">

## Frontier

This topic measures column matching as a general mechanism, not any one table format's own
metadata layer — Iceberg and Delta Lake (§6.3, largely skipped in this curriculum except where
later topics compare against them) build their own stable column-ID bookkeeping on top of exactly
the `field_id` mechanism this topic demonstrates directly from Parquet's own Thrift definition.
Schema-registry compatibility modes (forward, backward, full), named in the syllabus as a §9.2
forward reference, are a separate, later topic's subject: this topic stops at what one reader does
with one schema change, not at how a registry governs many producers and consumers agreeing on
compatible changes over time.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every format so far has been one file, self-contained. The next section is the one format that
won the lakehouse: Parquet, starting from its own file anatomy.

</section>
