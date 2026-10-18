- **Primary / unique key**: a column or set of columns whose values never repeat in a table. *Where you meet it:* `customer_id` in `customers`.
- **Outer join**: a join that keeps unmatched rows of one side, filling the other side with NULLs. *Where you meet it:* `LEFT JOIN`.
- **Correlated subquery**: a subquery that refers to a column of the outer query. *Where you meet it:* `EXISTS (SELECT 1 FROM c WHERE c.id = o.customer_id)`.
- **Semantics-preserving**: a transformation that never changes the result. *Where you meet it:* refactoring a function without changing what it returns.

**Check yourself:** after `a LEFT JOIN b`, can `WHERE b.y = 42` ever be true for a row where b was missing? (Answer: no, b.y is NULL there, and NULL = 42 is unknown.)
