Last verified against these sources: 22 October 2026, with the periodic-snapshot,
accumulating-snapshot, and factless demonstrations run directly on this session's PostgreSQL
sandbox against a throwaway account-balance pair, a throwaway order-fulfillment pipeline row, and a
throwaway student-coverage pair, all built for this topic and dropped afterward. Expert sign-off:
pending.

- Kimball Group, "Transaction Fact Tables": [kimballgroup.com](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/transaction-fact-table/). One row per measurement event.
- Kimball Group, "Periodic Snapshot Fact Tables": [kimballgroup.com](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/periodic-snapshot-fact-table/). One row per period, dense by grain.
- Kimball Group, "Accumulating Snapshot Fact Tables": [kimballgroup.com](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/accumulating-snapshot-fact-table/). One row, updated as the pipeline moves.
- Kimball Group, "Factless Fact Tables": [kimballgroup.com](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/factless-fact-table/). No measure; coverage minus activity.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=fact-table-types:%20).
