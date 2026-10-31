---
id: de.workload-identity-least-privilege
title: 'Workload identity and least privilege'
---

<section data-section="outcomes">

## Outcomes

- Explain why a short-lived federated credential is strictly safer than a static key, and name the specific mechanism on at least two clouds.
- Distinguish a trust policy from a permission policy and from a permission boundary.
- Reproduce a `PassRole`-style escalation and close it with a Resource-scoped statement.
- Design separate raw and curated access roles.

</section>

<section data-section="internals">

## Internals

- **Two names, one mechanism, on AWS itself.** IRSA (OIDC-based, one provider per cluster) and EKS Pod Identity (no OIDC, one reusable `pods.eks.amazonaws.com` principal across every cluster) are two separate, still-supported ways to do the same thing: map a Kubernetes service account to an IAM role. Pod Identity is the newer, simpler of the two, but neither replaces the other in AWS's own documentation.
- **Enabling workload identity grants nothing by itself.** GKE's own documentation is explicit that turning on Workload Identity Federation for a cluster "doesn't grant your workloads any additional IAM permissions" — the IAM allow policy binding a Kubernetes ServiceAccount to real permissions is a separate, deliberate step.
- **The token-exchange shape is identical across every federation scenario Microsoft documents**, Kubernetes included (and not limited to Azure Kubernetes Service — AWS's EKS and GCP's GKE are both named): an external workload gets a token from its own IdP, trades it for a platform access token after a trust-relationship check, and uses that access token. The only thing that differs between scenarios is which external IdP is on the other end of that trust relationship.
- **A permissions boundary and an SCP are the same rule at two different scopes.** Both are stated, in AWS's own words, as never granting permissions — only capping what an identity-based policy can grant, by intersection. The boundary caps one user or role; the SCP caps every entity in an account, root user included, and the management account sits entirely outside its reach.
- **`iam:PassRole` is a named, documented escalation path, not folklore.** AWS's own worked example (Alice, who has no S3 permissions of her own, passing a role that does have them) describes exactly the mechanism this topic reproduces. The fix AWS itself names is scoping the Resource element of the PassRole statement — not a permission boundary on the user passing the role.

</section>

<section data-section="production">

## Production

A common, real-shaped incident: a platform team grants a CI/CD service principal `iam:PassRole` with an unscoped Resource so that pipeline can deploy using whichever role each project needs, reasoning that every role that exists today is already least-privilege. Months later, a different team creates a new, broadly-permissioned role for an unrelated migration project. Nothing about the CI service principal's own policy changed — but because its PassRole statement was never scoped to specific roles, it can now pass that new role too, and a pipeline run anyone can trigger ends up holding permissions nobody intended to give it. The fix a team converges on is the one this topic reproduces directly: scope PassRole's Resource element to an approved naming pattern from the start, so a role created later for an unrelated purpose is never automatically passable.

</section>

<section data-section="frontier">

## Frontier

This topic's role-separation design (raw role, curated role, zero shared permissions) feeds directly into the chapter's own 10.1 lab's identity framing and into a later topic's closing architecture decision record — both treat "which role can touch which layer" as a design decision made once here, not re-derived from scratch each time.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A role answers who may act. It says nothing about the other kind of secret a pipeline needs — a database password, a third-party API key — which has to live somewhere between deployments, and that somewhere is its own discipline, which is exactly the next topic.

</section>
