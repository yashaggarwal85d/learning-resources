# Sources: Access-control models: RBAC, ABAC, policy-as-code (`de.access-control-models-rbac`)

NIST's own RBAC project page and SP 800-162 (ABAC), Open Policy Agent's documentation, the Cedar
language reference, Trino's OPA access-control documentation, Databricks' Unity Catalog ABAC
documentation, the OpenID Connect Core specification, and RFC 7644 (SCIM) are all fetched
directly.

## Role Based Access Control (NIST, Computer Security Resource Center)

URL: https://csrc.nist.gov/projects/role-based-access-control
Version: retrieved 2026-11-01

> Security administration can be costly and prone to error because administrators usually specify access control lists for each user on the system individually. With RBAC, security is managed at a level that corresponds closely to the organization's structure. Each user is assigned one or more roles, and each role is assigned one or more privileges that are permitted to users in that role.

Contents: RBAC's own stated purpose and mechanism -- one role holding many privileges, one user
holding one or more roles -- the basis for this topic's role-explosion arithmetic.

## NIST Special Publication 800-162 — Guide to Attribute Based Access Control (ABAC)

URL: https://nvlpubs.nist.gov/nistpubs/specialpublications/NIST.SP.800-162.pdf
Version: January 2014

> ABAC is a logical access control methodology where authorization to perform a set of operations is determined by evaluating attributes associated with the subject, object, requested operations, and, in some cases, environment conditions against policy, rules, or relationships that describe the allowable operations for a given set of attributes.

Contents: the formal definition of attribute-based access control, naming the subject, object and
environment attributes a policy decision evaluates -- the "attribute/tag-based policies" clause
of this topic's own scope line.

## Open Policy Agent documentation

URL: https://www.openpolicyagent.org/docs/latest/
Version: retrieved 2026-11-01

> OPA decouples policy decision-making from policy enforcement. When your software needs to make policy decisions it queries OPA and supplies structured data (e.g., JSON) as input.

Contents: the policy decision point / policy enforcement point split, in OPA's own words -- the
"policy decision vs enforcement points" clause.

## Cedar Policy Language Reference Guide — Terms & concepts

URL: https://docs.cedarpolicy.com/overview/terminology.html
Version: retrieved 2026-11-01

> Cedar lets you describe permissions by creating policies as text documents that describe which principals are allowed to perform which actions, on which resources, and in a specific context.

> Role-based access control (RBAC) – Cedar lets you define roles that receive a set of permissions granted by associating policies with the role.

> Attribute-based access control (ABAC) – Cedar uses the attributes attached to the principal and the resource to determine the permissions.

Contents: Cedar's own principal/action/resource model, and its own statement that it supports
both RBAC and ABAC as policy styles over the same engine -- the "policy engines (OPA, Cedar)"
clause.

## Trino documentation — Open Policy Agent access control

URL: https://trino.io/docs/current/security/opa-access-control.html
Version: retrieved 2026-11-01 (Trino 484)

> Row filtering allows Trino to remove some rows from the result before returning it to the caller, controlling what data different users can see.

> Column masking allows Trino to obscure data in one or more columns of the result set for specific users, without outright denying access.

Contents: Trino's own documented behaviour when OPA is configured as its access-control engine --
row filters and column masks returned as part of an access decision, confirming the "how Trino's
documented OPA integration asks OPA for access decisions, row filters and column masks" clause.

## Databricks documentation — Attribute-based access control (ABAC) in Unity Catalog

URL: https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/
Version: retrieved 2026-11-01

> Attribute-based access control (ABAC) is an access control model in Unity Catalog where access is determined by evaluating attributes associated with securable objects. These attributes, represented through governed tags, are used in policy conditions to identify which data a policy should protect.

Contents: Unity Catalog's own ABAC model built on governed tags, confirming the same ABAC shape
described abstractly in NIST SP 800-162 as a real, shipped product feature.

## OpenID Connect Core 1.0 (incorporating errata set 2)

URL: https://openid.net/specs/openid-connect-core-1_0.html
Version: retrieved 2026-11-01

> OpenID Connect 1.0 is a simple identity layer on top of the OAuth 2.0 protocol. It enables Clients to verify the identity of the End-User based on the authentication performed by an Authorization Server, as well as to obtain basic profile information about the End-User in an interoperable and REST-like manner.

Contents: OIDC's own stated purpose -- identity verification layered on OAuth 2.0, the single
sign-on half of the "federation with the enterprise IdP (SAML/OIDC, SCIM provisioning)" clause.

## RFC 7644 — System for Cross-domain Identity Management: Protocol (SCIM)

URL: https://www.rfc-editor.org/rfc/rfc7644
Version: September 2015

> The SCIM protocol is an application-level HTTP-based protocol for provisioning and managing identity data on the web and in cross-domain environments such as enterprise-to-cloud service providers or inter-cloud scenarios.

> SCIM's intent is to reduce the cost and complexity of user management operations by providing a common user schema, an extension model, and a service protocol defined by this document.

Contents: SCIM's own stated purpose -- a standardised protocol for provisioning and
de-provisioning identities across domains -- the provisioning half of the federation clause, and
the mechanism behind this topic's "offboarding removes access everywhere" claim.

Note on source naming: CHAPTER.md names "the OASIS SAML 2.0 specifications" alongside OIDC for
the single-sign-on clause; this topic quotes OIDC Core directly (fetched cleanly) and names SAML
2.0 by its own published role (an XML-based federated single-sign-on protocol predating OIDC)
without a direct quote, since the OASIS SAML 2.0 core specification is not reachable as
fetchable static text in this sandbox (oasis-open.org serves it behind a document viewer here).
The reel and notes treat SAML and OIDC as two protocols serving the same single-sign-on role,
consistent with how `CHAPTER.md` itself describes the clause ("SAML or OpenID Connect") without
requiring a single worked example of each.
