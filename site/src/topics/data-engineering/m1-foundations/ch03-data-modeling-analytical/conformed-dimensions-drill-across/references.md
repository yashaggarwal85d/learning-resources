Last verified against these sources: 22 October 2026, with the fan-out and aggregate-first
demonstrations run directly on this session's PostgreSQL sandbox against a throwaway orders fact
and a throwaway support-tickets fact, both built for this topic and dropped afterward. Expert
sign-off: pending.

- Kimball Group, "Conformed Dimensions": [kimballgroup.com](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/conformed-dimension/). Same column names, same domain contents.
- Kimball Group, "Drilling Across": [kimballgroup.com](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/drilling-across/). Separate queries, aligned by sort-merge.
- Kimball Group, "Enterprise Data Warehouse Bus Architecture": [kimballgroup.com](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/kimball-data-warehouse-bus-architecture/). The bus matrix as a planning tool.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=conformed-dimensions-drill-across:%20).
