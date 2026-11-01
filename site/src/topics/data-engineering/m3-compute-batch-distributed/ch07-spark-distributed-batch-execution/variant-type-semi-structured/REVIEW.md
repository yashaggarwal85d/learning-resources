# Review: de.variant-type-semi-structured

## Content review

CHAPTER.md's scope names shredding's read/write trade-off as a claim to teach, but shredding
reached general availability in Spark 4.1, a release after this chapter's pinned 4.0.1; 4.0.1
has no automatic shredding-schema inference config (`spark.sql.variant.inferShreddingSchema`
doesn't exist there), confirmed by checking directly rather than assuming from the release
notes alone. Two internal-looking configs (`spark.sql.variant.writeShredding.enabled`,
`spark.sql.variant.forceShreddingSchemaForTest`) exist in 4.0.1 but produced no measurable
byte-count change in testing, matching 4.1's own documentation of what GA'd. Shredding is
sourced, not measured, documented in `SOURCES.md`'s naming note and `coverage.json`'s expert
items -- the same call this chapter made for topic 27's checkpoint structure v2. In its place,
two claims that are genuinely measurable against 4.0.1 anchor the reel: VARIANT's real
extraction-speed advantage over repeated JSON-string parsing, and a fixed struct silently
losing a value whose type doesn't match its declared schema where VARIANT doesn't. CHAPTER.md's
named source "VariantVal.scala" turned out to be `VariantVal.java` -- Java, not Scala; Spark's
own `Variant.java` is documented as its structurally-equivalent twin, quoted from the exact
`v4.1.0` git tag instead.

Two full runs of `examples.py` produced consistent pass/fail outcomes; the timing assertion
compares every steady-state (post-warmup) run of each path rather than a single sample, to
avoid a flaky margin.

## Looks review

`scenes.tsx` needed two `Row` values shortened past 3 words on the first pass ("a brand new
type" to "brand new", "after this chapter's version" to "a later release"). Predicts land at
steps 3 and 6 (index 2 and 5); all three takeaways passed the 20-word limit on the first draft
except the recap takeaway, which was 26 words and needed trimming to exactly 20.
