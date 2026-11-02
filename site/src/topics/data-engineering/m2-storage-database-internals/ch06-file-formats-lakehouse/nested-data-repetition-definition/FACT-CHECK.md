# Fact-check — de.nested-data-repetition-definition

## Claims table

| # | Claim | Source |
|---|---|---|
| 1 | A repetition level tells a reader at what repeated field in a value's path the value has repeated; level 0 denotes the start of a new record. | Dremel paper, repetition-level definition and the Code-field worked example |
| 2 | A definition level is carried on every value, including NULLs, and specifies how many of the optional/repeated fields in that value's path are actually present. | Dremel paper, definition-level definition |
| 3 | Definition levels are stored as integers (not is-null bits) specifically so a leaf field's own stream carries information about its ancestors' presence too. | Dremel paper, "We use integer definition levels as opposed to is-null bits..." |
| 4 | NULLs need no explicit storage: any definition level smaller than the number of optional/repeated fields in the path denotes a NULL. | Dremel paper, NULLs-not-stored-explicitly sentence |
| 5 | Parquet implements Dremel's own definition/repetition-level encoding directly for nested columns. | Parquet README, "Parquet uses the Dremel encoding with definition and repetition levels" |
| 6 | A non-nested (flat) column's path has no repeated field, so Parquet never encodes a repetition level for it — it would always be 0. | Parquet README, the length-1-path sentence |
| 7 | Arrow's List layout is two buffers (a validity bitmap and an offsets buffer) plus a child array — one pair of buffers per nesting level, not one shared stream across the whole path. | Arrow Columnar spec, List Layout section |
| 8 | A null Arrow list value can still correspond to a non-empty segment in its child array — nullness and the child data aren't required to line up. | Arrow Columnar spec, "a null value may correspond to a non-empty segment" |
| 9 | An Arrow struct array carries its own validity bitmap, independent of its child arrays' bitmaps. | Arrow Columnar spec, Struct section |
| 10 | ORC structs delegate everything to child columns except their own PRESENT stream; ORC lists use a PRESENT stream plus a LENGTH stream (item count per row), with a single child column for elements. | ORC v1 spec, Struct Columns and List Columns sections |

## Currency check

Fetched 2026-10-31: the original Dremel VLDB 2010 paper PDF (`storage.googleapis.com`, a stable
Google Research publication host — the paper itself, unlike a living spec, does not change);
`apache/parquet-format`'s `master` branch README; `apache/arrow`'s `main` branch Columnar format
spec; `apache/orc`'s `main` branch ORCv1 spec. The Dremel encoding and its Parquet implementation
have been stable for well over a decade; Arrow's and ORC's list/struct layouts are equally
long-stable, foundational parts of each format. No currency risk.

## Red-team

1. **Is the worked example's schema an oversimplification that hides real complexity?** It uses
   one repeated field (`item`) with one required and one optional leaf inside it — shallower than
   Dremel's own two-repeated-field example (`Name.Language.Code`), but the repetition/definition
   level rules applied are the exact same rules from the paper, just at a shallower depth; the
   synthetic 100-record dataset still exercises the same empty-list/present-item/missing-optional
   cases a deeper schema would, just with fewer distinct repetition-level values (0 and 1, not 0-2).
2. **Does the reassembly code actually use the levels, or does it cheat by remembering the
   original record boundaries some other way?** `reassemble()` takes only the three flat streams
   (values, repetition levels, definition levels) and the top-level `order_id` list as input — it
   has no access to the original nested `worked_records`/`synthetic_records` structures at
   reassembly time, and the round-trip assertion (`reassemble(...) == worked_records`, and the
   same for the 100-record synthetic set) is checked against those originals afterward.
3. **Is the Arrow/ORC comparison a real structural equivalence or just a coincidence of this one
   example?** `arrow_item_counts` (derived from Arrow's offsets buffer by subtracting consecutive
   offsets) is asserted equal to `orc_length` (ORC's own length stream) directly in code, and
   `orc_note_present` is asserted equal to `arrow_note_validity` — the equivalence is checked, not
   just claimed, on the same data all three layouts describe.
4. **Is the "11% overhead" number representative, or a number picked to look dramatic?** The
   synthetic dataset's empty-list rate (every 5th record, 20%) and item-count distribution (1-3
   items) are fixed, simple, and stated in the code's own comments, not tuned to produce a
   particular headline number; the overhead formula (`empty_records / level_entries`) is a direct
   measurement of this topic's own data, and the outcome's claim is about the existence and
   mechanism of fixed per-record overhead, not a universal percentage.

Problem Solving: None — `examples.py` ran correctly on its first execution, including the full
round trip through both the worked 3-record example and the 100-record synthetic dataset, and the
Arrow/ORC equivalence checks. No bugs found or fixed while building this topic's own code.
