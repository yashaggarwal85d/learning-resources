Last verified: 30 October 2026. Expert sign-off: pending. Four synthetic experiments run in
`examples.py` (plain arithmetic and rule evaluation, never a real OPA/Cedar instance): an RBAC
role count, an ABAC rule evaluated against synthetic requests, an edit-count comparison between
the two models for one new dataset, and an access review over synthetic grants — all asserts
pass.

- NIST, "Role Based Access Control" (project page, INCITS 359-2012): [csrc.nist.gov](https://csrc.nist.gov/projects/role-based-access-control). The RBAC reference model's own vocabulary.
- NIST SP 800-162, "Guide to Attribute Based Access Control (ABAC) Definition and Considerations": [csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/162/final). The federal ABAC definition.
- Open Policy Agent, "Philosophy": [openpolicyagent.org](https://www.openpolicyagent.org/docs/philosophy). Decoupling policy from the service it governs.
- Cedar Policy Language, "Terms & concepts": [docs.cedarpolicy.com](https://docs.cedarpolicy.com/overview/terminology.html). Principals, actions, resources and Cedar's own ABAC support.
- Trino, "Open Policy Agent access control": [trino.io](https://trino.io/docs/current/security/opa-access-control.html). Row filtering and column masking sourced from OPA.
- Databricks, "Attribute-based access control in Unity Catalog": [docs.databricks.com](https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/). ABAC built on governed tags.
- OpenID Foundation, "OpenID Connect Core 1.0": [openid.net](https://openid.net/specs/openid-connect-core-1_0.html). An identity layer on top of OAuth 2.0.
- IETF, RFC 7644, "System for Cross-domain Identity Management: Protocol": [rfc-editor.org](https://www.rfc-editor.org/rfc/rfc7644). The SCIM provisioning protocol.
- OASIS, "Security Assertion Markup Language (SAML) V2.0, Assertions and Protocols": [docs.oasis-open.org](https://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf). XML-encoded assertions about authentication and authorization.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=access-control-models-rbac:%20).
