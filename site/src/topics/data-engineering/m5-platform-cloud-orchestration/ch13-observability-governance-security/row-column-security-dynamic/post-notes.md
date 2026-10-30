<section data-section="outcomes">

## Outcomes

Write a Postgres row policy and a column mask and show them applied to two roles; show on
`EXPLAIN` what a policy does to the plan and measure the rows-examined difference; explain why an
engine-side policy is stronger than an application filter and list three ways data still escapes
it; map one policy intent to the five named engines' mechanisms without claiming more than each
one's documentation says.

</section>

<section data-section="internals">

## Internals

`examples.py`'s `row_policy_filter` and `column_mask` are deliberately plain list comprehensions,
not a Postgres or Snowflake simulation, because the point is structural: a policy narrows what a
query against the live table returns, and `rows_examined` makes concrete what a pushed-down
filter buys over one that isn't — fewer rows touched at the scan, not just fewer rows in the
final output. `direct_file_read_bypass`, `unprotected_derived_table_bypass` and
`extract_taken_before_mask_bypass` all return the same unmasked data by design: each represents a
path that never calls `masked_query_through_engine` at all, which is exactly why none of them see
the mask.

</section>

<section data-section="lab">

## Lab: none of its own

This topic hosts no lab of its own (`CHAPTER.md`'s own line for it). The Postgres row policy and
column mask built here are the executable evidence for the engine-vs-application claim, and the
policy designed in topic 7 (analysts may read tier confidential or below, never category PII
without a purpose attribute) is the one this topic enforces mechanically.

</section>

<section data-section="production">

## Production failures this topic warns about

**Trusting a mask that a cache pre-dates.** A query result cached before a masking policy was
added, or before a role's attributes changed, can keep handing back unmasked values until that
cache entry expires or is explicitly invalidated — the mask is correct, the cache just predates
it.

**Treating "the table has a policy" as "the data is protected."** A materialized view, an export,
or a direct file read all sit on data that came from the protected table, but none of them go
through the policy evaluation that protects queries against the live table itself. Each needs its
own control — a refresh schedule tied to the policy, access controls on the export, encryption on
the files — because the row/column policy itself doesn't reach any of them.

</section>

<section data-section="frontier">

## Frontier

Fine-grained masking that varies by more than role — dynamic masks that read request context (the
caller's location, the time of day, a declared purpose) rather than a fixed role-to-value mapping
— is in scope for some of the five engines' own newer features but not covered here; CHAPTER.md
scopes this topic to the row/column mechanism and its bypass paths, not every masking variant each
vendor ships. No declared cross-chapter gap this topic: the one id `CHAPTER.md` cites,
`explain-triage`, resolves to a built, live topic (`de.reading-explain-across-engines`).

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Everything so far assumed the data can be changed or hidden after the fact. A lakehouse is built
so that nothing is overwritten: every old snapshot is still there. The next topic is what "delete
this person" means in a system designed to forget nothing.

</section>
