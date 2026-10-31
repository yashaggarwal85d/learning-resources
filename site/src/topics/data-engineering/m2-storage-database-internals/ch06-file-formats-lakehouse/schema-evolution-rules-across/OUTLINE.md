# Outline — de.schema-evolution-rules-across

"Full" topic, ~15 min, 2 predict steps (one within the first four steps). Running example: a
customer order record, evolved three ways — a safe addition (Avro), a dangerous field-number
reuse (Protobuf), and a rename plus an insertion read back three ways (Parquet). Every resolved
value and byte on screen is computed and asserted in `examples.py`, with no external libraries
(pure Python — this sandbox has neither `fastavro` nor `pyarrow` installed, so each format's own
rule is hand-rolled directly from its spec, not borrowed from a library's behavior).

## Engagement arc

1. **Hook.** A record written without a `currency` field; a newer reader schema asks for
   `currency` with a default of `"USD"`. The resolution is uneventful: Avro's own rule for a
   reader field missing from the writer, with a default, is to just use the default.
2. **Predict: does the same safe story cover a required field without a default?** (predict step,
   within the first four) options: "Yes — a reader always gets something back, correct: false" /
   "No — a reader field with no default and no writer value is an error, correct: true". Visual:
   the same writer record, a second reader schema asking for `discount_cents` with no default.
3. **Reveal: Avro's one strict rule.** fig: a reader field with no default and no matching writer
   field raises, by the spec's own words. takeaway: an Avro field can be added safely only if it
   carries a default; without one, every old record a new reader opens is an error.
4. **Reveal: Protobuf doesn't match by name at all.** fig: Protobuf fields are identified on the
   wire by number, not name — the whole mechanism this topic has shown so far (matching by name)
   doesn't apply here.
5. **Predict: what happens if a deleted field's number gets reused?** (second predict step)
   options: "The old bytes fail to parse, correct: false" / "The old bytes parse fine, as the
   wrong value, correct: true". Visual: field 2 was a string; it's deleted; a new int field takes
   number 2 without reserving it.
6. **Reveal: the surprising number.** fig: the old string bytes for field 2, reread as the new
   field 2's int32, decode to a specific wrong-but-valid-looking integer — no parse error at all.
   takeaway: reusing a deleted field number doesn't fail to parse; it silently decodes as the
   wrong type, which is why `reserved` exists.
7. **Reveal: Parquet's three ways to match a column.** fig: the same renamed-plus-inserted schema
   change, read back by name, by position, and by field ID. Visual: three small result tables.
8. **Reveal: by-position corrupts silently.** fig: inserting one new column shifts every later
   column's position, so by-position matching reads each shifted column's data into the wrong
   field — a correct-looking value in the wrong place. takeaway: by-position matching breaks the
   moment a column is inserted anywhere but the end, and it fails by returning the wrong data, not
   by raising an error.
9. **Reveal: by-field-ID survives both.** fig: the same renamed, reordered schema, matched by the
   stable field ID Parquet's own schema carries — every real column resolves correctly, and only
   the genuinely new column reads back missing.
10. **Recap.** Three formats, one shared shape: every safe evolution move (add a field with a
    default, widen a type, add nullability) still needs a stable identity to match against — a
    name Avro trusts, a number Protobuf guards with `reserved`, or an ID Parquet can carry
    alongside either. Handoff: table formats add that same stable ID on top of the file itself.

## Concept ledger

- Introduces: `schema-evolution-column-matching`.
- Uses: `text-format-traps` (topic 1), `row-vs-columnar-layout` (topic 2).
- Declared: none beyond topics 1-2.

## Claims list

1. Avro record resolution: reader field with a default, missing from the writer, uses the
   default; without a default, it is an error. (Avro spec, quotes)
2. An extra field in the writer's record not present in the reader's is ignored. (Avro spec, quote)
3. Avro aliases let a reader map the writer's old name to its own new one. (Avro spec, quote)
4. Protobuf fields are identified by number on the wire, not name; reusing a deleted field's
   number can silently decode as the wrong type/value, not a parse error. (Protobuf docs, quotes)
5. `reserved` is the mechanism that makes a future reuse of a deleted field number a compile-time
   error instead of a runtime corruption. (Protobuf docs, quote)
6. Parquet's `SchemaElement` carries an optional `field_id` (Thrift field 9) precisely so a reader
   can match a column by a stable ID instead of by name or position. (parquet.thrift, quote)
7. The sandbox's own hand-rolled demonstration: Avro default resolution; Protobuf field-number
   reuse decoding a string's bytes as a specific wrong int32; Parquet by-name/by-position/
   by-field-ID matching on one renamed-plus-inserted schema change, with by-position silently
   returning each shifted column's wrong data and by-field-ID resolving every real column
   correctly.
