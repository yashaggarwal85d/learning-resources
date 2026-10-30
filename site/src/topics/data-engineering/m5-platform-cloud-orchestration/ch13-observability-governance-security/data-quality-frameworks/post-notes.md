<section data-section="outcomes">

## Outcomes

Place a given check in a gate or a post-hoc scan and estimate its cost as a share of pipeline
compute; write the same not-null and uniqueness rule as a dbt test and a GX expectation and say
what each one actually computes; say what a dbt unit test catches that a dbt data test cannot;
compute a metric incrementally across partitions and show it equals the full recomputation; state
the GX stewardship facts exactly, with their source and date.

</section>

<section data-section="internals">

## Internals

`examples.py`'s `run_dbt_demo` writes a complete, real dbt project (a seed, one model, dbt's four
built-in generic data tests, one unit test) to a temp directory and runs the actual `dbt build`
command through the installed `dbt-core`/`dbt-duckdb` stack, then reads the real `run_results.json`
it produces. `run_gx_demo` builds a real `great_expectations` `ExpectationSuite` (uniqueness,
not-null, a value range) and validates it against the same synthetic rows as a pandas DataFrame.
`incremental_null_count` and `full_rescan_null_count` compute the identical metric two different
ways and are asserted equal; `sampled_null_estimate` takes a deterministic 1-in-10 stride over the
same data and is shown missing a known null entirely.

</section>

<section data-section="lab">

## Lab: none of its own as a syllabus lab leg

Per `CHAPTER.md`, this topic has no lab leg of its own; its worked examples run the frameworks on
the shop's synthetic data directly in the reveal steps, and the check set built here is what topic
13's self-serve registration flow and topic 14's planted bad partition both consume.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating "it's a gate" as automatically cheap.** A gate only means a check runs before publish
and can block — it says nothing about what the check itself costs. A gate that rescans an entire,
ever-growing table before every single publish gets more expensive every run, exactly like a
post-hoc scan would.

**Trusting a sample's zero as an all-clear.** A sampled estimate can report zero defects purely
because the sampling stride never happened to land on the one bad row — a real miss, not a smaller
number than the truth.

</section>

<section data-section="frontier">

## Frontier

Data observability by anomaly detection on warehouse metadata is the *(skipped)* syllabus topic
named once here: tests check known invariants someone wrote down in advance; observability finds
unknown unknowns nobody thought to assert. SLIs, SLOs and freshness alerts are topic 3 and Chapter
11's own subject, referenced, not repeated. Contract definition and CI enforcement, and
write-audit-publish, are Chapter 11 §11.4 — not built yet on this run (no `section: '11.4'` entry
exists in `registry.ts`), logged as a declared gap in `OUTLINE.md` rather than guessed.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Catalog, lineage and quality checks are tools. Tools do not decide who owns a table, who fixes a
failing check, or which rules a domain team may change. The next topic is the operating model that
puts people and policy around those tools: federated governance.

</section>
