# Outline — de.access-control-models-rbac

**Kind:** full, §13.2. About 15 minutes.

## Scope (full syllabus line, six clauses)

"role explosion in RBAC, attribute/tag-based policies, policy decision vs enforcement points,
policy engines (OPA, Cedar), federation with the enterprise IdP (SAML/OIDC, SCIM provisioning),
periodic access reviews."

- Clause 1: a role per team per dataset per environment multiplies arithmetically — N teams times
  M datasets times K environments — until the roles themselves are unreviewable, shown on the
  shop's own three domains.
- Clause 2: NIST SP 800-162's own definition of ABAC — a decision from attributes of the subject,
  object, operation and environment, evaluated against policy — with topic 4's classification
  tags standing in as the object attributes; one rule replaces hundreds of grants.
- Clause 3: a policy enforcement point sits in the data path and asks a policy decision point for
  a verdict; OPA's own description of decoupling policy from the service it governs is exactly
  this separation, letting one engine serve many enforcement points.
- Clause 4: Open Policy Agent (a general-purpose engine, principal/action/resource policies
  expressed in Rego) and Cedar (AWS's own principal/action/resource language), each illustrated by
  Trino's documented OPA integration, which asks OPA for access decisions, row filters and column
  masks.
- Clause 5: identities come from the company's identity provider through SAML or OpenID Connect
  (OIDC's own definition: "a simple identity layer on top of the OAuth 2.0 protocol"); accounts
  and group membership are provisioned and removed by SCIM (RFC 7644's own definition: an
  HTTP protocol for provisioning identity data in cross-domain, enterprise-to-cloud scenarios) —
  so offboarding someone in the IdP removes their data access everywhere downstream.
- Clause 6: entitlements accumulate silently; a scheduled review that lists who has what and why,
  with an owner who attests, catches the drift policy alone does not — its input is the same
  decision-point logs the *(skipped)* audit-logging topic would cover in depth.

## Outcomes

Compute the number of roles RBAC needs for a given team, dataset and environment count and show
where it stops being reviewable; write one ABAC rule over tags that replaces a list of grants and
test it on allow and deny cases; draw the decision point and enforcement point and say why they
are separate; state what SAML or OIDC and SCIM each do in the lifecycle of an account; design an
access review and say what it catches that policy alone does not.

## Concept ledger

- **Introduces:** `rbac-role-explosion`, `abac-tag-based-policy`, `policy-decision-enforcement-points`,
  `policy-engines-opa-cedar`, `idp-federation-scim-access-review`.
- **Uses:** `sensitivity-tier-and-category`, `tag-propagation-lineage`, `discovery-false-negatives`
  (topic 4, live in this chapter), `crypto-shredding-key-deletion` (topic 5, live in this chapter),
  `file-permissions` (Chapter 1, confirmed live: the Unix permission model as the simplest
  access-control list).
- **Declared (gaps, logged per `CHAPTER.md` §"Cross-chapter ids"):** Chapter 10's workload-identity
  topic (§10.1, `de.workload-identity-least-privilege`) and catalog-enforced-access/credential-vending
  topic (§10.2, `de.catalog-enforced-access-credential` or equivalent) are both unresolvable —
  confirmed: Chapter 10 has only two topics built so far (`de.failure-domains-regions-zones`,
  `de.object-storage-semantics-data`, both §10.1 cloud-foundations topics, neither introducing an
  identity or catalog-credential id). Named `data-cloud-iam-identity-ch10` and
  `data-catalog-credential-vending-ch10` and declared. Also declared per `CHAPTER.md`'s own entry:
  the idea of a role and a permission, taken as already known.

## Storyboard (11 steps)

1. **Hook.** The shop has fourteen teams, sixty datasets and three environments, and security
   asks for "a role per team per dataset per environment, for least privilege." Count the roles.
2. **Predict:** when the data science team gets a new dataset with a restricted column, which
   approach needs one change, and which needs fourteen — RBAC, or tag-based ABAC?
3. **Reveal: the role count, done out.** Teams times datasets times environments is the role
   count, and it is not a one-time number — it grows with every new team, dataset or environment,
   until nobody can say what a given role actually grants anymore.
4. **Reveal: one rule, read from tags, instead.** NIST's own ABAC definition — a decision from the
   subject's, object's and environment's attributes — turns topic 4's classification tags into the
   object attributes one short rule reads, replacing the whole grid of roles.
5. **Reveal: the decision point and the enforcement point are separate.** The enforcement point
   sits where data is actually read and asks the decision point for a verdict; OPA's own
   description is decoupling policy from the service it governs, so many enforcement points can
   share one decision engine.
6. **Reveal: what the policy engines actually hand back.** OPA, in Rego, and Cedar, in its own
   principal/action/resource language, both evaluate a request and return a verdict; Trino's own
   OPA integration asks for exactly that: an access decision, a row filter, or a column mask.
7. **Reveal: identity comes from outside, through the IdP.** SAML or OIDC — OIDC's own definition,
   an identity layer on top of OAuth 2.0 — authenticates a person once at the company's identity
   provider; every downstream system trusts that single proof.
8. **Reveal: SCIM keeps accounts and groups in sync.** RFC 7644's own definition — an HTTP
   protocol provisioning identity data across the enterprise-to-cloud boundary — is what actually
   creates and removes accounts and group membership as people join, move and leave.
9. **Reveal: offboarding in one place, everywhere at once.** Because SCIM provisioning and IdP
   group membership are the single source every downstream system trusts, removing someone from
   the IdP removes their access to every system wired to it, without a single extra ticket.
10. **Reveal: periodic access reviews catch what policy never will.** A scheduled review listing
    who has what and why, with an owner who attests, is the control for entitlements a correct
    policy quietly accumulates and never sheds on its own.
11. **Recap and Prove it:** given the shop's grid of teams, datasets and environments, and one new
    restricted dataset landing in every team's hands at once, which approach's edit count actually
    changes, and by how much?

## Visual idea

A grid of teams by datasets filling with role chips until it is unreadable, the count racing up
with every new team or dataset; beside it, the same access expressed as three tag-reading rules,
the grid collapsing to a short list the moment ABAC is drawn. A second frame draws the decision
point as a box between a request arrow and the data, returning a verdict chip (allow, deny,
filter, mask) that the enforcement point applies, with OPA and Cedar each labelled as one way to
fill that box. A third strip shows a single IdP box with a line to every downstream system; one
account removed at the IdP and every downstream line going dark at once, with a SCIM-provisioning
arrow doing the actual account removal in each system.

## `examples.py` plan

Synthetic (plain Python, no RBAC/ABAC library — small functions that count roles and evaluate a
tag-based rule, the mechanism's own arithmetic, not a production policy engine):

1. `rbac_role_count`: given counts of teams, datasets and environments, compute the number of
   roles RBAC needs under "a role per team per dataset per environment," and how that count
   changes when one more dataset is added to every team's scope.
2. `abac_rule_evaluation`: a single rule ("analysts may read tier confidential or below, never
   category PII without a purpose attribute") evaluated against a synthetic table of access
   requests (subject attributes, object tags, a purpose attribute), returning allow/deny per
   request and the count of each.
3. `abac_edit_count_for_new_dataset`: simulate a new restricted dataset landing in every team's
   hands; count how many edits RBAC needs (one role per team touched) versus how many ABAC needs
   (the dataset's own tag, set once), confirming the hook's own claim.
4. `access_review_catches_drift`: a synthetic roster of grants, some stale (granted for a project
   that ended, never revoked); a periodic-review pass that flags every grant whose stated purpose
   no longer matches an active project, catching what the tag rule alone, evaluated correctly
   every time, would never flag on its own.
5. `main`: runs all four and prints the role counts, allow/deny counts, edit counts and the
   number of stale grants caught.

## Bridge and handoff

- **Bridge** (from `CHAPTER.md`, answers topic 6's handoff verbatim): "Whether a dataset is
  personal data decides what you must protect. The next question is who inside your own company
  may read it, and how that rule is written down so a machine can apply it. This topic is the
  access-control models: roles, attributes and policy as code."
- **Handoff** (to topic 8, verbatim): "A policy says what is allowed. Something still has to
  enforce it where the data is read, and an application-level check is the weakest place to do
  it. The next topic is enforcing it inside the query engine: row filters, column masks and the
  paths around them."

## Changes from the chapter plan

One gap, logged rather than guessed: `CHAPTER.md` cites Chapter 10 §10.1 (workload identity) and
§10.2 (catalog-enforced access, credential vending) as `uses` sources. Chapter 10 has only two
topics built so far — `de.failure-domains-regions-zones` and `de.object-storage-semantics-data`,
both §10.1 cloud-foundations topics that introduce no identity or catalog-credential id (confirmed
by checking their `registry.ts` entries). Both cited sections are declared rather than used, named
here and in `post-notes.md`'s "Frontier" rather than silently dropped.

The *(skipped)* syllabus topic "Audit logging and tamper evidence" is named in the Deep dive as
the fuller treatment of the decision-point logs a periodic access review draws on, per
`CHAPTER.md`'s own instruction, and not built.
