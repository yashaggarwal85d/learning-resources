# Outline: IaC state, plan and drift

**Syllabus line (syllabus/data-engineering.md):** "declarative desired state, state files and locking, plan/apply, drift detection and import, module boundaries for data platforms (bucket + catalog + IAM as one unit), Terraform's 2023 BSL relicensing and the OpenTofu fork, Pulumi/CDK general-purpose IaC, policy-as-code gates on plans (in-cluster GitOps is §12.3)."

## Claims to fact-check

1. Terraform state's primary purpose is storing bindings between objects in a remote system and resource instances declared in configuration, which Terraform uses to determine what changes to make (HashiCorp: State).
2. Terraform locks state on any operation that could write it, automatically, with no message unless acquiring the lock takes longer than expected (HashiCorp: State: Locking).
3. `terraform plan` alone does not carry out the proposed changes; without `-out=FILE` it creates a speculative plan — a description of the effect, with no intent to apply it (HashiCorp: terraform plan command reference).
4. `terraform import` requires a hand-written resource configuration block first and only imports into state — it does not generate configuration (HashiCorp: Import existing infrastructure resources).
5. HashiCorp switched Terraform's license from the MPL to the Business Source License on August 10, 2023, without advance notice to the community; OpenTofu is the fork that followed, created after HashiCorp gave no response by August 25, and is maintained under the Linux Foundation (OpenTofu: Manifesto).
6. Pulumi lets infrastructure be defined in general-purpose languages (Node.js, Python, Go, .NET, Java) plus YAML, rather than a declarative DSL (Pulumi: How Pulumi IaC Works).
7. AWS CDK is an open-source framework for defining infrastructure in a general-purpose language (TypeScript, JavaScript, Python, Java, C#/.NET, Go) that provisions through AWS CloudFormation, with real language features (conditionals, loops, composition, inheritance) available (AWS: What is the AWS CDK?).
8. HashiCorp Sentinel is a policy-as-code tool that proactively enforces policy, preventing a user from deploying a disallowed change (HashiCorp Sentinel: Documentation).
9. Open Policy Agent decouples policy from the service it governs, letting policy be managed, versioned and reviewed separately from the software it constrains (Open Policy Agent: Philosophy).

## Changes from the chapter plan

The real syllabus line keeps a trailing cross-reference, "(in-cluster GitOps is §12.3)", that CHAPTER.md's own paraphrase drops in its body text (though CHAPTER.md's own "Leaves out" note separately mentions GitOps is Ch.12.3, named not re-taught). This topic's `coverage.json` maps that parenthetical as a forward-reference clause rather than teaching GitOps itself.

A second note: this topic cannot run a real Terraform or OpenTofu binary in this sandbox: downloading and executing an external compiled binary is blocked by this session's own safety controls. Every claim about state, locking, plan/apply, import, the BSL relicensing and OpenTofu's founding, and the IaC tool landscape is sourced directly from HashiCorp's, OpenTofu's, Pulumi's and AWS's own current documentation. The worked reproduction (`examples.py`) models the documented *mechanics* themselves — a state store, a lock, a plan/apply diff, drift detection, import, and a policy gate — as a disclosed, structural simulation in pure Python, rather than a real Terraform run against a real backend.

## Engagement arc

Hook: two engineers run `apply` against the same unlocked state file eight seconds apart; the second apply's plan was computed against a state that was already stale by the time it ran, and a bucket policy silently reverts to an earlier, more permissive version with no error from either apply — replayed with locking, where the second apply simply waits. Early prediction: before explaining the mechanism, ask what a plan is actually diffed against. Teaching: state as the tool's own record, not the live cloud; locking as the race-condition guard; plan/apply as dry-run-then-commit; drift and import as the two ends of "something changed outside the tool"; module boundaries bundling a bucket, its catalog registration and its IAM role as one review unit; the 2023 BSL relicensing and OpenTofu's fork, with real dates; Pulumi/CDK as the general-purpose-language alternative and its real trade-off; a policy-as-code gate actually blocking a bad plan. Recap + takeaways. Second predict step: given a plan a human never reviewed, what's the single mechanism that would have stopped it.

## Concept ledger

**Introduces:** `iac-state-plan-apply-drift`, `module-boundary-platform-unit`, `policy-as-code-gate`.
**Uses:** `short-lived-federated-credential` (topic 4), `passrole-escalation-boundary` (topic 4), `catalog-credential-vending` (topic 8).
**Declared:** basic familiarity with version control and declarative configuration.

## Bridge / handoff

**Bridge:** "Choosing a platform is a decision made once. Keeping that choice reproducible, reviewable and safe to change hundreds of times after is infrastructure as code — the discipline this topic teaches from its single most important fact: the tool diffs against its own state file, not the live cloud, and that file can be corrupted or lied to."

**Handoff:** "A reproducible platform is the precondition for answering what it actually costs and attributing that cost fairly — which is where this section, and the chapter's own cost thread from 10.1, converge."
