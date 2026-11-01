# Review: de.checkpoints-exactly-once-boundaries

## Content review

The chapter's own hook ("killing the driver mid-batch and restarting from checkpoint") called
for a real crash-and-restart, not a simulated one in name only. Rather than trying to SIGKILL
the JVM mid-write (nondeterministic to time correctly), `examples.py` manipulates the checkpoint
directory directly: removing a commit-log entry (and its `.crc` sidecar -- missed on the first
attempt, which produced a `FileAlreadyExistsException` on restart instead of the intended
replay) reproduces exactly the on-disk state a real crash between "batch finished" and "commit
written" leaves behind, since that's the literal condition Spark's own recovery logic checks
for. This felt like the right level of "real" for this topic, as distinct from faking the
measurement itself.

The checkpoint-incompatibility probe (claim 3) initially passed with no assertion ever firing,
because the restarted query had no new data to process -- Spark only re-validates a stateful
operator's schema when an actual batch runs against it, so an empty restart from an incompatible
checkpoint succeeds silently. Fixed by writing one new input file before the schema-changed
restart, so a real batch exercises the incompatibility.

The Spark 4.2 release notes turned out to name almost exactly the "named sources/sinks checkpoint
compatibility" scope item verbatim (`DataStreamReader.name()`, sink `.name()`, a V3 commit log) --
no need to dig for an indirect source once the right release page was found.

## Looks review

`scenes.tsx` follows the chapter's established `Row` kit pattern; two Row values needed
shortening on the first pass ("what a crash costs" and "not lost, not doubled", both 4 words) to
fit the 1-3 word budget. Predicts land at steps 3 and 6 (index 2 and 5); takeaways at steps 5, 8
and 10, following the same "elaborate after reveal" placement the last three topics in this
chapter have used to avoid the from-step/post-predict takeaway failure.
