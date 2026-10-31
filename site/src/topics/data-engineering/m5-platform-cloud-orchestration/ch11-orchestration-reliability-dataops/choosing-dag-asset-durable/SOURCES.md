# Sources

## Temporal Workflow (Encyclopedia)

URL: https://docs.temporal.io/workflows
Version: Temporal Documentation (fetched 2026-10-31)

> Conceptually, a workflow defines a sequence of steps. With Temporal, those steps are defined by writing code, known as a Workflow Definition, and are carried out by running that code, which results in a Workflow Execution.

> Temporal Workflows are resilient. They can run—and keep running—for years, even if the underlying infrastructure fails. If the application itself crashes, Temporal will automatically recreate its pre-failure state so it can continue right where it left off.

> When it's time to continue the Workflow, Temporal doesn't restore memory from a snapshot. It starts the Workflow code from the beginning, replays the Event History step by step, and uses that history to guide the code back to the exact state as before.

## Event History (Encyclopedia)

URL: https://docs.temporal.io/encyclopedia/event-history
Version: Temporal Documentation (fetched 2026-10-31)

> With Temporal, your Workflows recover from crashes automatically. This is made possible by the Event History, a complete and durable log of everything that has happened in the lifecycle of a Workflow Execution, as well as the ability of the Temporal Service to durably persist the Events during Replay.

> if the Worker crashes, the Worker uses the Event History to replay the code and recreate the state of the Workflow Execution to what it was immediately before the crash. It then resumes progress from the point of failure as if the failure never occurred.

## What is a Temporal Worker?

URL: https://docs.temporal.io/workers
Version: Temporal Documentation (fetched 2026-10-31)

> A Worker Process is responsible for polling a Task Queue, dequeueing a Task, executing your code in response to a Task, and responding to the Temporal Service with the results.

> A Worker Entity listens and polls on a single Task Queue.

## Worker Versioning

URL: https://docs.temporal.io/production-deployment/worker-deployments/worker-versioning
Version: Temporal Documentation (fetched 2026-10-31)

> Worker Versioning is a Temporal feature that allows you to confidently deploy new changes to the Workflows running on your Workers without breaking them.

> For pinned Workflow Types, each execution runs entirely on the Worker Deployment Version where it started. You need not worry about making breaking code changes to running, pinned Workflows.

## Announcing GA for Worker Versioning and Public Preview for Upgrade on Continue-as-New (Temporal Blog)

URL: https://temporal.io/blog/ga-worker-versioning-public-preview-upgrade-on-continue-as-new
Version: Temporal Blog (fetched 2026-10-31)

> Today, we're announcing the General Availability of Worker Versioning and a Public Preview of Upgrade on Continue-as-New, a new capability that eliminates patching for many long-running Workflow patterns.

> Worker Versioning is now Generally Available across all Temporal SDKs.

## Saga Pattern

URL: https://docs.temporal.io/design-patterns/saga-pattern
Version: Temporal Documentation (fetched 2026-10-31)

> The Saga pattern manages distributed transactions across multiple services by coordinating a sequence of local transactions, each with a compensating action that can undo its effects if subsequent steps fail.

> If any step fails, you execute compensation transactions in reverse order to undo the effects of all completed steps.

## Evaluate Temporal (overview)

URL: https://docs.temporal.io/evaluate
Version: Temporal Documentation (fetched 2026-10-31)

> Temporal gives developers a clear way to structure distributed application code and see the state of a running application. Applications get fault tolerance and execution guarantees.

## Introduction (Prefect Docs, reused from topic 9's own fetch)

URL: https://docs.prefect.io/v3/get-started/index
Version: Prefect Docs, v3 (fetched 2026-10-31)

> Prefect is an open-source orchestration engine that turns your Python functions into production-grade data pipelines with minimal friction. You can build and schedule workflows in pure Python—no DSLs or complex config files—and run them anywhere you can run Python.
