# Before you watch

- **Task.** One unit of parallel work within a stage. Where you meet it: the thing that
  either retries a bounded number of times or, under a fetch failure, gets caught up in a
  much larger rerun.
- **Stage.** A group of tasks that can all run without waiting on a shuffle to finish first.
  Where you meet it: the unit this topic's own fetch-failure claim shows getting resubmitted
  wholesale.
- **Shuffle.** Redistributing data across partitions between stages. Where you meet it: the
  boundary where one stage's own output becomes the next stage's own input — and where a
  fetch failure happens.
- **Speculative execution.** Launching a second, independent copy of a slow task alongside
  the original rather than instead of it. Where you meet it: the mechanism this topic's own
  non-idempotent-sink hazard is built around.
- **Idempotent.** Safe to run more than once, because running it again produces the exact
  same result. Where you meet it: the property a sink needs to have before speculation can
  safely run two copies of the same task against it.
