# Outline — de.row-column-security-dynamic

## Syllabus line (full, six clauses)

"enforce in the query engine, not the application: row filters, column masks and dynamic masking
(Snowflake masking/row-access policies, Unity Catalog ABAC, BigQuery row-level security and
policy tags, Lake Formation, Trino with Ranger/OPA), the impact on pruning and caching, and
bypass paths (direct file reads, extracts, unprotected materialized views)."

Clauses used verbatim in `coverage.json`:
1. "enforce in the query engine, not the application"
2. "row filters, column masks and dynamic masking"
3. "Snowflake masking/row-access policies, Unity Catalog ABAC, BigQuery row-level security and
   policy tags, Lake Formation, Trino with Ranger/OPA"
4. "the impact on pruning and caching"
5. "bypass paths (direct file reads, extracts, unprotected materialized views)"

## Concept ledger

- `introduces`: `row-column-policies-in-engine` (row filters and column masks enforced at every
  point a column or row is read, not in application code), `policy-pruning-caching-cost` (what a
  policy does to a query plan — pushdown vs post-filter, cache keyed per principal),
  `policy-bypass-paths` (direct file read, extract, unprotected materialized view).
- `uses`: `policy-decision-enforcement-points`, `policy-engines-opa-cedar`, `abac-tag-based-policy`
  (topic 7); `sensitivity-tier-and-category` (topic 4); `dek-kek-envelope-hierarchy` (topic 5,
  mentioned only as the defence against the direct-file-read bypass); `explain-triage` (Chapter 2
  §2.4 — confirmed built and live).
- No declared gaps this topic: every cross-chapter id `CHAPTER.md` cites (`explain-triage`)
  resolves to a built, live topic.

## Storyboard (11 steps)

1. **Hook** — the shop masks `customers.email` for the analyst role; an analyst still recovers
   addresses. Three paths were tried: a query that filters on the masked column, a query on a
   derived table nobody masked, and a direct read of the underlying Parquet file.
2. **Predict** — for each of the three paths, did the policy cover it or not?
3. **Reveal: engine, not application** — the policy is enforced right where the column is read,
   inside the engine, at every place that column appears — not in application code that only
   protects requests that go through it. (clauses 1–2)
4. **Reveal: a row policy, mechanically** — Postgres `CREATE POLICY`: the policy expression runs
   for every row before the user's own conditions, except for leakproof functions the optimizer
   may run earlier; superusers, `BYPASSRLS` roles and (normally) the table owner bypass it.
5. **Reveal: five engines, one shared idea** — Snowflake's masking and row-access policies,
   Unity Catalog's row filters and column masks, BigQuery's row-level security, Lake Formation's
   data filters, Trino's OPA-backed row filters and column masks: each is the same idea — an
   engine-side policy evaluated at read time — expressed in its own vocabulary. (clause 3)
6. **Reveal: what it costs the plan** — a pushed-down row policy filters at the scan, so the
   rows-examined count drops to what the policy actually allows; a policy that isn't pushed down
   scans everything first and filters after, and masking defeats a cache keyed before the mask is
   applied. (clause 4)
7. **Reveal: the derived table nobody masked** — a materialized view or derived table built from
   the data before the mask existed keeps serving the values it was built with; the engine treats
   it as a table like any other, with no idea the source was ever masked. (clause 5, takeaway)
8. **Reveal: the extract that already left** — an export or extract made before, or outside, any
   policy carries the original values with it; the policy only governs queries against the live
   table, not copies already taken. (clause 5, takeaway)
9. **Reveal: the direct file read** — anyone with read access to the bucket or file path reads
   the raw Parquet underneath the engine entirely, skipping every policy the engine enforces;
   topic 5's file-level encryption is the only defence against this specific path. (clause 5,
   takeaway)
10. **Recap** — engine-side enforcement beats application-side because it covers every caller;
    five engines, one idea; a policy has a cost in the plan; and three paths — a stale derived
    table, an old extract, a direct file read — sit entirely outside what any of it reaches.
11. **Prove it** — a new scenario: a column mask is added to `ssn` today. A CSV export was taken
    last month, and a materialized view was last refreshed the day before the mask was added.
    Which of the two still carries unmasked values right now: just the export, or both?

## Changes from the chapter plan

None — every cross-chapter `uses` id resolves (Chapter 2's `explain-triage` is built and live),
so there is no declared gap to log for this topic, unlike topics 6 and 7.

## Engagement placement

- Hook + first predict: steps 1–2 (within the first four).
- Takeaways: steps 7, 8, 9 — all after the reel's own midpoint (step 5–6 of 11).
- Recap: step 10, immediately before Prove It, matching the chapter's established pattern.
- Second predict: step 11 ("Prove it"), applying the bypass-path distinction to a scenario with
  two specific artefacts (an export, a materialized view) rather than recalling step 7–8's claims
  directly.
