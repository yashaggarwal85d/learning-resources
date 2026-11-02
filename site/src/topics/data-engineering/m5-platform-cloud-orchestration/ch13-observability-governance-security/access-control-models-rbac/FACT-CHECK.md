# Fact-check — de.access-control-models-rbac

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | RBAC manages security at the level of roles: each user is assigned one or more roles, each role is assigned privileges. | NIST, Role Based Access Control project page | Confirmed, quoted verbatim. |
| 2 | ABAC authorization is determined by evaluating attributes of the subject, object, requested operations, and environment conditions against policy. | NIST SP 800-162 | Confirmed, quoted verbatim. |
| 3 | OPA decouples policy decision-making from policy enforcement; software queries OPA with structured data to get a decision. | Open Policy Agent documentation | Confirmed, quoted verbatim. |
| 4 | Cedar policies describe which principals may perform which actions on which resources, supporting both RBAC (via groups/roles) and ABAC (via attributes). | Cedar Policy Language Reference Guide | Confirmed, quoted verbatim. |
| 5 | Trino's OPA integration supports row filtering (removing rows) and column masking (obscuring column data), both fetched from OPA as policy responses. | Trino documentation | Confirmed, quoted verbatim. |
| 6 | Unity Catalog ABAC determines access by evaluating attributes represented through governed tags. | Databricks documentation | Confirmed, quoted verbatim. |
| 7 | OIDC is a simple identity layer on top of OAuth 2.0 that lets a client verify a user's identity based on authentication by an authorization server. | OpenID Connect Core 1.0 | Confirmed, quoted verbatim. |
| 8 | SCIM is an application-level HTTP-based protocol for provisioning and managing identity data across domains such as enterprise-to-cloud providers. | RFC 7644 | Confirmed, quoted verbatim. |
| 9 | 14 teams x 60 datasets x 3 environments, one role per combination, is 2,520 roles. | This course's own measurement (`examples.py`) | Confirmed, assert passes. |
| 10 | Adding one new restricted dataset for one team costs 3 new RBAC roles (one per environment) versus 0 ABAC rule edits, when the dataset is already tagged the way the existing rule reads. | This course's own measurement (`examples.py`) | Confirmed, assert passes. |
| 11 | A single ABAC predicate correctly allows an analyst reading confidential non-PII data, denies a read above the confidential tier, denies PII without a purpose attribute, and allows PII with one. | This course's own measurement (`examples.py`) | Confirmed, assert passes. |

## Red-team: the predict questions (steps 3 and 6)

**Question 1 (step 3):** given 14 teams, 60 datasets, 3 environments and one role per
combination, how many roles result?

**Attack — "most teams only touch a handful of datasets, so the real number is much smaller."**
This confuses the stated policy ("a role per team per dataset per environment, for least
privilege") with a realistic subset of actual usage. The policy as stated creates a role for
every combination whether or not a team uses it yet; `examples.py`'s own measurement
(2,520 roles) is the literal count the stated policy produces, not an estimate of real usage.

**Question 2 (step 6):** when data science gets a new restricted dataset, how many new roles
does RBAC need, versus how many new ABAC edits?

**Attack — "a new dataset always costs the same number of changes, no matter the model."** This
assumes RBAC's grants are role-blind to tags, which is exactly the property ABAC removes. The
measurement shows RBAC genuinely needing 3 new roles (one per environment) while ABAC needs 0,
because the existing rule reads a tag the new dataset already carries — the two models are not
equally expensive to extend by construction, not just in this one example.

## Abandoned approaches

Measuring role explosion with a role hierarchy (senior roles inheriting junior roles'
permissions) was considered, since the ANSI/INCITS 359 standard names this as a real mitigation
within RBAC itself. It was left out of `examples.py` because it would understate the worst-case
arithmetic the hook's own scenario describes ("a role per team per dataset per environment");
the hierarchy mitigation is instead named explicitly in `coverage.json`'s `{"deep": "Frontier"}`
item and `post-notes.md`, rather than silently baked into the measured claim.
