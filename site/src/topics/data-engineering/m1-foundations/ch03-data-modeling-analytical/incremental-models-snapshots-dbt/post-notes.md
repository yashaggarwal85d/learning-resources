<section data-section="outcomes">

## Outcomes

An incremental strategy must fit both the fact table's own update pattern and the adapter
actually running it — this topic's own lab found `insert_overwrite`, a real documented
strategy, simply unsupported by its own local DuckDB adapter. A lookback window only protects
against a recent late arrival; a correction dated far in the past, as of when it actually
happened rather than when it arrived, slips past every lookback window and needs a full rebuild,
confirmed by a real missed correction in this lab. The default schema-change behavior is not an
error and not a refusal — it is silence: a new column is simply never written, confirmed by a
real binder error on a column dbt reported building successfully. `append_new_columns` fixes
that but still leaves every pre-existing row unbackfilled until a deliberate full refresh.
Snapshots are dbt's own automatic version of exactly the slowly-changing-dimension mechanism
this chapter already built by hand; which strategy a snapshot uses decides whether its own
valid-from time means something real about the data, or just means whenever dbt happened to run.

</section>

<section data-section="lab">

## Lab

Real hands-on lab (`lab/shop_dbt/`, `examples.py`), extending the previous topic's own project:
four incremental strategies built and run for real, a real missed late-arriving correction
fixed only by `--full-refresh`, a real three-stage schema-change demonstration, and two real
snapshot strategies run twice around an actual source change. `lab/README.md` has the exact
commands and dbt's own real output for every one of these.

</section>

<section data-section="production">

## Production failures this topic warns about

**A team that widens a lookback window every time a late correction slips through, instead of
asking why.** Each widening works for the specific correction that prompted it and nothing
further back — this topic's own lab shows a lookback window cannot be widened enough to catch a
correction dated far enough in the past, no matter how generous the setting.

**A team that adds a column to a model and ships it without checking the existing table.**
The default behavior reports success with no warning while quietly never writing the new
column at all — a silent gap that surfaces only when someone queries for that column later and
gets a hard error, long after the "successful" deploy.

</section>

<section data-section="frontier">

## Frontier

dbt Fusion engine and SQLMesh both offer their own answers to schema drift and incremental
rebuilds (state-aware builds, virtual environment swaps), but both are marked `*(skipped)*` in
this chapter's own syllabus and are not covered here, consistent with the previous topic's own
scope boundary.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every model, test and incremental strategy in this chapter was still written and run by a
person, by hand, in SQL and Jinja. Next chapter starts from the language every one of these
pipelines is actually glued together in — Python — and where its own costs hide.

</section>
