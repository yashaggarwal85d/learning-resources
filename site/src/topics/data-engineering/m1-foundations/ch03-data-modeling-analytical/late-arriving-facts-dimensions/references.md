Last verified against these sources: 22 October 2026, with the inferred-member resolve and the
as-of join run directly on this session's PostgreSQL sandbox against throwaway tables built for
this topic and dropped afterward. Expert sign-off: pending.

- Kimball Group, "Late Arriving Dimension": [kimballgroup.com](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/late-arriving-dimension/). A placeholder row, a Type 1 overwrite later.
- Kimball Group, "Late Arriving Fact": [kimballgroup.com](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/late-arriving-fact/). Search for the keys effective when the event occurred.
- Apache Beam Programming Guide, "Watermarks and late data": [beam.apache.org](https://beam.apache.org/documentation/programming-guide/). Allowed lateness, a named bounded horizon.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=late-arriving-facts-dimensions:%20).
