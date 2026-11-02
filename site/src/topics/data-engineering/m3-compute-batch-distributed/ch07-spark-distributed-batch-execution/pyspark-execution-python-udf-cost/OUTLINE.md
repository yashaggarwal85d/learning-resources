# OUTLINE: de.pyspark-execution-python-udf-cost

Full topic, chapter 7's seventh. Syllabus line in full (§7.1): "row-at-a-time pickled Python UDFs
cross the JVM↔Python worker boundary and are opaque to Catalyst (cross-ref §2.1); Arrow-based
fixes: pandas UDFs, `mapInArrow`, Arrow-optimised Python UDFs (default-on since Spark 4.2) and
`@arrow_udf` (4.1); rule of thumb: built-in SQL expressions first, Arrow UDFs second, pickled UDFs
never on hot paths."

## Learning outcomes
1. State why Catalyst cannot fuse a Python function the way it fuses its own operators.
2. Name the pickled UDF's own mechanism: every row pickled individually across the process boundary.
3. Measure and explain the three-way timing gap (built-in, Arrow UDF, pickled UDF) on the identical computation.
4. State the structural reason for the gap: crossing the boundary once per batch versus once per row.
5. Apply the rule of thumb to a given job: built-in first, Arrow second, pickled never on hot paths.

## Reel steps (final, matches reel.tsx) — 7 steps, 2 predicts (full topic requires ≥2), first at step 2 (index 1, within the first four)
1. Hook — a user's own Python function joins the pipeline: still fused in, or not?
2. Predict 1 — can codegen fuse a plain Python function the same way?
3. Reveal: opaque to Catalyst, pickled one row at a time (measured + sourced).
4. Reveal: the same computation, three real speeds (measured).
5. Predict 2 — both UDFs leave the JVM; why is Arrow still faster?
6. Reveal: Arrow crosses once per batch, pickling crosses once per row (measured + sourced).
7. Recap — three speeds, one structural reason, the rule of thumb.

## Engagement arc
- Hook: genuine ambiguity about where codegen's fusion actually stops.
- Predict 1 (step 2, index 1 ≤ 3): tempting wrong answer ("codegen can generate a call into anything").
- Predict 2 (step 5): tempting wrong answer ("Arrow just uses a faster format for the same crossing").
- Surprising numbers/facts: a plainly simple computation (doubling a number) still runs at three
  genuinely different speeds; both non-built-in paths leave the JVM, yet one is still dramatically
  faster than the other, for a structural reason rather than a format difference.
- Takeaways (3 explicit `takeaway` fields): step 4 (three real speeds from one cause), step 6
  (batch vs. row crossing), step 7/recap (the rule of thumb itself).
- Recap restates all three measured facts and the rule of thumb together.

## Narrator's line of thought (beyond description)
- Step 2: frames the predict around what codegen actually generates, not what counts as an operator.
- Step 3: states the sourced mechanism, then connects it directly to the measurement coming next.
- Step 4: states the three measured speeds plainly, in order.
- Step 5: frames the predict around "both cross the boundary," resisting the easy format answer.
- Step 6: states the sourced mechanism (batch vs. row) as the single structural cause.
- Step 7: names all three facts and the practical rule together, then hands off to the next topic.

## Post-notes layers
- Outcomes: fusion's hard stop; the pickled mechanism; the three-way gap; the rule of thumb.
- Internals: `mapInArrow` and `@arrow_udf`, the sibling Arrow entry points named, not independently timed.
- Production: reaching for a UDF on "just one column"; assuming Arrow is free rather than cheaper.
- Frontier: Arrow-optimised UDFs default-on since Spark 4.2, named as a version-specific fact this
  topic's own 4.0.1-targeted measurement predates on purpose.
- Where this goes next: uneven partitions, the next section's own harder constraint.

## Examples to execute (examples.py) and assertions
- `local[4]` session, AQE disabled, 3,000,000-row `range()`: the identical doubling computation,
  timed three ways (median of 3 repeated runs each): a built-in `col("a")*2` expression; a
  `pandas_udf`-decorated Arrow function; a plain `@udf`-decorated pickled function.
- Assertions: `t_builtin < t_arrow`; `t_arrow < t_pickled`; `t_arrow / t_builtin > 1.5`;
  `t_pickled / t_arrow > 1.1`; `t_pickled / t_builtin > 3` — thresholds set well inside the margin
  actually observed across repeated runs (builtin ~0.2-0.3s, Arrow ~0.6-1.4s, pickled ~1.5-2.1s).
- Requires `PYSPARK_PYTHON`/`PYSPARK_DRIVER_PYTHON` pointed at an interpreter with `pandas` and
  `pyarrow` installed, since the Arrow UDF path runs inside a Python worker subprocess that
  resolves its own interpreter independently of the driver's.
All assertions pass against real PySpark 4.0.1, Java 21, local mode (verified; terminal output in
session log).

## Bridge and handoff
- Bridge: "Codegen fuses Spark's own operators into one native loop. This topic is the one case
  that loop cannot include: a user's own Python function, which has to leave the JVM, cross a
  process boundary, and come back."
- Handoff: "Everything so far assumed one job running once. The next section turns to the same
  shuffle and the same operators under a harder constraint: a partition that isn't evenly sized,
  which is where most real jobs actually get slow."

## Concept ledger
- Introduces: `spark-python-udf-boundary`, `spark-arrow-udf`.
- Uses: `spark-whole-stage-codegen`.
- Declared: none.

## Claims list (claim → source)
1. Input rows are grouped into network batches, but added to the pickling queue one row at a
   time → `BatchEvalPythonExec.scala` (Apache Spark source, GitHub).
2. A pandas UDF is executed using Arrow to transfer data, allowing vectorized, batch-at-a-time
   operations → `pandas/functions.py`, `pandas_udf` docstring (Apache Spark source, GitHub).
3. The three-way timing gap itself, and its direction (built-in fastest, Arrow in the middle,
   pickled slowest) → measured directly, `examples.py`.

## Progress
Research, OUTLINE, fact-check, coverage map and every file built; checks run and green (build,
narration-teaches, reel test). Status: built, ready to ship as `status: 'held'`, narration queued
via `renarration.json` (no GPU in this cloud session). Next topic: 8/30,
de.partition-sizing-repartition-coalesce.
