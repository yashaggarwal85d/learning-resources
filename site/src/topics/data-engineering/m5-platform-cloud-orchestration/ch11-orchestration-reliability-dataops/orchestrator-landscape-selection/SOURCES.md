# Sources

## Choosing workflow type in Step Functions

URL: https://docs.aws.amazon.com/step-functions/latest/dg/concepts-standard-vs-express.html
Version: AWS Step Functions Developer Guide (fetched 2026-10-31)

> Standard Workflows are ideal for long-running (up to one year), durable, and auditable workflows. You can retrieve the full execution history using the Step Functions API for up to 90 days after your execution completes.

> Standard Workflows follow an exactly-once model, where your tasks and states are never run more than once, unless you have specified Retry behavior in ASL.

> Standard Workflow executions are billed according to the number of state transitions processed.

> Express Workflows are ideal for high-volume, event-processing workloads such as IoT data ingestion, streaming data processing and transformation, and mobile application backends. They can run for up to five minutes.

> Express Workflows use an at-least-once model, so an execution could potentially run more than once.

> Express Workflow executions are billed by number of executions, total duration of execution, and memory consumed during execution.

## Handling errors in Step Functions workflows

URL: https://docs.aws.amazon.com/step-functions/latest/dg/concepts-error-handling.html
Version: AWS Step Functions Developer Guide (fetched 2026-10-31)

> When one of these states reports an error and there's a Retry field, Step Functions scans through the retriers in the order listed in the array. When the error name appears in the value of a retrier's ErrorEquals field, the state machine makes retry attempts as defined in the Retry field.

> The multiplier by which the retry interval denoted by IntervalSeconds increases after each retry attempt. By default, the BackoffRate value increases by 2.0.

> The States.ALL error type must appear alone in a Catcher and cannot catch the States.DataLimitExceeded terminal error or Runtime error types.

## Using Map state in Distributed mode for large-scale parallel workloads in Step Functions

URL: https://docs.aws.amazon.com/step-functions/latest/dg/state-map-distributed.html
Version: AWS Step Functions Developer Guide (fetched 2026-10-31)

> In Distributed mode, the Map state processes the items in the dataset in iterations called child workflow executions. You can specify the number of child workflow executions that can run in parallel.

> Each child workflow execution has its own, separate execution history from that of the parent workflow. If you don't specify, Step Functions runs 10,000 parallel child workflow executions in parallel.

## Workflows overview (Google Cloud)

URL: https://cloud.google.com/workflows/docs/overview
Version: Google Cloud Documentation (fetched 2026-10-31)

> Workflows is a fully managed orchestration platform that executes services in an order that you define: a workflow.

> Workflows is serverless, scaling up as needed, and no charges are incurred while idle. Because a workflow contains no code or library dependencies, it does not require security patches.

> A workflow can hold state, retry, poll, or wait for up to a year.

## Announcing the General Availability of Databricks Lakeflow

URL: https://www.databricks.com/blog/announcing-general-availability-databricks-lakeflow
Version: Databricks Blog (fetched 2026-10-31)

> Databricks Workflows has long been trusted to orchestrate mission-critical workflows, with thousands of customers relying on our platform for pipelines to run over 110 million jobs every week. With the GA of Lakeflow, we're evolving Workflows into Lakeflow Jobs, unifying this mature, native orchestrator with the rest of the data engineering stack.

## Maestro (README)

URL: https://raw.githubusercontent.com/Netflix/maestro/main/README.md
Version: Netflix/maestro, main branch (fetched 2026-10-31)

> is a general-purpose workflow orchestrator that provides a fully managed workflow-as-a-service (WAAS) to the data platform users at Netflix.

> It schedules hundreds of thousands of workflows, millions of jobs every day and operates with a strict SLO even when there are spikes in the traffic.

## Introduction (Prefect Docs)

URL: https://docs.prefect.io/v3/get-started/index
Version: Prefect Docs, v3 (fetched 2026-10-31)

> Prefect is an open-source orchestration engine that turns your Python functions into production-grade data pipelines with minimal friction. You can build and schedule workflows in pure Python—no DSLs or complex config files—and run them anywhere you can run Python.

> But what made Prefect truly special was our introduction of task mapping—a feature that would later become foundational to our dynamic execution capabilities (and eventually imitated by other orchestration SDKs).

> With our release of Prefect 3.0 in 2024, we fully embraced these dynamic patterns by open-sourcing our events and automations backend, allowing users to natively represent event-driven workflows and gain additional observability into their execution.

## Frequently Asked Questions (Kestra)

URL: https://kestra.io/faq
Version: Kestra Docs (fetched 2026-10-31)

> Kestra is an open-source orchestrator designed to bring Infrastructure as Code (IaC) best practices to all workflows — from those orchestrating mission-critical operations, business processes, and data pipelines to simple Zapier-style automation.

> A declarative orchestrator is a system that allows you to define and manage complex workflows using a high-level, descriptive language. Instead of specifying the exact steps and sequences to achieve a specific outcome, a declarative orchestrator lets you define the desired end state and the system figures out how to reach it.

> Kestra is a declarative orchestrator designed for managing all kinds of workflows. It uses YAML (Yet Another Markup Language) to define workflows in a human-readable and structured format.
