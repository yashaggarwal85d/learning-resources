# Fact-check: de.variant-type-semi-structured

## Claims table

| Claim | Basis | Check |
|---|---|---|
| Extracting one field repeatedly from a JSON-string column is real, meaningfully slower than extracting it from VARIANT on the identical data | Measured (`examples.py`) | `python3 examples.py` assertions, passing |
| Casting a field whose type varies row to row into a fixed struct schema turns the mismatched row's value into NULL | Measured | same |
| The identical data read through VARIANT preserves and extracts every row's own value correctly | Measured | same |
| A variant value consists of a one-byte header and content bytes; metadata holds a shared dictionary of distinct field-name strings | Sourced, Spark source (VariantUtil.java) | `sources.mjs check`, word for word |
| `parse_json`/`variant_get` raise on invalid input/failed cast; `try_parse_json`/`try_variant_get` return NULL instead | Sourced, Spark SQL function reference | same |
| VARIANT reached general availability with shredding in Spark 4.1 | Sourced, Spark 4.1.0 release notes | same |
| `VariantShreddingWriter` is the class that implements shredding a Variant value; a shredding schema holds a value and optional typed_value field | Sourced, Spark source (VariantShreddingWriter.java / VariantSchema.java) | same |

## Red team

- **Could the extraction-speed gap just reflect JIT/codegen warmup rather than a real
  per-extraction cost difference?** Each comparison runs 4 times and only the last 3 (steady
  state) are compared; the assertion requires every steady-state JSON-string run to be slower
  than every steady-state VARIANT run, and the totals to differ by at least 50%, not just the
  first (warmup-inflated) run.
- **Could the struct-cast NULL be an unrelated Spark bug, rather than the documented
  type-mismatch behavior?** The same mechanism (`from_json` against a declared `StructType`)
  is standard, widely-documented Spark behavior for a value that can't be safely cast to the
  declared type; the test isolates it by running the identical three rows through both paths
  in the same script, so the only variable is the column's type (struct vs VARIANT).
- **Is three rows too small a sample to generalize "the mismatched row disappears"?** The claim
  is about a mechanism (a value a declared type can't represent becomes NULL under `from_json`),
  not a statistical rate; one clean, deliberately-chosen counterexample (an int field holding a
  string in exactly one row) is sufficient to demonstrate the mechanism exists and triggers.
- **Is shredding's absence from 4.0.1 actually verified, or assumed from the release notes
  alone?** Checked directly: `spark.conf.get("spark.sql.variant.inferShreddingSchema")` raises
  `SQL_CONF_NOT_FOUND` against the pinned 4.0.1 session, confirming the automatic
  shredding-schema inference GA'd in 4.1 genuinely isn't present to measure here -- not merely
  undocumented.

## Abandoned approaches

An initial attempt tried to force shredding directly in 4.0.1 using the internal
`spark.sql.variant.forceShreddingSchemaForTest` config (found in the compiled `SQLConf` class,
evidently a test-only hook, not a documented or supported feature) and by setting
`spark.sql.variant.writeShredding.enabled=true` directly -- neither changed the bytes written
for an identical VARIANT column, confirming that without `inferShreddingSchema` (4.1-only) to
actually choose which fields to shred, there's no automatic, measurable shredding behavior to
compare against in 4.0.1. Settled on treating shredding's own read/write trade-off as sourced
rather than measured, matching this chapter's established precedent for a scope item genuinely
unshipped in the pinned version (topic 27's checkpoint structure v2).
