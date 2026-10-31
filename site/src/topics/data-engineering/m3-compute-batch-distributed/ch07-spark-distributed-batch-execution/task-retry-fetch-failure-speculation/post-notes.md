<section data-section="outcomes">

## Reading a task retry apart from a stage resubmission in an event log

A task retry shows up as a new task attempt inside the same stage attempt — the stage's own
attempt number stays put. A fetch-failure resubmission shows up as an entirely new stage
attempt, with fresh attempts of every task that stage contains, not just the one that noticed
the missing data. The first costs one task's worth of rework; the second can cost an entire
earlier stage's worth, however large that stage was.

</section>

<section data-section="Speculative execution and non-idempotent sinks">

## Speculative execution and non-idempotent sinks

Speculation launches a second, independent attempt of a slow task alongside the original, not
instead of it — whichever one finishes first wins, and the other is killed. That's harmless
for a sink whose result is naturally overwritten or deduplicated on a second write. It's a
genuine correctness hazard for a sink that performs a side effect every time it runs — an
append to a file, an external counter increment, a non-transactional insert — since both the
original and the speculative copy can perform that side effect independently, producing a
duplicate neither copy on its own would have caused. Sourced and named here rather than
measured directly: this sandbox's own local-mode scheduler, across repeated attempts with
speculation enabled and its gating thresholds lowered, did not reliably trigger a live
speculative relaunch to demonstrate the duplicate write directly.

</section>

<section data-section="production failures">

## When the real cost is bigger than it looks

Treating a stage-attempt increment in the Spark UI as "one more try, same as any task retry"
hides how much rework it can actually represent — a fetch failure can resubmit a stage with
hundreds of tasks over a job that looked, at a glance, like it just needed one more pass.

</section>

<section data-section="frontier">

## Where this goes next

Every failure mode this section has covered — spill, the cost of caching, GC, and this
topic's own retries and resubmissions — leaves its own trace somewhere in the Spark UI. The
next topic is that single place, taught as one fixed order to check rather than five separate
tools.

</section>
