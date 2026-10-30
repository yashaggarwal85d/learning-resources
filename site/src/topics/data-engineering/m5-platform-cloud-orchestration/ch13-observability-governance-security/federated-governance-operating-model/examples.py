"""de.federated-governance-operating-model: a real self-serve table-registration gate — three
checks (schema, contract, classification tags) run in code against synthetic table definitions,
admitting a well-formed table and rejecting two malformed ones with a stated reason each — plus
a worked automate-vs-human split over six governance decisions for the shop's three domains."""


def check_schema(table):
    columns = table.get("columns", [])
    if not columns:
        return False, "schema: no columns declared"
    for col in columns:
        if "name" not in col or "type" not in col:
            return False, f"schema: column missing name or type: {col}"
    return True, "schema: ok"


def check_contract(table):
    contract = table.get("contract")
    if contract is None:
        return False, "contract: no contract attached"
    required = ["id", "version", "owner"]
    missing = [f for f in required if f not in contract]
    if missing:
        return False, f"contract: missing required field(s): {', '.join(missing)}"
    return True, "contract: ok"


def check_classification(table):
    for col in table.get("columns", []):
        tag = col.get("classification")
        if tag is None:
            return False, f"classification: column '{col['name']}' has no classification tag"
        if "tier" not in tag or "category" not in tag:
            return False, f"classification: column '{col['name']}' tag missing tier or category"
        if tag.get("tier") is None:
            return False, f"classification: column '{col['name']}' tier not set"
    return True, "classification: ok"


GATES = [check_schema, check_contract, check_classification]


def register_table(catalog, table):
    """Runs the three gates in order; stops at the first failure and returns that reason,
    admitting the table to the catalog only if every gate passes."""
    for gate in GATES:
        passed, reason = gate(table)
        if not passed:
            return {"admitted": False, "reason": reason, "table": table["name"]}
    catalog[table["name"]] = table
    return {"admitted": True, "reason": "all gates passed", "table": table["name"]}


WELL_FORMED_TABLE = {
    "name": "orders.customers",
    "columns": [
        {"name": "customer_id", "type": "BIGINT", "classification": {"tier": "internal", "category": None}},
        {"name": "email", "type": "VARCHAR", "classification": {"tier": "restricted", "category": "PII"}},
    ],
    "contract": {"id": "orders.customers", "version": "1.0.0", "owner": "domain-orders"},
}

MISSING_CONTRACT_VERSION = {
    "name": "marketing.campaign_sends",
    "columns": [
        {"name": "campaign_id", "type": "BIGINT", "classification": {"tier": "internal", "category": None}},
    ],
    "contract": {"id": "marketing.campaign_sends", "owner": "domain-marketing"},
}

UNTAGGED_FREE_TEXT_COLUMN = {
    "name": "orders.support_notes",
    "columns": [
        {"name": "order_id", "type": "BIGINT", "classification": {"tier": "internal", "category": None}},
        {"name": "note_text", "type": "TEXT"},
    ],
    "contract": {"id": "orders.support_notes", "version": "1.0.0", "owner": "domain-orders"},
}


DECISIONS = [
    {
        "decision": "apply the restricted-tier mask to a column tagged PII",
        "kind": "automated",
        "rule": "mask applied wherever tier == restricted, no exception",
    },
    {
        "decision": "block a table with no declared owner from becoming discoverable",
        "kind": "automated",
        "rule": "registration gate rejects any table whose contract has no owner field",
    },
    {
        "decision": "fail registration when a required contract field is missing",
        "kind": "automated",
        "rule": "registration gate rejects any table whose contract is missing id, version or owner",
    },
    {
        "decision": "decide whether a table counts as business-critical",
        "kind": "human",
        "steward": "domain lead",
        "reason": "criticality is a judgement about business impact, not a property any attribute encodes",
    },
    {
        "decision": "grant a retention exception past the standard policy window",
        "kind": "human",
        "steward": "compliance officer",
        "reason": "an exception needs a stated legal reason, which is a judgement call, not a rule over an attribute",
    },
    {
        "decision": "classify an ambiguous free-text column a scanner left untagged",
        "kind": "human",
        "steward": "domain data owner",
        "reason": "a discovery false negative needs a person to read the column and decide, the scanner already missed it",
    },
]


def main():
    catalog = {}

    result_good = register_table(catalog, WELL_FORMED_TABLE)
    assert result_good["admitted"] is True
    assert "orders.customers" in catalog
    print(f"{result_good['table']}: admitted ({result_good['reason']})")

    result_bad_contract = register_table(catalog, MISSING_CONTRACT_VERSION)
    assert result_bad_contract["admitted"] is False
    assert "contract" in result_bad_contract["reason"]
    assert result_bad_contract["table"] not in catalog
    print(f"{result_bad_contract['table']}: rejected ({result_bad_contract['reason']})")

    result_bad_tag = register_table(catalog, UNTAGGED_FREE_TEXT_COLUMN)
    assert result_bad_tag["admitted"] is False
    assert "classification" in result_bad_tag["reason"]
    assert result_bad_tag["table"] not in catalog
    print(f"{result_bad_tag['table']}: rejected ({result_bad_tag['reason']})")

    assert len(catalog) == 1

    automated = [d for d in DECISIONS if d["kind"] == "automated"]
    human = [d for d in DECISIONS if d["kind"] == "human"]
    assert len(automated) == 3
    assert len(human) == 3
    assert all("steward" in d for d in human)
    print(f"governance split: {len(automated)} automated, {len(human)} human (each with a named steward)")
    print("de.federated-governance-operating-model examples: all checks pass")


if __name__ == "__main__":
    main()
