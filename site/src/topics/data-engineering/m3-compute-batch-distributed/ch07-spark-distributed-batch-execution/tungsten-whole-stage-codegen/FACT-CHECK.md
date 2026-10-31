# Fact-check: de.tungsten-whole-stage-codegen

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | WholeStageCodegen compiles a subtree of codegen-supporting plans together into a single Java function | Confirmed | `sources/whole-stage-codegen-exec.txt`, quoted verbatim in `SOURCES.md`; `scripts/sources.mjs check` passes. |
| 2 | A real plan fuses Range, Filter, and Project under one shared stage marker, `*(1)` | Confirmed | Measured directly: `examples.py`, `plan_str.count("*(1)") == 3`. |
| 3 | Spark's own codegen report independently confirms one fused subtree, not three | Confirmed | Measured directly: `examples.py`, `"Found 1 WholeStageCodegen subtrees." in codegen_text`, reached via `spark.sparkContext._jvm...debug.package.codegenString`. |
| 4 | Whole-stage codegen's purpose is hand-written-code performance from a general-purpose engine, by generating and executing code per fragment rather than relying on operators at runtime | Confirmed | `sources/databricks-compiler.txt`, quoted verbatim. |
| 5 | The prior Volcano iterator model called `next()` one tuple at a time between operators | Confirmed | Same source, quoted exactly. |
| 6 | The generated Java source writes rows through `UnsafeRowWriter`, into `UnsafeRow` | Confirmed | Measured directly: `examples.py`, `"UnsafeRowWriter" in codegen_text` and `"UnsafeRow" in codegen_text`. |
| 7 | The vectorised Parquet reader reports `Batched: true` and carries no stage marker of its own | Confirmed | Measured directly: `examples.py`, `"Batched: true" in parquet_plan`, `file_scan_line` doesn't start with `*`. |
| 8 | A separate `ColumnarToRow` node, marked `*(1)`, bridges the columnar reader into the fused pipeline | Confirmed | Measured directly: `examples.py`, `"*(1) ColumnarToRow" in parquet_plan`. |
| 9 | Forcing `spark.sql.codegen.maxFields` to 0 removes every stage marker from the plan | Confirmed | Measured directly: `examples.py`, `"*(1)" not in fallback_plan`. |
| 10 | The codegen report itself confirms zero subtrees under the forced fallback, not a smaller count | Confirmed | Measured directly: `examples.py`, `"Found 0 WholeStageCodegen subtrees." in fallback_codegen_text`. |

## Red team

- **Why force the field-count fallback trigger instead of the 64KB generated-method size limit?**
  The field-count trigger (`spark.sql.codegen.maxFields`) is directly settable to an extreme value
  (0) that deterministically forces every stage over it in one line, in any query shape. Reliably
  constructing a query whose generated method exceeds 64KB of bytecode on its own, without relying
  on an unstable or version-specific operator count, isn't a clean, deterministic measurement —
  disclosed in `coverage.json`'s expert list as the sibling trigger, named not independently forced.
- **Is reading `debug.codegen()`'s output through the JVM gateway (`spark.sparkContext._jvm`)
  a legitimate, stable way to measure this, given PySpark has no public wrapper for it?** Yes —
  `org.apache.spark.sql.execution.debug.package.codegenString` is the same public Scala object
  Spark's own `df.queryExecution.debug.codegen()` convenience method calls internally; reaching it
  through the gateway calls the identical method, not a private or unstable internal API.
- **Could AQE have changed which operators actually got fused, undermining the fusion
  measurement?** No — `spark.sql.adaptive.enabled` is explicitly set to `false` for the whole
  session (see `examples.py`'s own docstring and config), so the measured plan reflects Catalyst's
  own up-front physical plan, not a runtime-adjusted one.
- **Is the Databricks blog (2016) current enough for Spark 4.0's own whole-stage codegen?** The
  mechanism it describes (operator fusion into one generated function, replacing the Volcano
  model) is the same mechanism this topic's own `WholeStageCodegenExec.scala` (tag v4.0.0) quote
  confirms is still the class's stated purpose; the blog is used for the historical motivation and
  naming, not for any version-specific implementation detail.

No corrections were needed to `OUTLINE.md` beyond settling on the field-count fallback trigger
during drafting itself (the same kind of deterministic-measurement choice topic 5's FACT-CHECK made
for cost-based reordering).
