## NIST — Role Based Access Control (project page)

URL: https://csrc.nist.gov/projects/role-based-access-control
Version: INCITS 359-2012 (fetched 2026-10-30)

> This standard [an update of INCITS 359-2004] consists of two main parts the RBAC Reference Model and the RBAC System and Administrative Functional Specification. The RBAC Reference Model defines sets of basic RBAC elements (i.e., users, roles,permissions, operations and objects) and relations as types and functions that are included in this standard.

Contents:
1. The standard's own basic RBAC vocabulary: users, roles, permissions, operations and objects, and the relations between them.

## NIST SP 800-162 — Guide to Attribute Based Access Control (ABAC)

URL: https://csrc.nist.gov/pubs/sp/800/162/final
Version: NIST Special Publication 800-162 (fetched 2026-10-30)

> ABAC is a logical access control methodology where authorization to perform a set of operations is determined by evaluating attributes associated with the subject, object, requested operations, and, in some cases, environment conditions against policy, rules, or relationships that describe the allowable operations for a given set of attributes.

Contents:
1. The federal standard's own definition of ABAC: a decision made from attributes of the subject, the object, the operation and the environment, evaluated against policy.

## Open Policy Agent — Philosophy

URL: https://www.openpolicyagent.org/docs/philosophy
Version: Open Policy Agent documentation (fetched 2026-10-30)

> Today policy is often a hard-coded feature of the software service it actually governs. Open Policy Agent lets you decouple policy from that software service so that the people responsible for policy can read, write, analyze, version, distribute, and in general manage policy separate from the service itself.

> Services offload policy decisions to OPA by executing queries. OPA evaluates

Contents:
1. OPA's own description of policy decoupling: separating policy from the service it governs.
2. OPA's own description of how a service asks it for a decision — the decision point calling out to the engine.

## Cedar Policy Language — Terms & concepts

URL: https://docs.cedarpolicy.com/overview/terminology.html
Version: Cedar Policy Language Reference Guide (fetched 2026-10-30)

> Cedar lets you describe permissions by creating policies as text documents that describe which principals are allowed to perform which actions, on which resources, and in a specific context.

> Attribute-based access control (ABAC) – Cedar uses the attributes attached to the principal and the resource to determine the permissions. For example, a policy can state that all users that are tagged as the owner of a resource automatically have access.

Contents:
1. Cedar's own principal/action/resource/context policy shape.
2. Cedar's own description of its ABAC support, attributes attached to principal and resource.

## Trino — Open Policy Agent access control

URL: https://trino.io/docs/current/security/opa-access-control.html
Version: Trino 484 Documentation (fetched 2026-10-30)

> Row filtering allows Trino to remove some rows from the result before returning it to the caller, controlling what data different users can see. The plugin supports retrieving filter definitions from OPA by configuring the OPA endpoint for row filter processing with opa.policy.row-filters-uri.

Contents:
1. Trino's own description of row filtering sourced from an OPA endpoint, naming the exact configuration surface that asks OPA for the filter.

## Databricks — Attribute-based access control in Unity Catalog

URL: https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/
Version: Databricks on AWS documentation, last updated 22 October 2026 (fetched 2026-10-30)

> Attribute-based access control (ABAC) is an access control model in Unity Catalog where access is determined by evaluating attributes associated with securable objects. These attributes, represented through governed tags, are used in policy conditions to identify which data a policy should protect.

Contents:
1. Unity Catalog's own description of ABAC built on governed tags as the object attributes a policy reads.

## OpenID Foundation — OpenID Connect Core 1.0

URL: https://openid.net/specs/openid-connect-core-1_0.html
Version: OpenID Connect Core 1.0, incorporating errata set 2 (fetched 2026-10-30)

> OpenID Connect 1.0 is a simple identity layer on top of the OAuth 2.0 protocol. It enables Clients to verify the identity of the End-User based on the authentication performed by an Authorization Server, as well as to obtain basic profile information about the End-User in an interoperable and REST-like manner.

Contents:
1. OIDC's own definition: an identity layer on top of OAuth 2.0, verifying the end-user's authentication.

## IETF — RFC 7644, System for Cross-domain Identity Management: Protocol

URL: https://www.rfc-editor.org/rfc/rfc7644
Version: RFC 7644 (fetched 2026-10-30)

> The SCIM protocol is an application-level HTTP-based protocol for provisioning and managing identity data on the web and in cross-domain environments such as enterprise-to-cloud service providers or inter-cloud scenarios.

Contents:
1. SCIM's own definition: an HTTP protocol for provisioning and managing identity data, specifically naming the enterprise-to-cloud case this topic's federation clause depends on.

## OASIS — Security Assertion Markup Language (SAML) V2.0, Assertions and Protocols

URL: https://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf
Version: OASIS Standard, SAML Core 2.0 (fetched 2026-10-30)

> This specification defines the syntax and semantics for XML-encoded assertions about authentication, attributes, and authorization, and for the protocols that convey this information.

Contents:
1. SAML's own scope statement: XML-encoded assertions about authentication, attributes and authorization, and the protocols carrying them.
