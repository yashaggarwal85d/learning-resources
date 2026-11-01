<section data-section="outcomes">

## Outcomes

Compute the number of roles RBAC needs for a given team, dataset and environment count and show
where it stops being reviewable; write one ABAC rule over tags that replaces a list of grants
and test it on allow and deny cases; draw the decision point and enforcement point and say why
they are separate; state what SAML or OIDC and SCIM each do in the lifecycle of an account;
design an access review and say what it catches that policy alone does not.

</section>

<section data-section="one-rule-many-engines">

## One rule, many engines

`examples.py`'s own `analyst_rule` is deliberately a plain Python predicate rather than a Rego
or Cedar program, because the point of this topic is the *shape* of an ABAC decision — subject
attributes, object attributes, a policy expression — not a specific policy language's syntax.
The same rule, expressed in OPA's Rego or in Cedar, would still take the same three inputs and
return the same decision; Trino's own OPA integration shows the real-world version of this,
returning not just allow/deny but a row filter or a column mask as part of one decision. The one
subtlety worth dwelling on: the rule doesn't just deny PII outright, it conditions on a `purpose`
attribute — the same analyst can read the same row for a stated, legitimate reason. ABAC's value
isn't that it's more restrictive than RBAC; it's that one rule like this can express a condition
RBAC would need a separate role to express at all.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating RBAC's role count as free.** The hook's own arithmetic — fourteen teams, sixty
datasets, three environments, one role per combination — produces 2,520 roles before anyone has
reviewed a single one. A role-per-combination scheme that looked clean at ten teams and five
datasets becomes unreviewable well before it reaches this shop's actual size, and nobody
notices until an access review (or an incident) forces someone to actually read the list.

**Confusing a policy engine's decision with its enforcement.** OPA's own documentation is
explicit that it only decides — something else, the enforcement point, still has to carry that
decision out wherever the data actually lives. A system that asks the right question but has no
enforcement point wired into the actual query path has written a policy that protects nothing.

</section>

<section data-section="frontier">

## Frontier

Role hierarchies and mutually exclusive role constraints, both named in the ANSI/INCITS 359 RBAC
standard, can blunt some of RBAC's own role explosion without moving to ABAC at all — a senior
role inheriting a junior role's permissions avoids duplicating every grant, and this topic's own
measurement (a flat role-per-triple count with no hierarchy) is the worst case RBAC is capable
of, not the only shape it can take.

</section>
