# Fact-check: IaC state, plan and drift

| # | Claim | Source | Verdict |
|---|---|---|---|
| 1 | Terraform state's primary purpose is storing bindings between remote objects and the resource instances declared in configuration, which Terraform uses to determine what changes to make | HashiCorp: State | Confirmed, verbatim quotes |
| 2 | Terraform locks state automatically on any operation that could write it, silently unless acquiring the lock takes longer than expected | HashiCorp: State: Locking | Confirmed, verbatim quotes |
| 3 | `terraform plan` alone does not carry out the proposed changes; without `-out=FILE` it creates a speculative plan with no intent to actually apply it | HashiCorp: terraform plan command reference | Confirmed, verbatim quotes |
| 4 | `terraform import` requires a hand-written resource configuration block first and only imports into state, generating no configuration | HashiCorp: Import existing infrastructure resources | Confirmed, verbatim quotes |
| 5 | HashiCorp switched Terraform's license from the MPL to the Business Source License on August 10, 2023, with little advance notice; OpenTofu is the resulting fork, created after no response by August 25, maintained under the Linux Foundation | OpenTofu: Manifesto | Confirmed, verbatim quotes |
| 6 | Pulumi defines infrastructure in general-purpose languages (Node.js, Python, Go, .NET, Java) plus YAML, not a declarative DSL | Pulumi: How Pulumi IaC Works | Confirmed, verbatim quote |
| 7 | AWS CDK is an open-source framework using a general-purpose language (TypeScript, JavaScript, Python, Java, C#/.NET, Go), with real language features, that provisions through AWS CloudFormation | AWS: What is the AWS CDK? | Confirmed, verbatim quotes |
| 8 | Sentinel is a policy-as-code tool that proactively enforces policy, preventing disallowed deployments | HashiCorp Sentinel: Documentation | Confirmed, verbatim quote |
| 9 | OPA decouples policy from the service it governs, letting policy be read, written, versioned and managed separately | Open Policy Agent: Philosophy | Confirmed, verbatim quotes |
| 10 | State, locking, plan/apply-as-diff, drift detection, import, and a minimal policy gate all behave as documented when reproduced against a synthetic in-memory remote system | Derived in `examples.py`, run and verified locally | Confirmed by running the code |

## Red-team

- **Why doesn't this topic run a real Terraform or OpenTofu binary?** Downloading and executing an external compiled binary in this sandbox is blocked by this session's own safety controls (confirmed by attempting it: a direct release-archive download succeeded, but running the extracted binary was denied by the auto-mode classifier). This is disclosed in OUTLINE.md rather than silently worked around; `examples.py` instead reproduces the documented mechanism structurally.
- **Does `examples.py`'s `StateStore` overstate what a real lock prevents?** No — it only blocks a second `acquire_lock` call while the first holder still holds it, exactly matching SOURCES.md's own claim ("others from acquiring the lock and potentially corrupting your state"). It does not model every real backend's locking implementation (DynamoDB, a cloud KV store), only the documented *behavior* a lock is supposed to produce.
- **Is the BSL/OpenTofu history stated with real dates, or dramatized?** The dates (August 10 and August 25, 2023) and license names (MPL, Business Source License v1.1) come directly from OpenTofu's own manifesto page, which is itself the primary account of its own founding — not a third-party retelling.
- **Does the policy-gate example overclaim what Sentinel/OPA do in production?** No — `policy_gate()` is explicitly a minimal reproduction of the *decision* a real policy engine makes (block vs allow, with a reason), not a claim that this is how Sentinel or OPA's actual rule language works internally.

## Outcome

20 quotes across 9 sources, 0 problems (`node scripts/sources.mjs check`). `examples.py` runs clean, reproducing the unlocked-race hook, the locked fix, drift detection and import, and a policy gate blocking a forbidden plan.
