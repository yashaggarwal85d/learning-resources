Last verified: 1 November 2026. Expert sign-off: pending. Two synthetic experiments run in
`examples.py` (RBAC role-count arithmetic swept across several team/dataset/environment sizes,
and a single ABAC predicate tested on an allow case and two distinct deny cases) — all asserts
pass.

- NIST, "Role Based Access Control": [csrc.nist.gov](https://csrc.nist.gov/projects/role-based-access-control). RBAC's own stated purpose and mechanism.
- NIST, "SP 800-162: Guide to Attribute Based Access Control (ABAC)": [nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/specialpublications/NIST.SP.800-162.pdf). The formal ABAC definition.
- Open Policy Agent, documentation: [openpolicyagent.org](https://www.openpolicyagent.org/docs/latest/). The decision-point / enforcement-point split.
- Cedar Policy Language Reference Guide, "Terms & concepts": [docs.cedarpolicy.com](https://docs.cedarpolicy.com/overview/terminology.html). Principals, actions, resources, and RBAC/ABAC as policy styles.
- Trino documentation, "Open Policy Agent access control": [trino.io](https://trino.io/docs/current/security/opa-access-control.html). Row filters and column masks returned as OPA decisions.
- Databricks documentation, "Attribute-based access control (ABAC) in Unity Catalog": [docs.databricks.com](https://docs.databricks.com/aws/en/data-governance/unity-catalog/abac/). Governed tags as ABAC attributes.
- OpenID Foundation, "OpenID Connect Core 1.0": [openid.net](https://openid.net/specs/openid-connect-core-1_0.html). Identity verification layered on OAuth 2.0.
- IETF, "RFC 7644: System for Cross-domain Identity Management: Protocol": [rfc-editor.org](https://www.rfc-editor.org/rfc/rfc7644). Cross-domain identity provisioning (SCIM).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=access-control-models-rbac:%20).
