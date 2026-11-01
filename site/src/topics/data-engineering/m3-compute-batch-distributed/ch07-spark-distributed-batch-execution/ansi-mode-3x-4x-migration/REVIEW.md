# Review: de.ansi-mode-3x-4x-migration

## Content review

All three measured claims (integer overflow, a malformed string-to-INT cast, and the
independent store-assignment policy) worked on the first real run of `examples.py` against a
live PySpark 4.0.1 session -- no streaming or timing-control machinery needed, just plain
`spark.sql(...)` calls with `spark.conf.set` toggling the two settings between them. Two full
runs produced identical pass/fail outcomes.

CHAPTER.md names "Spark 4.0 release notes" and the "ANSI Compliance" docs as this topic's
sources; the Java 17/Scala 2.13/Mesos scope item needed the release notes specifically (the
ANSI Compliance and migration-guide pages don't mention them), so the release notes were kept
as a distinct third `SOURCES.md` entry alongside the ANSI Compliance docs and the migration
guide's own 3.5-to-4.0 section, rather than folding all three into two.

## Looks review

`scenes.tsx` needed five `Row` label/value pairs shortened on the first pass (4-word labels
like "every example so far" and "max int plus one") -- the same recurring pattern earlier
chapter topics hit, worth budgeting for from the first draft rather than catching in review.
`reel.tsx`'s build check caught two literal digits in body text ("32-bit", "3.5") that
`examples.py` doesn't compute or assert -- rephrased as "the largest signed integer its type
can hold" and "an older job". Predicts land at steps 3 and 6 (index 2 and 5); all three
takeaways passed the 20-word limit on the first draft.
