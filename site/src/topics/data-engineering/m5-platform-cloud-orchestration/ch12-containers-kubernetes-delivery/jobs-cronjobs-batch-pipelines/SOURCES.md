## Kubernetes documentation, Jobs

URL: https://kubernetes.io/docs/concepts/workloads/controllers/job/

> Indexed: the Pods of a Job get an associated completion index from 0 to
> .spec.completions-1. The index is available through four mechanisms:
> The Pod annotation batch.kubernetes.io/job-completion-index.
> The Pod label batch.kubernetes.io/job-completion-index (for v1.28 and later). Note
> the feature gate PodIndexLabel must be enabled to use this label, and it is enabled
> by default.
> As part of the Pod hostname, following the pattern $(job-name)-$(index).
> When you use an Indexed Job in combination with a
> Service, Pods within the Job can use
> the deterministic hostnames to address each other via DNS. For more information about
> how to configure this, see Job with Pod-to-Pod Communication.
> From the containerized task, in the environment variable JOB_COMPLETION_INDEX.
> The Job is considered complete when there is one successfully completed Pod
> for each index.

> you can choose to count the pod failures independently for each
> index of an Indexed Job by setting the .spec.backoffLimitPerIndex field

> When the per-index backoff limit is exceeded for an index, Kubernetes considers the index as failed and adds it to the
> .status.failedIndexes field. The succeeded indexes, those with a successfully
> executed pods, are recorded in the .status.completedIndexes field, regardless of whether you set
> the backoffLimitPerIndex field.
> Note that a failing index does not interrupt execution of other indexes.
> Once all indexes finish for a Job where you specified a backoff limit per index,
> if at least one of those indexes did fail, the Job controller marks the overall
> Job as failed, by setting the Failed condition in the status. The Job gets
> marked as failed even if some, potentially nearly all, of the indexes were
> processed successfully.

> You can additionally limit the maximal number of indexes marked failed by
> setting the .spec.maxFailedIndexes field.
> When the number of failed indexes exceeds the maxFailedIndexes field, the
> Job controller triggers termination of all remaining running Pods for that Job.
> Once all pods are terminated, the entire Job is marked failed by the Job
> controller, by setting the Failed condition in the Job status.

> This is a stable feature in Kubernetes, and has been since version v1.33. It was first available in the v1.28 release.

> You can configure a Pod failure policy, in the .spec.podFailurePolicy field,
> to meet the above use cases. This policy can handle Pod failures based on the
> container exit codes and the Pod conditions.

> To guarantee that your Job finishes even if there are disruptions, you can
> ignore Pod failures caused by disruptions (such as preemption,
> API-initiated eviction
> or taint-based eviction) so
> that they don't count towards the .spec.backoffLimit limit of retries.

> FailJob: use to indicate that the Pod's job should be marked as Failed and
> all running Pods should be terminated.
> Ignore: use to indicate that the counter towards the .spec.backoffLimit
> should not be incremented and a replacement Pod should be created.
> Count: use to indicate that the Pod should be handled in the default way.
> The counter towards the .spec.backoffLimit should be incremented.
> FailIndex: use this action along with backoff limit per index
> to avoid unnecessary retries within the index of a failed pod.

> When creating an Indexed Job, you can define when a Job can be declared as succeeded using a .spec.successPolicy,
> based on the pods that succeeded.
> By default, a Job succeeds when the number of succeeded Pods equals .spec.completions.

> When you specify the succeededIndexes only,
> once all indexes specified in the succeededIndexes succeed, the job controller marks the Job as succeeded.
> The succeededIndexes must be a list of intervals between 0 and .spec.completions-1.
> When you specify the succeededCount only,
> once the number of succeeded indexes reaches the succeededCount, the job controller marks the Job as succeeded.

> When you specify both a success policy and some terminating policies such as .spec.backoffLimit and .spec.podFailurePolicy,
> once the Job meets either policy, the job controller respects the terminating policy and ignores the success policy.

> Another way to clean up finished Jobs (either Complete or Failed)
> automatically is to use a TTL mechanism provided by a
> TTL controller for
> finished resources, by specifying the .spec.ttlSecondsAfterFinished field of
> the Job.

> If the field is set to 0, the Job will be eligible to be automatically deleted
> immediately after it finishes. If the field is unset, this Job won't be cleaned
> up by the TTL controller after it finishes.

> In the example above, the first rule of the Pod failure policy specifies that
> the Job should be marked failed if the main container fails with the 42 exit
> code.

> The second rule of the Pod failure policy, specifying the Ignore action for
> failed Pods with condition DisruptionTarget excludes Pod disruptions from
> being counted towards the .spec.backoffLimit limit of retries.

> if you want to use a .spec.podFailurePolicy field for a Job, you must
> also define that Job's pod template with .spec.restartPolicy set to Never.
> the Pod failure policy rules you specify under spec.podFailurePolicy.rules
> are evaluated in order. Once a rule matches a Pod failure, the remaining rules
> are ignored. When no rule matches the Pod failure, the default
> handling applies.

## Kubernetes documentation, CronJob

URL: https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/

> The .spec.startingDeadlineSeconds field is optional.
> This field defines a deadline (in whole seconds) for starting the Job, if that Job misses its scheduled time
> for any reason.
> After missing the deadline, the CronJob skips that instance of the Job (future occurrences are still scheduled).

> For Jobs that miss their configured deadline, Kubernetes treats them as failed Jobs.
> If you don't specify startingDeadlineSeconds for a CronJob, the Job occurrences have no deadline.

> Allow (default): The CronJob allows concurrently running Jobs
> Forbid: The CronJob does not allow concurrent runs; if it is time for a new Job run and the
> previous Job run hasn't finished yet, the CronJob skips the new Job run. Also note that when the
> previous Job run finishes, .spec.startingDeadlineSeconds is still taken into account and may
> result in a new Job run.
> Replace: If it is time for a new Job run and the previous Job run hasn't finished yet, the
> CronJob replaces the currently running Job run with a new Job run

> A CronJob creates a Job object approximately once per execution time of its schedule.
> The scheduling is approximate because there
> are certain circumstances where two Jobs might be created, or no Job might be created.
> Kubernetes tries to avoid those situations, but does not completely prevent them. Therefore,
> the Jobs that you define should be idempotent.

> For every CronJob, the CronJob Controller checks how many schedules it missed in the duration from its last scheduled time until now. If there are more than 100 missed schedules, then it does not start the Job and logs the error.

> It is important to note that if the startingDeadlineSeconds field is set (not nil), the controller counts how many missed Jobs occurred from the value of startingDeadlineSeconds until now rather than from the last scheduled time until now. For example, if startingDeadlineSeconds is 200, the controller counts how many missed Jobs occurred in the last 200 seconds.

> For example, suppose a CronJob is set to schedule a new Job every one minute beginning at 08:30:00, and its
> startingDeadlineSeconds field is not set. If the CronJob controller happens to
> be down from 08:29:00 to 10:21:00, the Job will not start as the number of missed Jobs which missed their schedule is greater than 100.

> To illustrate this concept further, suppose a CronJob is set to schedule a new Job every one minute beginning at 08:30:00, and its
> startingDeadlineSeconds is set to 200 seconds. If the CronJob controller happens to
> be down for the same period as the previous example (08:29:00 to 10:21:00,) the Job will still start at 10:22:00. This happens as the controller now checks how many missed schedules happened in the last 200 seconds (i.e., 3 missed schedules), rather than from the last scheduled time until now.

> The CronJob is only responsible for creating Jobs that match its schedule, and
> the Job in turn is responsible for the management of the Pods it represents.

## Kubernetes documentation, Indexed Job for Parallel Processing with Static Work Assignment

URL: https://kubernetes.io/docs/tasks/job/indexed-parallel-processing-static/

> The pod index is available in the annotation
> batch.kubernetes.io/job-completion-index as a string representing its
> decimal value. In order for the containerized task process to obtain this index,
> you can publish the value of the annotation using the downward API
> mechanism.
> For convenience, the control plane automatically sets the downward API to
> expose the index in the JOB_COMPLETION_INDEX environment variable.

## Kubernetes blog, Kubernetes v1.33: Octarine

URL: https://kubernetes.io/blog/2025/04/23/kubernetes-v1-33-release/

> Kubernetes 1.33: Job's SuccessPolicy Goes GA

> Kubernetes v1.33: Job's Backoff Limit Per Index Goes GA

> This release graduates a feature that allows setting backoff limits on a per-index basis for Indexed
> Jobs. Traditionally, the backoffLimit parameter in Kubernetes Jobs specifies the number of retries
> before considering the entire Job as failed. This enhancement allows each index within an Indexed
> Job to have its own backoff limit, providing more granular control over retry behavior for
> individual tasks. This ensures that the failure of specific indices does not prematurely terminate
> the entire Job, allowing the other indices to continue processing independently.

> Using .spec.successPolicy, users can specify which pod indexes must succeed (succeededIndexes),
> how many pods must succeed (succeededCount), or a combination of both. This feature benefits
> various workloads, including simulations where partial completion is sufficient, and leader-worker
> patterns where only the leader's success determines the Job's overall outcome.
