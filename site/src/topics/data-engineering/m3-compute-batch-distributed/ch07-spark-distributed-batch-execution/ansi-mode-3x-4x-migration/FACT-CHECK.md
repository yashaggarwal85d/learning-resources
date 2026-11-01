# Fact-check: de.ansi-mode-3x-4x-migration

## Claims table

| Claim | Basis | Check |
|---|---|---|
| An integer overflow raises `SparkArithmeticException` with ANSI mode on | Measured (`examples.py`) | `python3 examples.py` assertions, passing |
| The identical overflow wraps to a negative number with ANSI mode off | Measured | same |
| Casting `'a'` to INT raises `SparkNumberFormatException` with ANSI mode on | Measured | same |
| The identical cast returns NULL with ANSI mode off | Measured | same |
| `try_cast` and `try_add` return NULL on the same inputs even with ANSI mode on | Measured | same |
| Inserting a non-numeric string into an INT column raises `AnalysisException` under `storeAssignmentPolicy=ANSI` | Measured | same |
| The identical insert silently converts under `storeAssignmentPolicy=LEGACY` | Measured | same |
| `spark.sql.ansi.enabled` is on by default since Spark 4.0 | Sourced, Spark migration guide | `sources.mjs check`, word for word |
| Spark 4.0 drops Scala 2.12 (making 2.13 the default), drops JDK 8/11 (making JDK 17 the default), and drops Mesos support | Sourced, Spark 4.0.0 release notes | same |

## Red team

- **Could the overflow and cast exceptions be coming from something other than ANSI mode --
  a generic Spark SQL parse error, say?** The exception class and error code are checked
  directly (`SparkArithmeticException` / `ARITHMETIC_OVERFLOW`, `SparkNumberFormatException` /
  `CAST_INVALID_INPUT`), and the identical expression is run again with ANSI mode toggled off in
  the same session, succeeding without error both times -- isolating the setting as the cause.
- **Is toggling `spark.conf.set` mid-session a faithful stand-in for the setting's real
  default-vs-off behavior, rather than some session-scoped quirk?** `spark.sql.ansi.enabled` is
  documented as an ordinary SQL config, settable per-session or per-query exactly this way; this
  topic's own default-vs-off comparison exercises the same config the Spark SQL migration guide
  names as flipping its default in 4.0.
- **Could `try_cast`/`try_add` returning NULL just reflect ANSI mode being off for that
  particular call, rather than the functions' own designed behavior?** Both calls run with
  `spark.sql.ansi.enabled` explicitly set to `"true"` immediately beforehand, in the same
  session as the plain `CAST`/`+` that raised -- isolating the function choice, not the session
  setting, as what changed.
- **Is the store-assignment claim actually independent of `spark.sql.ansi.enabled`, or did the
  examples accidentally leave ANSI mode on throughout, conflating the two settings?** ANSI mode
  is left on (true) for both the ANSI-store-assignment and LEGACY-store-assignment inserts in
  `examples.py`; only `spark.sql.storeAssignmentPolicy` changes between them, directly isolating
  that setting as the one governing the insert's own behavior.

## Abandoned approaches

None -- the three measured claims (arithmetic overflow, malformed cast, store-assignment
policy) each worked on the first real run of `examples.py` against a live PySpark 4.0.1
session, using plain `spark.sql(...)` calls with no streaming or timing-control machinery
needed.
