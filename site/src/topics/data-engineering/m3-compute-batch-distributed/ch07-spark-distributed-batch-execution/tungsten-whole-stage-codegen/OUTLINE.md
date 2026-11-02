# OUTLINE: de.tungsten-whole-stage-codegen

Full topic, chapter 7's sixth. Syllabus line in full (§7.1): "UnsafeRow binary layout outside JVM
object overhead; fusing a pipeline of operators into one generated Java method compiled by Janino
(no virtual `next()` per row, values in registers); the vectorised Parquet/ORC reader as the
columnar exception; when codegen silently falls back (huge methods, too many fields) and how to
see it."

## Learning outcomes
1. Read a plan's shared `*(N)` stage marker and name which operators one generated method covers.
2. State what the generated code actually does with a row (UnsafeRow via UnsafeRowWriter), not a JVM object.
3. Recognise the vectorised Parquet reader as outside codegen entirely, bridged in by ColumnarToRow.
4. Recognise a codegen fallback from the plan's own markers (or their absence), confirmed against Spark's own codegen report.

## Reel steps (final, matches reel.tsx) — 9 steps, 3 predicts (full topic requires ≥2), first at step 3 (index 2, within the first four)
1. Hook — three chosen operators: one loop each, or something else entirely?
2. Reveal: fused stage marker, one subtree reported — measured.
3. Predict 1 — does the generated method hold each row as an ordinary object?
4. Reveal: UnsafeRow via UnsafeRowWriter, not an object — measured.
5. Predict 2 — does the vectorised Parquet reader share the same stage marker?
6. Reveal: Parquet scan has no marker; ColumnarToRow bridges it in — measured.
7. Predict 3 — forcing every stage over the field limit: fewer markers, or none?
8. Reveal: zero markers, zero subtrees reported — measured.
9. Recap — fusion, UnsafeRow, columnar exception, silent fallback, all visible in the plan.

## Engagement arc
- Hook: genuine ambiguity about what actually replaces three separate per-row operator calls.
- Predict 1 (step 3, index 2 ≤ 3): tempting wrong answer ("generated code still needs an object").
- Predict 2 (step 5): tempting wrong answer ("it feeds the same pipeline, so it shares the marker").
- Predict 3 (step 7): tempting wrong answer ("some smaller stages survive a lower limit").
- Surprising numbers/facts: three separate operators sharing one marker; the generated source
  writing raw bytes directly; a reader with no marker at all that isn't broken; every marker in
  the whole plan disappearing at once, not shrinking in count.
- Takeaways (3 explicit `takeaway` fields): step 4 (UnsafeRow vs objects), step 6 (columnar reader
  sits outside codegen), step 8 (fallback is silent unless checked for directly).
- Recap restates all four measured facts together as one picture.

## Narrator's line of thought (beyond description)
- Step 2: states the measured marker fact, then the independent confirmation from the report.
- Step 3: frames the predict around what Tungsten is trying to avoid, not implementation ease.
- Step 4: states the generated call and the structure it writes into, plainly.
- Step 5: frames the predict around what a vectorised reader does differently from the rest.
- Step 6: states the scan's own report line, then the bridging node's own marker.
- Step 7: frames the predict around whether fusion happens stage by stage or all at once.
- Step 8: states the marker disappearance and the report's independent confirmation together.
- Step 9: names all four facts as one connected picture, then hands off to the next topic.

## Post-notes layers
- Outcomes: reading the shared marker; UnsafeRow via UnsafeRowWriter; the columnar exception;
  recognising and confirming a fallback.
- Internals: Janino as the compiler codegen hands source to (named, not independently profiled);
  ORC's own vectorised reader (named, Parquet measured instead); the 64KB method-size fallback
  trigger, the sibling to the field-count trigger this topic forces.
- Production: mistaking a silent fallback for "just Python"; misreading the columnar exception's
  own missing marker as a broken fallback.
- Frontier: codegen fusion stopping at a non-codegen-supporting operator, splitting one plan into
  several independently fused subtrees.
- Where this goes next: the pickled Python UDF, the one path codegen cannot touch at all (next topic).

## Examples to execute (examples.py) and assertions
- `local[4]` session, AQE disabled: a range → filter → project query's executed plan contains
  `*(1)` exactly three times (Range, Filter, Project all fused); `debug.codegen()`'s own report
  (reached via the JVM gateway) states "Found 1 WholeStageCodegen subtrees."
- The same report's generated source contains both `UnsafeRowWriter` and `UnsafeRow`.
- A real Parquet round-trip (write then read, filtered): the executed plan contains `Batched:
  true`; the `FileScan parquet` line itself does not start with a `*`; a separate `*(1)
  ColumnarToRow` node does.
- With `spark.sql.codegen.maxFields` set to `0`: the identical query's executed plan contains no
  `*(1)` anywhere, and the codegen report states "Found 0 WholeStageCodegen subtrees."
All assertions pass against real PySpark 4.0.1, Java 21, local mode (verified; terminal output in
session log).

## Bridge and handoff
- Bridge: "Catalyst chose the physical plan's operators. This topic is how Spark runs them fast:
  not one virtual-call interpreter loop per row, but one generated method per stage, with rows
  stored as raw bytes instead of JVM objects."
- Handoff: "Codegen is the fast, common path. The very next topic is the one execution path it
  cannot touch at all — a pickled Python UDF — and exactly why that costs so much more."

## Concept ledger
- Introduces: `spark-tungsten-unsaferow`, `spark-whole-stage-codegen`.
- Uses: `spark-catalyst-pipeline`.
- Declared: none.

## Claims list (claim → source)
1. WholeStageCodegen compiles a subtree of codegen-supporting plans together into a single Java
   function → `WholeStageCodegenExec.scala` (Apache Spark source, GitHub).
2. Whole-stage code generation collapses operators, where possible, into one function generated
   and executed at runtime, aiming for hand-written-code performance from a general-purpose
   engine → Databricks Engineering Blog, "Apache Spark as a Compiler."
3. The Volcano iterator model this replaces called `next()` one tuple at a time between operators
   → same source.
4. The fused marker, the UnsafeRow/UnsafeRowWriter generated code, the columnar exception, and the
   forced fallback's marker disappearance → measured directly, `examples.py`.

## Progress
Research, OUTLINE, fact-check, coverage map and every file built; checks run and green (build,
narration-teaches, reel test). Status: built, ready to ship as `status: 'held'`, narration queued
via `renarration.json` (no GPU in this cloud session). Next topic: 7/30,
de.pyspark-execution-python-udf-cost.
