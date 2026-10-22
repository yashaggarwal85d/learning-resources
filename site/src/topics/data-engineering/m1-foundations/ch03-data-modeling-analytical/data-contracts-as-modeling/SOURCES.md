# Sources — de.data-contracts-as-modeling

The Open Data Contract Standard's own specification (Bitol, Linux Foundation), fetched and
quoted directly, matching CHAPTER.md's attribution instruction. This topic has no lab of its
own (`CHAPTER.md`).

## Open Data Contract Standard, "Definition: Open Data Contract Standard (ODCS)"

URL: https://bitol-io.github.io/open-data-contract-standard/latest/
Fetched: 2026-10-22.

Quotes:
> This document describes the keys and values expected in a YAML data contract, per the Open Data Contract Standard.

Items: (1) the contract's own format — a structured document with keys and values, not free text; (2) the standard's own name and governing body (Bitol, under the Linux Foundation).

## Open Data Contract Standard, "Fundamentals"

URL: https://bitol-io.github.io/open-data-contract-standard/latest/fundamentals/
Fetched: 2026-10-22.

Quotes:
> Version of the standard used to build data contract. Default value is v3.2.0.

> Current status of the data contract. Examples are "proposed", "draft", "active", "deprecated", "retired".

Items: (1) the standard's own version field, confirming the current spec version at fetch time; (2) status as a named, enumerated field, not free text — a contract's own lifecycle state is itself specified.

### Disclosure: version drift

CHAPTER.md's own scope line names "v3.1" as the current version; the fetched specification's
own default `apiVersion` reads `v3.2.0` at the time of this research (2026-10-22), with features
explicitly marked "Added in v3.2.0" throughout the Schema and SLA pages. This topic quotes and
teaches against the actual current version fetched (v3.2.0), and flags the discrepancy here
rather than silently teaching a version the standard itself has since moved past.

## Open Data Contract Standard, "Schema"

URL: https://bitol-io.github.io/open-data-contract-standard/latest/schema/
Fetched: 2026-10-22.

Quotes:
> This section describes the schema of the data contract. It is the support for data quality, which is detailed in the next section. Schema supports both a business representation of your data and a physical implementation. It allows to tie them together.

> businessName: transaction reference date

Items: (1) schema is explicitly both a business (semantic) representation and a physical implementation, tied together in one artifact, not two separate documents; (2) a concrete example field (`businessName`) showing a schema property carrying its business meaning directly alongside its physical type.

## Open Data Contract Standard, "Data Quality"

URL: https://bitol-io.github.io/open-data-contract-standard/latest/data-quality/
Fetched: 2026-10-22.

Quotes:
> This section describes data quality rules & parameters. They are tightly linked to the schema described in the previous section.

> Data quality rules support different levels/stages of data quality attributes:

Items: (1) quality rules are a named, specified section of the contract, not an informal afterthought; (2) quality rules are explicitly tied to the schema they check, not a separate, disconnected concern.

## Open Data Contract Standard, "Service-Level Agreement"

URL: https://bitol-io.github.io/open-data-contract-standard/latest/service-level-agreement/
Fetched: 2026-10-22.

Quotes:
> This section describes the service-level agreements (SLA).

> Specific property in SLA, check the Data QoS periodic table. May require units.

Items: (1) SLAs are their own named, specified section with enumerated properties (availability, latency, retention, and others), not a loose promise; (2) each SLA property has a required, structured value — an SLA in ODCS is a checkable field, not prose.

## Open Data Contract Standard, "Team"

URL: https://bitol-io.github.io/open-data-contract-standard/latest/team/
Fetched: 2026-10-22.

Quotes:
> This section lists team members and the history of their relation with this data contract.

> role: Owner

Items: (1) ownership is tracked as part of the contract's own team structure, not left implicit; (2) the standard's own worked example names a team member's role explicitly as "Owner," confirming ownership is a first-class, named role in the contract.

### Disclosure

No numeric claim is made anywhere in this topic beyond what the specification states directly
(field names, the fetched version number, enumerated SLA property names). This topic has no lab
of its own to measure anything independently.
