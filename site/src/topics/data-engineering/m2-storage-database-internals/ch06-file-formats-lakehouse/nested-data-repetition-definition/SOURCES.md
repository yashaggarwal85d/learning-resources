# Sources — de.nested-data-repetition-definition

## Dremel: Interactive Analysis of Web-Scale Datasets (Melnik et al., VLDB 2010)

URL: https://storage.googleapis.com/gweb-research2023-media/pubtools/pdf/36632.pdf
Version: the original VLDB 2010 paper PDF, fetched 2026-10-31

> To disambiguate these occurrences, we attach a repetition level to each value. It tells us
> at what repeated field in the field's path the value has repeated.

> The field path Name.Language.Code contains two repeated fields, Name and Language. Hence, the repetition level of Code ranges between 0 and 2; level 0 denotes the start of a new record.

> We use integer definition levels as opposed to is-null bits so that
> the data for a leaf field (e.g., Name.Language.Country) contains the
> information about the occurrences of its parent fields; an example
> of how this information is used is given in Section 4.3.

> NULLs are not stored
> explicitly as they are determined by the definition levels: any definition level smaller than the number of repeated and optional fields
> in a field's path denotes a NULL.

Contents:
- The repetition level's definition: which repeated field in a value's path most recently repeated, used directly in this topic's own shredding algorithm.
- The definition level's definition: how many optional/repeated fields in a value's path are actually present, carried even on NULL values.
- Why NULLs need no explicit storage once definition levels are known, which this topic's own reassembly code relies on.

## Apache Parquet Format, `README.md`

URL: https://raw.githubusercontent.com/apache/parquet-format/master/README.md
Version: apache/parquet-format, `master` branch, fetched 2026-10-31

> To encode nested columns, Parquet uses the Dremel encoding with definition and
> repetition levels.

> Definition levels specify how many optional fields in the path for the column are defined. Repetition levels specify at what repeated field
> in the path has the value repeated.

> Nullity is encoded in the definition levels (which is run-length encoded). NULL values
> are not encoded in the data.

> If the column is not nested (i.e.
> the path to the column has length 1), we do not encode the repetition levels (they would
> always have the value 0).

Contents:
- Confirms Parquet implements Dremel's own encoding directly, not an adaptation of it.
- The concrete rule this topic's encoder uses: no repetition levels for non-nested (flat) paths.

## Apache Arrow Columnar Format specification

URL: https://raw.githubusercontent.com/apache/arrow/main/docs/source/format/Columnar.rst
Version: apache/arrow, `main` branch, fetched 2026-10-31

> The List layout is defined by two buffers, a validity bitmap and an offsets
> buffer, and a child array.

> Similar to the layout of variable-size binary, a null value may
> correspond to a **non-empty** segment in the child array.

> A struct array also has a validity bitmap to encode top-level
> validity information.

Contents:
- Arrow's list layout (offsets + validity bitmap) as the direct contrast with Dremel's repetition/definition levels — no shared level stream across nesting depth, one offsets buffer per nesting level instead.
- Arrow's struct layout: a validity bitmap per struct, independent of child arrays' own bitmaps — the direct contrast with how Parquet's definition levels fold every ancestor's optionality into one integer per leaf value.

## Apache ORC v1 File Format Specification

URL: https://raw.githubusercontent.com/apache/orc/main/site/specification/ORCv1.md
Version: apache/orc, `main` branch, fetched 2026-10-31

> Structs have no data themselves and delegate everything to their child
> columns except for their PRESENT stream. They have a child column
> for each of the fields.

> Lists are encoded as the PRESENT stream and a length stream with
> number of items in each list. They have a single child column for the
> element values.

Contents:
- ORC's own per-level present/length streams — the second contrast this topic draws against Dremel's single shared level pair.
