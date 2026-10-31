# Fact-check

1. **Standard Workflows run up to a year with exactly-once execution semantics.** Sourced and reproduced directly: `examples.py` asserts AWS's own docs state "Standard Workflows are ideal for long-running (up to one year), durable, and auditable workflows" and "Standard Workflows follow an exactly-once model," verified word for word against the fetched page text.

2. **Express Workflows run up to five minutes with at-least-once execution semantics.** Sourced and reproduced directly: `examples.py` asserts "They can run for up to five minutes" and "Express Workflows use an at-least-once model," verified against the fetched page text.

3. **Standard and Express workflows are billed on different terms.** Sourced, AWS docs: Standard is billed "according to the number of state transitions processed," while Express is billed "by number of executions, total duration of execution, and memory consumed during execution."

4. **Retry and Catch are first-class state-machine syntax, not application code.** Sourced, AWS docs: "When one of these states reports an error and there's a Retry field, Step Functions scans through the retriers in the order listed in the array," matching the error name against each retrier's `ErrorEquals` field, with `BackoffRate` multiplying the retry interval ("By default, the BackoffRate value increases by 2.0").

5. **Distributed Map defaults to ten thousand parallel child workflow executions, each with its own isolated execution history.** Sourced and reproduced directly: `examples.py` asserts "Step Functions runs 10,000 parallel child workflow executions" and "Each child workflow execution has its own, separate execution history from that of the parent workflow," verified against the fetched page text.

6. **Google Workflows is a fully managed, serverless orchestration platform with no idle cost.** Sourced, Google Cloud docs: "Workflows is a fully managed orchestration platform that executes services in an order that you define," and "Workflows is serverless, scaling up as needed, and no charges are incurred while idle."

7. **Databricks Workflows was renamed Lakeflow Jobs at Lakeflow's general availability, with Databricks' own stated scale.** Sourced and reproduced directly: `examples.py` asserts Databricks' own blog states "we're evolving Workflows into Lakeflow Jobs" and that the platform runs "over 110 million jobs every week," verified against the fetched page text.

8. **Netflix Maestro is a fully managed workflow-as-a-service, run at a stated daily scale, named and sourced because it is not independently runnable in this sandbox.** Sourced and reproduced directly: `examples.py` asserts Netflix's own README states Maestro "schedules hundreds of thousands of workflows, millions of jobs every day," verified against the fetched page text. Not independently run here, consistent with CHAPTER.md's own note that Maestro is "not independently runnable."

9. **Prefect is a Python-native orchestrator; its 3.0 release open-sourced an events/automations backend for native event-driven workflows.** Sourced and reproduced directly: `examples.py` asserts Prefect's own docs state "With our release of Prefect 3.0 in 2024, we fully embraced these dynamic patterns by open-sourcing our events and automations backend."

10. **Kestra is a YAML-declarative orchestrator, distinct from Airflow's and Prefect's code-first model.** Sourced, Kestra's own FAQ: "Kestra is a declarative orchestrator designed for managing all kinds of workflows. It uses YAML... to define workflows in a human-readable and structured format," and more generally, "a declarative orchestrator lets you define the desired end state and the system figures out how to reach it."

11. **The four-axis selection grid (data-awareness, operational burden, ecosystem, cloud coupling) is this topic's own synthesis, built from mechanisms taught earlier in this chapter.** Data-awareness is topics 7-8's own distinction; operational burden is topic 1's architecture made into a staffing-cost question; ecosystem and cloud coupling are not independently sourced claims but standard, widely-understood axes this topic names explicitly rather than leaving implicit, consistent with CHAPTER.md's framing of this topic as "the comparison and decision rule," not a new mechanism.
