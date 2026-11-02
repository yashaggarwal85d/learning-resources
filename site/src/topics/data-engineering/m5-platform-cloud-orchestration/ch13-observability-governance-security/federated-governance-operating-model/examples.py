"""Measured claims for de.federated-governance-operating-model.

This topic's own lab (per CHAPTER.md: "build and run the self-serve registration check
[schema, contract, classification tags] that blocks an unregistered table from becoming
discoverable") is built here directly in Python, modeling the mechanism Dehghani's own article
describes: a central body defines policy once, and "the platform" (this module's
TableRegistrationGate) enforces it automatically rather than a human reviewing each table.

Claim: a table that satisfies every centrally-defined rule (a required schema field, a
required contract field, a required classification tag) is admitted and becomes discoverable;
a table missing exactly one of those -- here, a classification tag -- is rejected, and the
rejection names the specific rule it failed, not just "no."
"""

from dataclasses import dataclass, field


@dataclass
class TableSubmission:
    name: str
    owner: str
    schema_fields: list[str]
    contract_fields: list[str]
    classification_tags: list[str]


@dataclass
class RegistrationResult:
    admitted: bool
    failed_rules: list[str] = field(default_factory=list)


REQUIRED_SCHEMA_FIELDS = {"column_name", "data_type"}
REQUIRED_CONTRACT_FIELDS = {"owner", "sla"}
REQUIRED_CLASSIFICATION_TAGS = {"sensitivity_tier"}


class TableRegistrationGate:
    """The platform's own automatic enforcement of centrally-defined policy: a table is
    discoverable only once it passes every rule, with no human review in the loop."""

    def check(self, submission: TableSubmission) -> RegistrationResult:
        failed = []
        if not REQUIRED_SCHEMA_FIELDS.issubset(set(submission.schema_fields)):
            missing = REQUIRED_SCHEMA_FIELDS - set(submission.schema_fields)
            failed.append(f"schema missing: {', '.join(sorted(missing))}")
        if not REQUIRED_CONTRACT_FIELDS.issubset(set(submission.contract_fields)):
            missing = REQUIRED_CONTRACT_FIELDS - set(submission.contract_fields)
            failed.append(f"contract missing: {', '.join(sorted(missing))}")
        if not REQUIRED_CLASSIFICATION_TAGS.issubset(set(submission.classification_tags)):
            missing = REQUIRED_CLASSIFICATION_TAGS - set(submission.classification_tags)
            failed.append(f"classification missing: {', '.join(sorted(missing))}")
        return RegistrationResult(admitted=not failed, failed_rules=failed)


def main() -> None:
    gate = TableRegistrationGate()

    compliant = TableSubmission(
        name="orders.daily_summary",
        owner="orders-domain",
        schema_fields=["column_name", "data_type"],
        contract_fields=["owner", "sla"],
        classification_tags=["sensitivity_tier"],
    )
    result = gate.check(compliant)
    assert result.admitted, "a table meeting every centrally-defined rule should be admitted"
    assert result.failed_rules == [], "an admitted table should have no failed rules listed"

    missing_tag = TableSubmission(
        name="customers.raw_signups",
        owner="customers-domain",
        schema_fields=["column_name", "data_type"],
        contract_fields=["owner", "sla"],
        classification_tags=[],  # the domain forgot to classify a table holding emails
    )
    result2 = gate.check(missing_tag)
    assert not result2.admitted, "a table missing its classification tag should be rejected"
    assert result2.failed_rules == ["classification missing: sensitivity_tier"], (
        f"the rejection should name the exact missing rule, got {result2.failed_rules}"
    )

    print("all claims verified")


if __name__ == "__main__":
    main()
