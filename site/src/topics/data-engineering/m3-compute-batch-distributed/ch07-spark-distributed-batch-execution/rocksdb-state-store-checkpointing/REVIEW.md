# Review: de.rocksdb-state-store-checkpointing

## Content review

CHAPTER.md's named second source ("Databricks engineering blog on RocksDB state store at
scale") couldn't be located under that description -- no such post naming "checkpoint structure
v2" was found. The actual primary source for that scope item turned out to be the Apache Spark
JIRA epic SPARK-49374 itself, substituted here and documented in `SOURCES.md`'s own naming note.
That epic is still Open/Unresolved with no fix version, which settled a scoping question on its
own: checkpoint structure v2 is sourced-only in this topic, not because it was skipped, but
because it genuinely isn't present in the Spark 4.0.1 every other measured claim in this chapter
runs against.

`examples.py` went through one real design correction: the first attempt used the
`rate-micro-batch` source with `processAllAvailable()` called in a loop to control batch count
precisely, but that source's own "available" offset keeps advancing whenever polled, so
`processAllAvailable()` never returned. Switched to the plain `rate` source with a fixed
trigger interval and `time.sleep()`, the same pattern this chapter's earlier streaming topics
already established, which ran deterministically. Two full runs of the final script produced
consistent passes with comfortable margin on both the GC-time and checkpoint-byte-count
assertions.

## Looks review

`scenes.tsx` follows the chapter's established `Row` kit pattern; one Row pair ("leans on the
store" / "what that store is", both 4 words in the Hook step) needed shortening on the first
pass. Predicts land at steps 3 and 6 (index 2 and 5); all three takeaways needed trimming from
21-27 words down to 20 or fewer on the first draft -- a recurring pattern across this chapter
worth budgeting for earlier in future topics rather than catching every time in review.
