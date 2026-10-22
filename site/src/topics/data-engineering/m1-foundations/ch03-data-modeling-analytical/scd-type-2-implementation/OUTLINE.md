# Outline — de.scd-type-2-implementation

1. Hook: one customer, one changed address — keep both versions, or overwrite the truth?
2. Reveal: SCD Type 2, quoted directly (a new row, a new surrogate key, the old one left alone).
3. Predict: does a single MERGE statement expire the old row and insert the new one at once?
4. Reveal: MERGE, quoted directly (one statement, conditional insert/update/delete, no procedural steps).
5. Reveal: the MERGE load, measured (one real statement, two rows changed, atomically).
6. Predict: does running the identical load again change anything?
7. Reveal: idempotency, measured (the identical MERGE, run twice, changes zero rows the second time).
8. Reveal: hash-diff detection (why comparing one hash beats comparing every column by hand).
9. Predict: does a change feed replayed out of order and with a duplicate still converge correctly?
10. Reveal: the replay, measured (three distinct versions, correctly chained, regardless of arrival order).
11. Reveal: the as-of query, measured (the middle version recovered exactly for a date inside its own window).
12. Recap.
13. Prove it: a feed arrives twice, fully duplicated start to finish — does the rebuild still converge?
