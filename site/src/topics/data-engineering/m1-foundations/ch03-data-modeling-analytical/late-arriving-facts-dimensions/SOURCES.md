# Sources — de.late-arriving-facts-dimensions

## Kimball Group, "Late Arriving Dimension"

URL: https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/late-arriving-dimension/
Fetched: 2026-10-22.

Quote:
> In these cases, special dimension rows are created with the unresolved natural keys as attributes.  Of course, these dimension rows must contain generic unknown values for most of the descriptive columns; presumably the proper dimensional context will follow from the source at a later time. When this dimensional context is eventually supplied, the placeholder dimension rows are updated with type 1 overwrites.

> Late arriving dimension data also occurs when retroactive changes are made to type 2 dimension attributes. In this case, a new row needs to be inserted in the dimension table, and then the associated fact rows must be restated.

Items: (1) a late-arriving fact's unresolved customer gets a placeholder dimension row with generic unknown values; (2) the placeholder is updated with a Type 1 overwrite once the real context arrives; (3) a retroactive Type 2 change is also late-arriving dimension data; (4) it needs a new row, and the associated facts must be restated.

## Kimball Group, "Late Arriving Fact"

URL: https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/late-arriving-fact/
Fetched: 2026-10-22.

Quote:
> A fact row is late arriving if the most current dimensional context for new fact rows does not match the incoming row. This happens when the fact row is delayed. In this case, the relevant dimensions must be searched to find the dimension keys that were effective when the late arriving measurement event occurred.

Items: (1) a fact is late-arriving when the current dimensional context doesn't match the incoming row; (2) the relevant dimensions must be searched for the keys effective when the event occurred, not the current keys.

## Apache Beam Programming Guide, "8.4 Watermarks and late data" / "8.4.1 Managing late data"

URL: https://beam.apache.org/documentation/programming-guide/
Fetched: 2026-10-22.

Quote:
> Once the watermark progresses past the end of a window, any further element that arrives with a timestamp in that window is considered late data.

> You can allow late data by invoking the .withAllowedLateness operation when you set your PCollection's windowing strategy. The following code example demonstrates a windowing strategy that will allow late data up to two days after the end of a window.

Items: (1) data arriving after the watermark has passed its window is "late"; (2) allowed lateness is a named, bounded horizon (illustrated at two days) past which a late element is no longer folded into that window's result. Used here as a concrete, widely used instance of the same bounded-reprocessing-window idea a warehouse pipeline needs — streaming terms for the same tradeoff, not a warehouse-specific source.

## Measured directly on this sandbox

URL: n/a — measured on this session's PostgreSQL sandbox (port 5432, a throwaway schema built for this topic and dropped immediately after)

Part one: a real `fact_order` row was inserted referencing a customer natural key with no existing dimension row. An inferred placeholder dimension row was created first (generic values, `is_inferred = true`), the fact loaded against it immediately, then — standing in for the real customer data arriving later — the same row was updated in place with real attributes and `is_inferred = false`: one dimension row throughout, never a second one.

Part two: a real three-version SCD2 history was built for a different customer (three address versions with non-overlapping effective/expiry windows, the last one current), and a real fact dated inside the middle version's own window was joined two ways: once to whichever row carried the current flag (landing on the third, wrong, version), and once on the fact's own event date against each version's effective/expiry window (landing on the second, correct, version) — two different surrogate keys from the same fact row, by join condition alone.
