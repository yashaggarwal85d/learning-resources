## Apache Spark, "Spark Release 4.1.0"

URL: https://spark.apache.org/releases/spark-release-4.1.0.html
Version: 4.1.0

> VARIANT is GA with shredding for faster reads on semi-structured data, plus recursive CTE
support and new approximate data sketches (KLL and Theta).

> [SPARK-54454] Enable VARIANT type by default (VARIANT type GA)

## Apache Spark documentation, "Spark SQL, Built-in Functions"

URL: https://spark.apache.org/docs/4.1.0/api/sql/index.html
Version: 4.1.0

Note on source naming: CHAPTER.md names "Spark SQL 'VARIANT Data Type' docs" -- Spark has no
standalone page by that title; the VARIANT functions this topic uses (`parse_json`,
`variant_get`, and their non-throwing counterparts) are documented as entries on this
combined, version-pinned SQL built-in functions reference instead.

> parse_json(jsonStr) - Parse a JSON string as a Variant value. Throw an exception when the
string is not valid JSON value.

> try_parse_json(jsonStr) - Parse a JSON string as a Variant value. Return NULL when the
string is not valid JSON value.

> variant_get(v, path[, type]) - Extracts a sub-variant from v according to path, and then
cast the sub-variant to type. When type is omitted, it is default to variant. Returns null if
the path does not exist. Throws an exception if the cast fails.

> try_variant_get(v, path[, type]) - Extracts a sub-variant from v according to path, and then
cast the sub-variant to type. When type is omitted, it is default to variant. Returns null if
the path does not exist or the cast fails.

> schema_of_variant(v) - Returns schema in the SQL format of a variant.

## Apache Spark source, Variant.java

URL: https://raw.githubusercontent.com/apache/spark/v4.1.0/common/variant/src/main/java/org/apache/spark/types/variant/Variant.java
Version: v4.1.0 (git tag)

Note on source naming: CHAPTER.md names "Spark source, VariantVal.scala / shredding writer
(GitHub, tag closest to 4.1 tagged release available)" -- the actual class is
`org.apache.spark.unsafe.types.VariantVal`, written in Java, not Scala. `Variant.java`, quoted
below, is Spark's own structurally-equivalent twin of that class, kept in the dependency-free
`common/variant` module, quoted from the exact `v4.1.0` git tag.

> This class is structurally equivalent to {@link org.apache.spark.unsafe.types.VariantVal}. We
define a new class to avoid depending on or modifying Spark.

## Apache Spark source, VariantUtil.java

URL: https://raw.githubusercontent.com/apache/spark/v4.1.0/common/variant/src/main/java/org/apache/spark/types/variant/VariantUtil.java
Version: v4.1.0 (git tag)

> A variant is made up of 2 binaries: value and metadata. A variant value consists of a one-byte
header and a number of content bytes (can be zero). The header byte is divided into upper 6 bits
(called "type info") and lower 2 bits (called "basic type"). The content format is explained in
the below constants for all possible basic type and type info values.

> The variant metadata includes a version id and a dictionary of distinct strings
(case-sensitive).

## Apache Spark source, VariantShreddingWriter.java

URL: https://raw.githubusercontent.com/apache/spark/v4.1.0/common/variant/src/main/java/org/apache/spark/types/variant/VariantShreddingWriter.java
Version: v4.1.0 (git tag)

Note on source naming: this is CHAPTER.md's named "shredding writer" source.

> Class to implement shredding a Variant value.

## Apache Spark source, VariantSchema.java

URL: https://raw.githubusercontent.com/apache/spark/v4.1.0/common/variant/src/main/java/org/apache/spark/types/variant/VariantSchema.java
Version: v4.1.0 (git tag)

> A shredding schema contains a value and optional typed_value field.
If a typed_value is an array or struct, it recursively contain its own shredding schema for
elements and fields, respectively.
The schema also contains a metadata field at the top level, but not in recursively shredded
fields.
