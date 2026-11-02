# Fact-check — de.variant-type-shredding

## Claims table

| # | Claim | Source |
|---|---|---|
| 1 | A Variant is 2 binary values: `value` and `metadata`. | VariantEncoding.md |
| 2 | A Variant is one of Primitive, Array, or Object. | VariantEncoding.md |
| 3 | Metadata is a header byte, `dictionary_size`, an offset list, then UTF-8 dictionary bytes. | VariantEncoding.md, "Metadata encoding" |
| 4 | `sorted_strings` governs whether dictionary strings are unique/sorted. | VariantEncoding.md |
| 5 | Object field IDs/offsets must be sorted lexicographically by field name; values need not be. | VariantEncoding.md, "Object field ID order and uniqueness" |
| 6 | Shredding extracts fields into separate Parquet columns for compactness, stats, and projection. | VariantShredding.md |
| 7 | `value` and `typed_value` are used together to encode one field; which combination is non-null decides meaning. | VariantShredding.md |
| 8 | Field statistics on `value`/`typed_value` enable skipping. | VariantShredding.md |
| 9 | `typed_value` statistics can skip a file/row-group/page when `value` is always null. | VariantShredding.md, "Data Skipping" |
| 10 | Shredding is optional; readers must still read an unshredded `value`+`metadata` group. | VariantShredding.md |
| 11 | Different files may shred the same Variant field differently (no single schema guaranteed). | VariantShredding.md |

## Currency

Both documents fetched 2026-10-31 from `apache/parquet-format`'s `master` branch — the live,
unversioned specification text (the Variant type and shredding are both still evolving in this
repository; no stable numbered release exists to pin to, consistent with how topics 4-7 of this
chapter cite the same repository's `master` branch).

## Red-team

- **Is the hand-rolled encoder faithful to the spec's byte layout, not just a toy?** Yes —
  `examples.py`'s `encode_metadata`/`encode_value`/`encode_object` follow VariantEncoding.md's
  "Metadata encoding" and "Value encoding" diagrams field-by-field (header byte bit layout,
  `dictionary_size`, offset lists, `value_metadata` byte with `basic_type` in the low 2 bits and
  `value_header` in the high 6, object `num_elements`/`field_id`/`field_offset` layout). The
  round trip (`decode_value(encode_value(r)) == r` for every record) is a real correctness check,
  not an assumption — a bug in either direction would fail it.
- **Is the "struct loses data" claim rigged by picking an unfair struct schema?** No — the struct
  (`event_type: string`, `button_id: int32`) is exactly the two fields present in the *majority*
  of records (5 of 6 have `event_type`, 4 of 6 have an int `button_id`), the most generous
  single-schema choice for this dataset, and it still loses data on 3 of 6 records.
- **Is the shredding simulation faithful to VariantShredding.md's value/typed_value rules?** Yes —
  `shred_record()` implements the same decision table the spec gives in "Value Shredding": a
  present, correctly-typed field goes to `typed_value` only; a present, wrongly-typed field goes
  to the residual `value` only (never both); a missing field leaves both null. The "3 fully
  shredded, 2 partial, 1 fallback" breakdown is counted directly from that logic, not asserted.
- **Does the "event_type never touches the residual value column" claim generalize, or is it an
  artifact of this dataset?** It's dataset-specific and disclosed as such in `post-notes.md`'s
  Frontier section: `event_type` happens to be a string in every one of these 6 records. A field
  that is sometimes a different type (like `button_id` here) would fall back for those records,
  exactly as `button_id` does for record 6.
- **Is the measured-size comparison meaningful, or too close to call?** Disclosed honestly:
  shredding here (126 bytes) beats unshredded Variant (155 bytes) by less than 20% on this tiny
  6-record sample — the real win in this topic is the query-cost claim (0 residual bytes touched
  by an `event_type` filter), not the size claim, and `post-notes.md` says so rather than
  overstating the size gain.

## Problem solving

No implementation bugs were found this topic (unlike topic 7's Bloom filter hash bug) — the first
working version of the metadata/value encoder, decoder, and shredding simulation passed its round
trip and all byte-count assertions on the first full run after fixing arithmetic-only assertion
placeholders (the numeric literals were computed empirically from a debug run with asserts
stripped, then pinned back in — standard practice for every topic in this chapter, not a bug fix).
