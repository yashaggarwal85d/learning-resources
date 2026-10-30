"""de.lineage-driven-impact-analysis: a real lineage graph (14 tables, 2 dashboards, built from an
OpenLineage-style edge list, reusing topic 11's own DIRECT/INDIRECT column-lineage model) walked
for table-level and column-level blast radius, stale-partition propagation, deduplicated per-owner
notification, and a deprecation workflow gated on every affected owner's sign-off. One genuine
reader — a partner's nightly export, reading the renamed column by name in an uninstrumented
script — has no edge in the graph at all, the permanent gap no amount of lineage coverage closes."""

DIRECT = "DIRECT"
INDIRECT = "INDIRECT"

# Each edge: upstream table -> downstream table -> {downstream_col: [(upstream_col, kind), ...]}.
# An empty column map means the downstream table reads the upstream table but never touches the
# column this topic tracks (orders_raw.cust_id, renamed to customer_id from orders_clean onward).
EDGES = {
    "orders_raw": {
        "orders_clean": {"customer_id": [("cust_id", DIRECT)], "amount": [("amount", DIRECT)]},
        "legacy_mirror": {"buyer_id": [("cust_id", DIRECT)]},
        "pricing_staging": {"amount": [("amount", DIRECT)]},
        "compliance_audit_log": {"cust_id": [("cust_id", DIRECT)]},
    },
    "orders_clean": {
        "orders_enriched": {"customer_id": [("customer_id", DIRECT)], "amount": [("amount", DIRECT)]},
        "customer_summary": {"customer_id": [("customer_id", DIRECT)]},
        "finance_recon": {"amount": [("amount", DIRECT)]},
    },
    "orders_enriched": {
        "dashboard_orders": {"customer_id": [("customer_id", DIRECT)]},
        "dashboard_customer_360": {"customer_id": [("customer_id", DIRECT)]},
    },
    "customer_summary": {
        "marketing_segments": {"segment": [("customer_id", INDIRECT)]},
        "loyalty_scoring": {"customer_id": [("customer_id", DIRECT)]},
    },
    "marketing_segments": {
        "campaign_rollup": {},
    },
    "loyalty_scoring": {
        "loyalty_rewards": {"customer_id": [("customer_id", DIRECT)]},
    },
    "loyalty_rewards": {
        "loyalty_ledger_archive": {"customer_id": [("customer_id", DIRECT)]},
    },
}

OWNERS = {
    "orders_clean": "domain-orders",
    "legacy_mirror": "domain-orders",
    "pricing_staging": "domain-orders",
    "compliance_audit_log": "domain-compliance",
    "orders_enriched": "domain-orders",
    "customer_summary": "domain-customers",
    "finance_recon": "domain-finance",
    "dashboard_orders": "domain-orders",
    "dashboard_customer_360": "domain-customers",
    "marketing_segments": "domain-marketing",
    "loyalty_scoring": "domain-customers",
    "campaign_rollup": "domain-marketing",
    "loyalty_rewards": "domain-customers",
    "loyalty_ledger_archive": "domain-customers",
}

# The catalog's own static, one-hop index of tables whose SQL text mentions cust_id — built once,
# at ingestion time, never re-walked; the same kind of shallow, stale list CHAPTER.md's hook names.
CATALOG_DIRECT_CONSUMERS = {"orders_clean", "legacy_mirror", "compliance_audit_log"}

# A genuine downstream reader of orders_raw.cust_id that has no edge in the graph at all: a nightly
# script reads the column by name and ships it to a partner, instrumented by nothing.
UNINSTRUMENTED_READER = {
    "name": "partner_nightly_export",
    "reads": "orders_raw.cust_id",
    "owner": "domain-orders",
    "why_invisible": "the script makes no OpenLineage call; no run, no job, no edge exists for it",
}


def downstream_table_level(start):
    """Every table reachable from start, any number of hops, regardless of which column feeds it."""
    seen = set()
    frontier = [start]
    while frontier:
        node = frontier.pop()
        for downstream in EDGES.get(node, {}):
            if downstream not in seen:
                seen.add(downstream)
                frontier.append(downstream)
    return seen


def downstream_column_level(start, start_col):
    """Every table the named column (tracked through renames) actually reaches, DIRECT or
    INDIRECT; a downstream table is only included if the inbound edge names start_col (or a column
    it has already reached) as one of its own input columns."""
    reached_cols = {start: {start_col}}
    seen = set()
    frontier = [start]
    while frontier:
        node = frontier.pop()
        for downstream, col_map in EDGES.get(node, {}).items():
            carried = set()
            for out_col, sources in col_map.items():
                for in_col, _kind in sources:
                    if in_col in reached_cols.get(node, set()):
                        carried.add(out_col)
            if carried:
                is_new = downstream not in seen
                reached_cols.setdefault(downstream, set()).update(carried)
                if is_new:
                    seen.add(downstream)
                    frontier.append(downstream)
    return seen


def propagate_stale(failed_table):
    """A whole-partition failure can corrupt any column, so staleness uses table-level reachability,
    not column-level — the failure doesn't respect which column a consumer happened to read."""
    return downstream_table_level(failed_table)


def notify_owners(affected_tables):
    """One notification per owner, listing every one of their affected tables — an owner with many
    affected tables gets one notice, not one per table."""
    by_owner = {}
    for table in affected_tables:
        owner = OWNERS[table]
        by_owner.setdefault(owner, []).append(table)
    return {owner: sorted(tables) for owner, tables in by_owner.items()}


def run_deprecation(table, signoffs):
    """Blocks while any owner of a remaining table-level dependent has not signed off; proceeds
    once the dependent set is empty or every dependent's owner has."""
    dependents = downstream_table_level(table)
    if not dependents:
        return {"deprecated": True, "reason": "no remaining dependents"}
    required_owners = {OWNERS[d] for d in dependents}
    missing = required_owners - signoffs
    if missing:
        return {"deprecated": False, "reason": f"awaiting sign-off from: {', '.join(sorted(missing))}"}
    return {"deprecated": True, "reason": "every dependent owner signed off"}


def main():
    table_level = downstream_table_level("orders_raw")
    column_level = downstream_column_level("orders_raw", "cust_id")
    false_positives = table_level - column_level

    assert len(CATALOG_DIRECT_CONSUMERS) == 3
    assert CATALOG_DIRECT_CONSUMERS < table_level
    assert column_level < table_level
    assert false_positives == {"pricing_staging", "finance_recon", "campaign_rollup"}
    assert len(table_level) == 14
    assert len(column_level) == 11
    print(f"catalog: {len(CATALOG_DIRECT_CONSUMERS)} tables; table-level: {len(table_level)}; column-level: {len(column_level)}")
    print(f"false positives (table-level only): {sorted(false_positives)}")

    stale = propagate_stale("orders_clean")
    assert stale == downstream_table_level("orders_clean")
    assert "finance_recon" in stale  # a table-level dependent, even though it never reads customer_id
    print(f"stale after orders_clean's partition failure: {len(stale)} downstream tables")

    notifications = notify_owners(column_level)
    assert len(notifications) == 4
    assert sorted(notifications["domain-orders"]) == sorted(["orders_clean", "legacy_mirror", "orders_enriched", "dashboard_orders"])
    assert sum(len(v) for v in notifications.values()) == len(column_level)
    print(f"notifications sent: {len(notifications)} (deduplicated from {len(column_level)} affected tables)")

    blocked = run_deprecation("orders_clean", signoffs=set())
    assert blocked["deprecated"] is False
    allowed = run_deprecation("orders_clean", signoffs={OWNERS[t] for t in downstream_table_level("orders_clean")})
    assert allowed["deprecated"] is True
    leaf_deprecation = run_deprecation("pricing_staging", signoffs=set())
    assert leaf_deprecation["deprecated"] is True
    print(f"deprecation: blocked without sign-off ({blocked['reason']}), allowed once every owner signs off")

    assert UNINSTRUMENTED_READER["name"] not in table_level
    assert UNINSTRUMENTED_READER["name"] not in column_level
    print(f"invisible to both methods: {UNINSTRUMENTED_READER['name']} ({UNINSTRUMENTED_READER['why_invisible']})")

    print("de.lineage-driven-impact-analysis examples: all checks pass")


if __name__ == "__main__":
    main()
