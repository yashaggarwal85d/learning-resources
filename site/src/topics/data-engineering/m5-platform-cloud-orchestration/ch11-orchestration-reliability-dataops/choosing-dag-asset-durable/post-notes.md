<section data-section="outcomes">

## Outcomes

By the end of this topic you can: apply the decision rule (duration, human-in-the-loop, data-product framing, saga need) to classify a given workflow into a batch DAG, an asset graph, or a durable-execution workflow; design a hybrid where a batch orchestrator hands off a long-running, human-paced step to a durable-execution workflow; state, with Temporal's own documentation as the source, what event-sourced replay buys that retries alone do not, without needing to demonstrate its internals.

</section>

<section data-section="internals">

## Internals

Temporal's Event History is "a complete and durable log of everything that has happened in the lifecycle of a Workflow Execution." A Worker never performs an action directly from its own code path; it issues a Command to the Temporal Service, which is recorded as an Event. If the Worker crashes, a replacement Worker "uses the Event History to replay the code and recreate the state of the Workflow Execution to what it was immediately before the crash" -- state recovery is a property of the history, not of any one process staying alive. Worker Versioning, reaching General Availability per Temporal's own blog, lets a deployed Workflow's code change safely without breaking Workflows already in flight, by pinning each running execution to the Worker Deployment Version it started on.

</section>

<section data-section="lab">

## Lab

This topic hosts the chapter's 11.2 lab, run as far as this sandbox allows. The Airflow side is run and verified directly: two sensors in the identical `reschedule` mode, one polling a Python process's own in-memory counter (never survives a poke, let alone a restart) and one polling a file's existence (its `up_for_reschedule` state lives in the metadata database, and survived a real scheduler process being killed and relaunched mid-wait). The Temporal side of the lab -- migrating the same approval gate onto a Temporal workflow, killing workers mid-approval, deploying a code change mid-flight and observing the resulting non-determinism error -- could not be completed: the Temporal CLI dev server binary downloads and extracts cleanly in this sandbox, but every attempt to execute it is blocked by this session's own execution policy. That leg is sourced only, per `examples.py` and `FACT-CHECK.md`.

</section>

<section data-section="production">

## Production

The hook's failure mode is specific and common: a long, human-paced wait modeled as a sensor works until the first infrastructure event that touches the scheduler -- a routine deploy, a crash, a planned restart -- at which point state held only in a process's memory is gone with no error raised anywhere. The fix in production is rarely "move everything to Temporal." Most pipelines are mostly short, ordinary batch work; the fix is isolating just the long, human-paced leg and handing it to a model built for exactly that duration, while the surrounding batch work keeps running on the orchestrator that already fits it.

</section>

<section data-section="frontier">

## Frontier

Prefect's dynamic, Python-native flows are a fourth point worth placing on the same map: a Prefect flow's structure can depend on runtime values in a way a statically-defined Airflow DAG's cannot, which matters for workloads whose shape genuinely isn't known until the data arrives, independent of the duration question this topic's decision rule is built around. Temporal's own skipped internals -- workflow determinism, versioning, signals, timers and sagas -- are the mechanics that make long-lived replay safe in practice; this topic names them as a pointer rather than teaching them, consistent with the chapter's own scope.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Choosing the right model for how a pipeline runs doesn't yet say anything about whether it is healthy once running. The next section turns from scheduling correctness to operating the result: what quality a pipeline promises, and what happens when it breaks that promise.

</section>
