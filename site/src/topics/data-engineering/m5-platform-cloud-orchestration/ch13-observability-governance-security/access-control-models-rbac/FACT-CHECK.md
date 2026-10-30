# Fact-check — de.access-control-models-rbac

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | NIST's RBAC standard defines its reference model over users, roles, permissions, operations and objects. | NIST, INCITS 359-2012 (RBAC project page) | Confirmed, quoted verbatim. |
| 2 | NIST SP 800-162: ABAC authorizes operations by evaluating attributes of the subject, object, operation and environment against policy. | NIST SP 800-162 | Confirmed, quoted verbatim. |
| 3 | OPA's own stated purpose: decoupling policy from the service it governs. | OPA Philosophy docs | Confirmed, quoted verbatim. |
| 4 | OPA: services offload policy decisions to OPA by executing queries — the decision-point call. | OPA Philosophy docs | Confirmed, quoted verbatim. |
| 5 | Cedar: policies describe which principals may perform which actions on which resources, in context. | Cedar Policy Language, Terms & concepts | Confirmed, quoted verbatim. |
| 6 | Cedar supports ABAC using attributes attached to the principal and resource. | Cedar Policy Language, Terms & concepts | Confirmed, quoted verbatim. |
| 7 | Trino's OPA integration retrieves row-filter definitions from a configured OPA endpoint. | Trino OPA access control docs | Confirmed, quoted verbatim. |
| 8 | Unity Catalog's ABAC determines access by evaluating attributes represented through governed tags. | Databricks Unity Catalog ABAC docs | Confirmed, quoted verbatim. |
| 9 | OIDC: a simple identity layer on top of OAuth 2.0, verifying end-user authentication. | OpenID Connect Core 1.0 | Confirmed, quoted verbatim. |
| 10 | SCIM (RFC 7644): an HTTP protocol for provisioning identity data in enterprise-to-cloud, cross-domain scenarios. | RFC 7644 | Confirmed, quoted verbatim. |
| 11 | SAML 2.0: XML-encoded assertions about authentication, attributes and authorization, and the protocols carrying them. | OASIS SAML Core 2.0 | Confirmed, quoted verbatim. |

## Red-team: the predict question (step 2)

**Question:** the data science team gets a new dataset with a restricted column. Under RBAC, does
this need one change, or fourteen (one per team)? Under tag-based ABAC, which is it?

**Attack 1 — "RBAC can just add one role for the new dataset, so it's one change too."** This
misses what "a role per team per dataset per environment" actually means: a new dataset needs a
new role *for every team* that should reach it, not one role shared across teams (RBAC's own
model, per NIST's reference model, ties a role to a specific set of permissions, not an open
attribute match). `examples.py`'s `abac_edit_count_for_new_dataset` makes this concrete by
counting the actual edits each model needs for the same change.

**Attack 2 — "ABAC needs the rule rewritten for every new dataset too, since the rule has to name
it."** False, and this is the entire point of attribute-based policy: the rule reads a tag
("tier", "category"), not a dataset name. A new dataset only needs the tag applied to it once —
done at classification time, topic 4's own mechanism — and every existing rule that reads that tag
already covers it, with zero rule edits.

**Attack 3 — "if ABAC is strictly better, why does RBAC still exist?"** RBAC's role model is
simpler to audit for a small, stable set of roles, and many systems (including Cedar's own
documented RBAC support via groups) implement RBAC as a special case of the same policy engine
used for ABAC — the topic does not claim RBAC is obsolete, only that its role count grows
multiplicatively while ABAC's rule count does not.

## Red-team: the federation claims (steps 7–9)

**Claim — "SAML and OIDC are the same thing, just two names for one protocol."** They are
different protocols with different formats (SAML's assertions are XML; OIDC is a JSON/REST
identity layer on OAuth 2.0, per its own abstract), named separately in the topic precisely
because a reader may encounter either depending on the IdP, not interchangeably as one mechanism.

**Claim — "turning off someone's IdP account instantly removes their data access everywhere."**
Overstated without SCIM: the IdP authenticates, but a downstream system's own accounts and group
memberships still need to be provisioned or de-provisioned to reflect that, which is exactly
SCIM's stated job (RFC 7644: "provisioning and managing identity data ... in cross-domain
environments"). The topic's reveal (step 9) states the mechanism as SCIM-driven, not automatic
from authentication alone.
