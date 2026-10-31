<section data-section="outcomes">

## Outcomes

By the end of this topic you can: place a given workload on the data-awareness/operational-burden/ecosystem/cloud-coupling grid and name the two or three tools worth evaluating; explain the Standard vs. Express Step Functions trade with real numbers; justify when a serverless state machine beats a self-run orchestrator for a given job shape.

</section>

<section data-section="internals">

## Internals

Step Functions' Retry and Catch fields are first-class state-machine syntax, not application code: "when one of these states reports an error and there's a Retry field, Step Functions scans through the retriers in the order listed in the array," matching on `ErrorEquals`, backing off by `BackoffRate` (2.0 by default) between attempts. `Catch` works the same way for routing to a fallback state instead of retrying. Distributed Map's child workflow executions are isolated by design -- "each child workflow execution has its own, separate execution history from that of the parent workflow" -- which is what lets ten thousand of them run in parallel without one's failure corrupting another's record.

</section>

<section data-section="lab">

## Lab

This topic has no lab of its own -- it closes the 11.1 lab's narrative by naming, for the shop's own workload shape, which tool the chapter's own measurements (topics 1-8) actually justify. Every number it puts on screen is verified directly against the fetched source text rather than invented: `examples.py` asserts that AWS's own docs state Standard Workflows run "up to one year" with "exactly-once" semantics, Express runs "up to five minutes" with "at-least-once" semantics, and Distributed Map defaults to "10,000 parallel child workflow executions" -- each assertion checked against the raw page text saved in this topic's own `sources/` folder.

</section>

<section data-section="production">

## Production

The hook's mistake is common and expensive precisely because none of its costs show up on day one: a self-run Airflow deployment's scheduler HA, metadata database care, and version-upgrade burden accrue slowly, as engineer-hours rather than as a line item anyone budgets for up front. The fix isn't "always choose managed" or "always choose serverless" -- Standard Workflows' exactly-once guarantee is worth real money for non-idempotent actions like starting a cluster or processing a payment, while Express's at-least-once model is cheaper and faster but assumes the downstream action tolerates being run twice. Picking the wrong one in either direction is a real production risk, not just an inefficiency.

</section>

<section data-section="frontier">

## Frontier

Cloud coupling is the axis easiest to ignore and hardest to walk back: a workflow built entirely from Step Functions' or Google Workflows' own state-language primitives, wired directly to a dozen other managed services by ARN or endpoint, can't be lifted out and run somewhere else the way a containerized Airflow deployment can. That isn't a reason to avoid serverless state machines -- it's a reason to weigh it explicitly, the same way the other three axes get weighed, rather than discovering it only when a migration is already underway.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every tool compared here still assumes a task or a run finishes in minutes to hours. Some real workflows are paced by humans and last for days or months, and that is a different orchestration problem, which the next section narrows down to one decision.

</section>
