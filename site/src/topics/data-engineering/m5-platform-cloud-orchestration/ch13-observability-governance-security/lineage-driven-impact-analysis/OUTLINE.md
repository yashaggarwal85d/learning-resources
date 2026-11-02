# Outline: Lineage-driven impact analysis (`de.lineage-driven-impact-analysis`)

**Hook:** renaming `orders.cust_id`. The catalog says three tables use it; the planted truth is
eleven downstream tables and two dashboards depend on it through other columns, plus one
nightly export that reads it by name in an uninstrumented script. How many owners need
telling, and how many will you miss even with perfect lineage?

**Predicts:** (1) the count from table-level lineage vs. column-level lineage vs. the unseen
reader; (2) whether column lineage ever makes the count worse, not just better.

## Steps

1. **Hook.** The rename, the catalog's undercount, the planted truth, the uninstrumented
   export nothing will ever flag.
2. **Reveal: blast radius, defined.** Given a proposed change, walk the lineage graph
   downstream to list every affected node; the score is the count, weighted by tier and
   directness -- a change touching nothing downstream scores zero and needs no extra review.
3. **Predict 1.** For dropping one column: does table-level lineage, column-level lineage, or
   neither find every real dependent -- and can column-level lineage ever find fewer than
   table-level?
4. **Reveal 1.** Measured: column-level lineage finds fewer, more precise dependents than
   table-level, because table-level flags every consumer of the whole table even when they
   never touch the changed column.
5. **Takeaway 1.** Precision isn't free: a narrower blast radius can mean a safer change gets
   approved faster, or it can mean a real dependent slips through if the column edge was never
   recorded.
6. **Elaborate: stale-table propagation.** When an upstream run fails or lands bad data, walk
   the same graph forward marking every downstream dataset "potentially stale because of X,"
   bounded by exactly the same coverage gaps as topic 11's own lineage collection.
7. **Elaborate: owner notification and deprecation.** Resolve each affected node to its owner
   from the catalog, deduplicate so one owner gets one message for ten affected tables, and run
   the same resolve-and-notify step as a deprecation's announce/track/escalate workflow.
8. **Predict 2.** The planted truth: eleven real downstream tables and dashboards, one
   unwired export. How many owners get notified by a perfect column-level walk, and how many
   are missed regardless?
9. **Reveal 2.** Measured: the column-level walk correctly notifies every owner the graph can
   reach; the one unwired export is never notified, because no event was ever emitted for it --
   not a bug in the walk, a permanent gap in what was ever recorded.
10. **Takeaway 2 / Recap.** A lineage graph can only be as complete as its own instrumentation;
    the honest answer to "how many will you miss" is never zero.

## Coverage mapping (syllabus clause → steps)

- blast-radius scoring → steps 2-5
- stale-table propagation → step 6
- automated notification of dependent owners → step 7
- deprecation workflows → step 7
- lineage as incident-triage/contract-enforcement backbone → step 2 (named), 7
- the permanent coverage gap → steps 8-10
