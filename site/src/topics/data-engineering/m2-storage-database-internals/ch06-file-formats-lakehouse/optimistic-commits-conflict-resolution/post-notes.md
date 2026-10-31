<section data-section="outcomes">

## Outcomes

Name the three-stage optimistic-commit protocol (read, stage, validate-and-commit) that every
modern table format uses. Explain, with Iceberg's own retry rules, why a losing append can always
be revalidated and retried while a losing delete or replace must verify its specific files are
still present before it dares retry. Demonstrate both outcomes for real on local disk: an
append-vs-append race whose loser retries to a clean success, and a delete-vs-delete race on the
same file whose loser fails for good. Show that Delta's own named exceptions
(`ConcurrentAppendException`, `ConcurrentDeleteReadException`, `ConcurrentDeleteDeleteException`)
are the identical distinction under different names, and that isolation level itself is just
whichever of these conditions a writer chooses to validate.

</section>

<section data-section="one-primitive-two-formats">

## One rule, two formats

Iceberg writes the retry rule in prose, operation by operation: append always re-appliable,
replace and delete must re-verify their files. Delta writes the identical rule as a taxonomy of
exceptions a client catches: `ConcurrentAppendException` for the append case,
`ConcurrentDeleteReadException` and `ConcurrentDeleteDeleteException` for the delete cases. Neither
format invented a new idea here — both are naming the same validate-before-retry shape this topic
reproduced for real, just at different altitudes: Iceberg as a specification writers must
implement, Delta as a concrete exception type a client catches and handles.

</section>

<section data-section="production">

## Production

**Commit storms.** When many writers target the same table at once — a common shape under
micro-batch ingestion or many small streaming jobs — every writer that loses a race must
revalidate and potentially retry. If retries are not backed off, a burst of writers can spend more
time retrying than committing, especially once compaction jobs join the race: a compaction's
replace operation conflicts with any concurrent writer touching the same files, so a compaction
running against a hot table can itself become the thing writers keep losing to.

**Skipping partitioning as a conflict-avoidance tool.** Delta's own docs name this directly: two
operations whose file sets are made disjoint by partitioning (matching the table's partition
columns to the operations' filter conditions) never conflict at all, because they never touch the
same files. A table partitioned on the wrong column, or operations whose conditions don't line up
with the partitioning, turn what could have been zero conflicts into a steady stream of them.

</section>

<section data-section="frontier">

## Frontier

Both demos in `examples.py` model a "delete" as a file removed from a snapshot's file list — not
Iceberg's real position-delete or equality-delete file formats, which encode row-level deletes
inside their own files and are out of scope here. The two-writer race is a scripted sequence in
one Python process, same disclosed limitation as topic 12's compare-and-swap demo: what's verified
is that the retry logic is correct given a real atomic primitive (`os.open` with `O_EXCL`), not a
simulation of genuinely concurrent OS-level timing. Partitioning as a conflict-avoidance technique
is named in Production above but not built — demonstrating it would require a partitioned table
and two operations with genuinely disjoint conditions, which is a larger build than this topic's
20-minute budget allows.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every commit so far appended or overwrote whole files. The next question is what a commit does
when it only needs to change some rows inside a file — copy-on-write or merge-on-read.

</section>
