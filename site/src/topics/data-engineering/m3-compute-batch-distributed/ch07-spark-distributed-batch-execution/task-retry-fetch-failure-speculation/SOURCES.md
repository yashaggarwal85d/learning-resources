# Sources: de.task-retry-fetch-failure-speculation

## Apache Spark source, `TaskSetManager.scala` (GitHub, tag `v4.0.0`)

URL: https://raw.githubusercontent.com/apache/spark/v4.0.0/core/src/main/scala/org/apache/spark/scheduler/TaskSetManager.scala
Version: GitHub tag v4.0.0

> maxTaskFailures: Int,

> if any particular task fails this number of times, the entire

> task set will be aborted

> numFailures(index) += 1

> if (numFailures(index) >= maxTaskFailures) {

> logError(log"Task ${MDC(TASK_INDEX, index)} in stage " + taskSet.logId +

> log" failed ${MDC(MAX_ATTEMPTS, maxTaskFailures)} times; aborting job")

> case fetchFailed: FetchFailed =>

### Contents (item by item):

1. `maxTaskFailures`'s own documented behavior: a task that fails this many times aborts the
   entire task set — the exact mechanism this topic's own claim 1 measures on both sides (a
   task that stays under the limit succeeds; one that exceeds it aborts the job).
2. The literal log line format the scheduler emits once a task's own failure count reaches
   `maxTaskFailures`, matching this topic's own measured abort message word for word.
3. `FetchFailed` as its own distinct case in the task-result handling — confirming a fetch
   failure is handled as its own kind of failure, not folded into the same code path as an
   ordinary task exception (`ExceptionFailure`), the direct basis for claim 2's own
   stage-resubmission behavior being genuinely distinct from claim 1's own task-level retry.

## Apache Spark documentation, "Configuration"

URL: https://spark.apache.org/docs/4.0.0/configuration.html
Version: Spark 4.0.0 documentation

Note: CHAPTER.md names this source as the "Tuning Spark" docs' own speculation config section.
The real speculation configuration keys live on the Configuration page, not the Tuning page —
substituted here, correct page cited.

> If set to "true", performs speculative execution of tasks. This means if one or more tasks are

> running slowly in a stage, they will be re-launched.

> When decommission enabled, Spark will try its best to shut down the executor gracefully.

> Spark will try to migrate all the RDD blocks (controlled by spark.storage.decommission.rddBlocks.enabled)

> and shuffle blocks (controlled by spark.storage.decommission.shuffleBlocks.enabled) from the decommissioning

> executor to a remote executor when spark.storage.decommission.enabled is enabled.

### Contents (item by item):

4. `spark.speculation`'s own one-line definition: slow tasks get re-launched, a second,
   independent attempt alongside (not instead of) the original — the exact mechanism this
   topic's own speculation hazard discussion is built around.
5. `spark.decommission.enabled`'s own documented behavior: a gracefully decommissioning
   executor has Spark actively migrate both its RDD blocks and its shuffle blocks to a remote
   executor before it exits — the sourced basis for "executor loss taking shuffle files with
   it," and the specific mechanism (block migration) that graceful decommissioning exists to
   avoid.

## Apache Spark documentation, "Running Spark on Kubernetes"

URL: https://spark.apache.org/docs/4.0.0/running-on-kubernetes.html
Version: Spark 4.0.0 documentation

> spark.kubernetes.decommission.script

> The location of the script to use for graceful decommissioning.

> External Shuffle Service

> Job Queues and Resource Management

### Contents (item by item):

6. The Kubernetes-specific decommissioning hook: a configurable script path Spark runs on the
   executor pod before it's torn down, giving block migration (sourced above) a chance to
   finish first.
7. The docs' own explicit admission, in a "features currently being worked on" list, that an
   external shuffle service is *not yet available* on Kubernetes at this Spark version — a
   direct, sourced reason why losing an executor's shuffle files on Kubernetes specifically
   depends on graceful decommissioning's own block migration, rather than an always-available
   external shuffle service surviving the loss on its own.
