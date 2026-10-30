<section data-section="outcomes">

## Outcomes

Compute the number of roles RBAC needs for a given team, dataset and environment count and show
where it stops being reviewable; write one ABAC rule over tags that replaces a list of grants and
test it on allow and deny cases; draw the decision point and enforcement point and say why they
are separate; state what SAML or OIDC and SCIM each do in the lifecycle of an account; design an
access review and say what it catches that policy alone does not.

</section>

<section data-section="internals">

## Internals

`examples.py`'s `rbac_role_count` and `abac_edit_count_for_new_dataset` are deliberately plain
arithmetic, not a simulation of OPA or Cedar, because the point this topic makes is structural:
RBAC's role count is the product of every dimension a role is scoped to, so it grows
multiplicatively with each new dimension's size, while a tag-based rule's edit cost depends only
on how many *distinct attribute combinations* a policy needs to distinguish — adding one more
dataset changes neither the rule's structure nor its count, only the data the rule already reads.
`access_review_catches_drift` makes the subtler point concrete: `abac_rule_evaluation` is correct
on every call in the example, and the review still finds a stale grant, because nothing in the
rule's own evaluation can know that a project ended — that fact lives outside the policy entirely,
in whatever system of record tracks which projects are still active.

</section>

<section data-section="lab">

## Lab: none of its own

This topic hosts no lab of its own. The rule designed here — "analysts may read tier confidential
or below, never category PII without a purpose attribute" — is the one topic 8 enforces inside
the query engine, and the one topic 13's self-serve registration flow checks against before a new
table becomes discoverable.

</section>

<section data-section="production">

## Production failures this topic warns about

**Scaling RBAC past the point anyone can review it.** The hook's own numbers — fourteen teams,
sixty datasets, three environments — already produce a role count in the thousands under "a role
per team per dataset per environment." Every additional team, dataset or environment multiplies
that further, and a role grid nobody can read is a role grid nobody can actually audit for
over-permissioning.

**Treating a correctly-evaluated policy as a complete control.** A tag-based rule evaluated
exactly as written is not the same as a grant that still makes sense. The project that justified
an access grant can end while the grant itself, and the rule that honours it, both stay perfectly
correct — which is exactly why a periodic access review exists as a separate, independent check.

</section>

<section data-section="frontier">

## Frontier

Audit logging and tamper evidence (the *(skipped)* syllabus topic) is named here only: the fuller
treatment of the decision-point logs a periodic access review's own input depends on. Chapter 10's
workload-identity topic (§10.1) and catalog-enforced-access/credential-vending topic (§10.2),
which `CHAPTER.md` cites as background for this topic, are not yet built as of this writing
(confirmed: Chapter 10 has only two topics built so far, both cloud-foundations topics introducing
no identity or catalog-credential id) — named here as the gap, not guessed at.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A policy says what is allowed. Something still has to enforce it where the data is read, and an
application-level check is the weakest place to do it. The next topic is enforcing it inside the
query engine: row filters, column masks and the paths around them.

</section>
