# Outline: de.row-column-security-dynamic

1. **Hook.** The shop masks `customers.email` for the analyst role, and an analyst still
   recovers addresses: one query filters on the masked column, one reads a derived table nobody
   masked, one reads the Parquet file straight from the bucket. Which did the policy fail to
   cover, and which did it cover but leak through a side channel?
2. **Reveal: a policy enforced in the engine applies to every query; an application filter
   only applies to requests that go through that application.** [from]
3. **Predict: query as the restricted role before any row policy exists. How many rows come
   back?** [idx2]
4. **Reveal: all 3,000 rows, measured directly -- nothing stops the query yet.**
5. **Elaborate: a row-security policy is an expression evaluated before the user's own query
   conditions.** [takeaway1] PostgreSQL's own documentation: evaluated per row, ahead of the
   user's WHERE, except for leakproof functions.
6. **Predict: the same query, same role, after the policy is applied. How many rows now?**
   [idx5]
7. **Reveal: exactly 1,000 rows, measured directly -- the policy, not the query, decided.**
8. **Elaborate: the plan itself changes -- EXPLAIN shows no Filter node before the policy, one
   after it.** [takeaway2] Databricks' own documentation: when the engine must choose between
   optimisation and leakage, it always makes the secure choice.
9. **Reveal: a superuser bypasses the policy entirely, and so does anyone with the bucket
   path.** The measured bypass, standing in for the direct-file-read and unprotected-view paths
   this topic names.
10. **Recap.** [takeaway3]
