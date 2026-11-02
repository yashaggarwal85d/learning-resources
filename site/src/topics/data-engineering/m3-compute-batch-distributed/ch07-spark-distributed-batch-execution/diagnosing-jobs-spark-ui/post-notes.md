<section data-section="outcomes">

## Naming the cause from a Spark UI screenshot alone

Given only a screenshot, the fixed order is: check the stage's own task-duration spread first
(skew shows as one task far above its own stage's median, not as a slow stage overall); then
check that task's own spill and GC columns (both are per-task metrics, not per-stage ones);
then check task count against average duration (a huge count with a tiny average each is the
small-files signature); then check the event timeline for a gap with every executor idle (a
driver bottleneck leaves no stage at all, since the work never ran inside one). The one more
metric that confirms each guess: the stage's own min/median/max table for skew, the per-task
spill/GC columns for spill and GC, the scheduler-delay-versus-CPU-time ratio for small files,
and the executor timeline for a driver bottleneck.

</section>

<section data-section="Reading the SQL tab and the History Server">

## Reading the SQL tab and the History Server

The SQL tab's own query plan annotates each physical operator with per-operator metrics —
rows produced, shuffle bytes written, spill size — directly on the plan graph, so a plan step
that looks cheap in the logical plan but expensive in practice shows exactly where. Once an
application has finished, none of this disappears: with event logging turned on, the History
Server reconstructs the identical UI from the persisted event log, so a job that already ran
and already failed can still be diagnosed after the fact, not only while it's live.

</section>

<section data-section="production failures">

## When the symptom and the cause don't match

Reacting to the first metric that looks wrong — a nonzero GC time, a wide task-duration bar —
without comparing it against the job's own baseline produces false diagnoses as often as it
produces real ones: a small nonzero GC time next to a large run time isn't the bottleneck, and
a wide-looking task bar in a stage with only a handful of tasks can be ordinary variance, not
skew.

</section>

<section data-section="frontier">

## Where this goes next

Section 7.3 closes the chapter's batch-execution half: how a job runs, shuffles, spends memory
and fails, with the Spark UI as the one place every failure mode in it leaves a trace. The
next section asks the same engine to do something structurally different: compute
incrementally, forever, over data that never finishes arriving.

</section>
