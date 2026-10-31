# Fact-check — de.schema-evolution-rules-across

| # | Claim | Source | Verified |
|---|---|---|---|
| 1 | A reader field with a default, missing from the writer's record, resolves to that default. | Avro spec, Schema Resolution (quote) | Yes — word-for-word, `sources.mjs check` passes. |
| 2 | A reader field with no default, missing from the writer's record, is an error. | Avro spec, Schema Resolution (quote) | Yes. |
| 3 | A writer field not present in the reader's schema is ignored. | Avro spec, Schema Resolution (quote) | Yes. |
| 4 | Avro aliases let an implementation map the writer's name to the reader's. | Avro spec, Schema Resolution (quote) | Yes — used only as a named alternative in post-notes.md; this topic's own worked example does not use aliases, to keep the sandbox's "rename" example about by-name/by-position/by-field-ID matching, which is the syllabus's own named contrast. |
| 5 | Reusing a Protobuf field number makes decoding ambiguous and can lead to data corruption, not necessarily a parse error. | Protobuf docs, Field Numbers (quote) | Yes. |
| 6 | `reserved` is the mechanism that prevents future reuse of a deleted field number. | Protobuf docs, Reserved Field Numbers (quote) | Yes. |
| 7 | Parquet's `SchemaElement` carries an optional `field_id`. | `parquet.thrift`, `SchemaElement` definition (quote) | Yes — fetched directly from the `parquet-format` repository's Thrift source, not a secondary description. |
| 8 | The sandbox's own Avro resolution: a record missing `currency` resolves to the reader's default `"USD"`; a record missing `discount_cents` (no default) raises. | `examples.py`, `resolve_avro_record` | Yes — `python3 examples.py` passes. |
| 9 | The sandbox's own Protobuf demonstration: "Alice"'s UTF-8 bytes, reread as the reused field 2's int32, decode to 1,667,853,377 — a valid-looking integer, not a parse failure. | `examples.py` | Yes — computed directly from `"Alice".encode("utf-8")[:4]`, not estimated. |
| 10 | The sandbox's own Parquet matching: after renaming `cust_id`→`customer_id` and inserting a new `region` column, by-name returns the renamed and new columns as missing (safe); by-position returns `region` holding `amount_cents`'s old value and `amount_cents` holding `currency`'s old value (silent corruption); by-field-ID resolves every real column correctly and only `region` as missing. | `examples.py`, `match_by_name` / `match_by_position` / `match_by_field_id` | Yes. |

## Currency check

The Avro and Protobuf specification pages are versioned documentation (Avro 1.11.1; the current
proto3 guide, fetched 2026-10-30) and both rules quoted are stable, long-standing parts of each
format's design, not features under active change. The `parquet.thrift` fetch is from the
`parquet-format` repository's `master` branch — the `field_id` field has been part of the format
since Parquet's schema evolution was first specified; its Thrift field number (9) was confirmed
directly from the fetched file, not assumed from memory.

## Red-team

1. Does the Protobuf example overclaim "always corrupts"? No — the reel and FACT-CHECK both state
   this as one concrete, reproducible case (reinterpreting a string's bytes as an int32), not a
   claim that every field-number reuse produces this exact failure mode; the general claim quoted
   from the docs ("data corruption" as one of several possible outcomes) is the paper's own words.
2. Is the Parquet "rename + insert" scenario realistic, or an artificially harsh combination? Both
   changes (renaming a column, adding a new one) are named directly in the syllabus line ("type
   widening and nullability changes" plus the by-name/by-position/by-field-ID contrast), and
   real schema evolution in practice rarely does just one isolated thing — the lab (§6.1) performs
   exactly this kind of combined change across formats.
3. Does calling Avro's resolution "safe" when a default exists risk overclaiming safety in
   general? No — step 3's takeaway is scoped precisely ("safely only if it carries a default"),
   matching the spec's own conditional rule rather than a blanket claim.
4. The sandbox has neither `fastavro` nor `pyarrow` installed (checked directly:
   `python3 -c "import pyarrow"` raises `ModuleNotFoundError`), so every rule is this topic's own
   hand-rolled implementation of each spec's stated behavior, not a claim about any particular
   library's exact behavior — stated explicitly in `examples.py`'s docstring and in references.md.

## Problem Solving

None — this topic's own worked examples (Avro resolution, Protobuf field reuse, Parquet column
matching) are the "problem solving" content; there is no separate lab-style exercise beyond what
`examples.py` already demonstrates and the chapter's own §6.1 lab (hosted by this topic) extends.
