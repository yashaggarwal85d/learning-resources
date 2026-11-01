# Review: de.pipelined-mpp-staged-batch

## Content review

CHAPTER.md's lab (a pandas-UDF batch transform on Spark vs a plain Python generator standing
in for Ray Data's operator-level streaming, with GPU-utilisation sourced from Ray's own docs)
is reproduced CPU-only and scaled down, since the builder's machine has no GPU: a NumPy-
vectorised batch computation vs the identical computation run one row at a time, and a
streaming-vs-materialising memory comparison, both measured directly and both passing on two
separate runs of `examples.py`. An initial, more ambitious attempt to directly demonstrate
Spark's stage-recovery granularity by deleting a shuffle file mid-job crashed the whole
driver rather than producing a clean partial retry, and was abandoned in favor of the two
measured claims actually used, documented in `FACT-CHECK.md`'s "Abandoned approaches" section.
`coverage.json`'s clause is CHAPTER.md's own scope text for 7.7, matched against the syllabus
file directly; it required no markdown-stripping adjustment since the clause contains no
asterisks or backticks. `trino.query-execution`, named in CHAPTER.md's `Uses` line, is recorded
as `declared` in `registry.ts` rather than `uses`, since no Trino topic is live in the registry
yet.

## Looks review

All three `reel.tsx` takeaways were initially over the twenty-word limit (twenty-three,
twenty-one and twenty-two words respectively) and were each trimmed to exactly twenty words or
fewer on review. Six `scenes.tsx` `Row` label/value pairs were shortened past the three-word
limit on the first pass (for example, "one row at a time" to "one row", "fails the whole query"
to "fails the query"). Predicts land at step indices 2 and 5, matching `OUTLINE.md`. No raw
digits appear in `reel.tsx`'s body or fig text; the word "twenty-nine" is spelled out rather
than numeral.
