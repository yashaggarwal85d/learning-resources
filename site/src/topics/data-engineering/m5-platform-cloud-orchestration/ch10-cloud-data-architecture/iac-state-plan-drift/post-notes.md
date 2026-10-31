---
id: de.iac-state-plan-drift
title: 'IaC state, plan and drift'
---

<section data-section="outcomes">

## Outcomes

- Explain why a state file, not the live cloud, is what a plan diffs against, and what a lock prevents.
- Run plan/apply/import against a local backend and detect drift after an out-of-band change.
- Design a module boundary that keeps a bucket, its catalog registration and its IAM role as one reviewable unit.
- State what changed in Terraform's licensing in 2023 and why OpenTofu exists.
- Make a policy-as-code gate actually block a bad plan.

</section>

<section data-section="internals">

## Internals

- **State is the single fact everything else in this topic depends on.** A plan, a lock, drift and import are all defined in terms of the state file, not the live cloud — a learner who thinks "plan" means "ask the cloud what's different" has missed the one idea the rest of the topic builds on.
- **A lock is a hard block on the state file, not an advisory warning.** `examples.py`'s own reproduction shows the second `acquire_lock` call failing outright while the first holder still holds it — there is no race to lose if the second operation never starts.
- **Drift and import are the same gap, approached from opposite directions.** Drift is the tool discovering reality moved without it; import is the tool catching up to a reality that already changed, deliberately without recreating the resource.
- **A module boundary is a review-unit decision, not a technical requirement.** Nothing stops a bucket, its catalog entry and its IAM role from being three separate resources — bundling them as one module is a choice about what one pull request should have to account for at once.
- **The 2023 BSL relicensing changed a legal fact, not a technical one.** Terraform the tool didn't stop working for anyone on the day of the license change; what changed was whether using it, building on it, or redistributing it carried legal risk — which is exactly why OpenTofu exists as a separate, Linux-Foundation-governed answer to that risk.

</section>

<section data-section="production">

## Production

A platform team adds a Sentinel policy that blocks any plan creating a public-facing storage bucket, confident the gate now covers every future mistake of that shape. Eight months later, an engineer achieves the same effect through a different resource type the policy's rule never named, and the plan sails through — the gate works exactly as written, and the gap was never in the enforcement, it was in the rule's own coverage.

</section>

<section data-section="frontier">

## Frontier

The IaC licensing landscape kept moving after the 2023 fork: OpenTofu's own feature set (state encryption, provider-for-each, and others) has continued to diverge from Terraform's as both projects develop independently, and Pulumi and AWS CDK's own feature sets keep expanding their general-purpose-language coverage. The mechanisms this topic teaches — state as the tool's own record, locking as the collision guard, plan/apply as dry-run-then-commit, drift/import as the same gap from two directions, and a policy gate as an enforced check — stay the right questions to ask regardless of which specific tool or fork a team ends up choosing.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A reproducible platform is the precondition for answering what it actually costs and attributing that cost fairly — which is where this section, and the chapter's own cost thread from 10.1, converge.

</section>
