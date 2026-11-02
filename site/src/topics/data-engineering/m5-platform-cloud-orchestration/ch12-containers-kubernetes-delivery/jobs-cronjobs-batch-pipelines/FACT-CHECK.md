# Fact-check — `de.jobs-cronjobs-batch-pipelines`

| # | Claim in the reel | Source | Verified |
|---|---|---|---|
| 1 | An Indexed Job gives each pod a completion index 0..completions-1, exposed via annotation, label, hostname, and `JOB_COMPLETION_INDEX` | Jobs doc, Completion mode | yes — quoted verbatim in SOURCES.md |
| 2 | The same index may briefly have more than one pod running (a replacement started before the old pod is confirmed terminal) | Jobs doc, "If you specify .spec.podFailurePolicy..." / general restartPolicy section | yes — "your pods must also be tolerant of concurrency" and the Job controller creates a replacement as soon as termination becomes apparent, before the terminal state is confirmed, is quoted |
| 3 | `backoffLimitPerIndex` records failed indexes in `failedIndexes`, doesn't stop other indexes, but Job still ends Failed if any index failed | Jobs doc, Backoff limit per index | yes — quoted verbatim |
| 4 | `maxFailedIndexes` caps failures before the Job terminates all remaining pods | Jobs doc, Backoff limit per index | yes — quoted verbatim |
| 5 | Per-index backoff limit went stable (GA) in Kubernetes 1.33 | Jobs doc feature-state box + 1.33 release post headline "Job's Backoff Limit Per Index Goes GA" | yes — both quoted |
| 6 | Pod failure policy rules (`onExitCodes`, `onPodConditions`) with actions `Ignore`/`FailJob`/`FailIndex`/`Count` | Jobs doc, Pod failure policy | yes — quoted verbatim, including the four action definitions |
| 7 | `Ignore` on `DisruptionTarget` excludes an eviction/preemption from counting toward `backoffLimit` | Jobs doc, Pod failure policy worked example | yes — quoted verbatim |
| 8 | `successPolicy` (succeededIndexes / succeededCount) ends the Job once the condition is met and terminates lingering pods | Jobs doc, Success policy | yes — quoted verbatim |
| 9 | Success policy went GA in Kubernetes 1.33 (leader-worker / simulation use case) | 1.33 release post, "Job's SuccessPolicy Goes GA" | yes — quoted verbatim, including the leader-worker rationale |
| 10 | `ttlSecondsAfterFinished` deletes a finished Job and its pods together | Jobs doc, TTL mechanism | yes — quoted verbatim |
| 11 | CronJob `concurrencyPolicy`: `Allow` (default, concurrent), `Forbid` (skip new run), `Replace` (kill old, start new) | CronJob doc, Concurrency policy | yes — quoted verbatim |
| 12 | `startingDeadlineSeconds` bounds how late a missed run may still start; unset means no deadline | CronJob doc, Deadline for delayed Job start | yes — quoted verbatim |
| 13 | More than 100 missed schedules (measured from `startingDeadlineSeconds`, or from the last scheduled time if unset) and the controller logs an error and does not start the Job | CronJob doc, Job creation | yes — quoted verbatim, including both worked examples (08:29–10:21 outage, with and without a 200s deadline) |
| 14 | A CronJob creates a Job "approximately once" per schedule time — Jobs must be idempotent | CronJob doc, Job creation | yes — quoted verbatim |
| 15 | A CronJob has no dependency graph, data intervals, backfill, or cross-job retries/alerts (Chapter 11's subject) | CHAPTER.md's own framing, consistent with the CronJob doc's scope (it documents only schedule/concurrency/history, nothing about task dependencies) | yes — absence-of-feature claim, checked against the full CronJob doc read; no contradicting statement found |

## Red-team notes

- Step 2's predict deliberately does not claim "node drains always count as Ignore automatically" — the pod failure policy must explicitly list `onPodConditions: [{type: DisruptionTarget}]` with action `Ignore`; without that rule, a disruption-caused failure falls through to default handling and does count toward `backoffLimit`. The reel's narration states the condition ("only if the policy names it"), not an automatic exemption.
- `backoffLimitPerIndex` and `maxFailedIndexes` are easy to conflate: the former caps retries *within* one index, the latter caps how many indexes may be in `failedIndexes` *before the whole Job is killed early*. Without `maxFailedIndexes` set, all indexes still run to completion even if many fail — only the overall Failed condition changes. The outline keeps these as two separate steps for exactly this reason.
- The CronJob's "approximately once" guarantee is the same idempotency property Chapter 11's named topic builds on — this topic points at it rather than re-deriving it, per CHAPTER.md's "Leaves out" list.
