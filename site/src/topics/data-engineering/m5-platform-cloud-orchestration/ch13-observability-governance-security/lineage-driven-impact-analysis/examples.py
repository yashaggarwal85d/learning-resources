"""Measured claims for de.lineage-driven-impact-analysis.

This topic's own lab (per CHAPTER.md: "compute the downstream blast radius of dropping a
column... with and without column-level lineage, and show the difference") is built here as a
small graph walk, modeling exactly the mechanism OpenLineage's own object model and
column-lineage facet describe: table-level edges (a job reads/writes a whole dataset) and
column-level edges (a specific output column derives from a specific input column), walked
downstream from a proposed change.

Claim 1: dropping a column and walking table-level lineage downstream implicates every
consumer of the whole table, including ones that never touch the dropped column; walking
column-level lineage implicates a strict subset -- only the consumers whose own output columns
actually derive from the dropped one.

Claim 2: resolving each affected node to its owner and deduplicating produces exactly one
notification per owner, even when that owner has several affected tables.

Claim 3: a reader that was never wired to emit a lineage event at all (an uninstrumented
export script) is invisible to the walk regardless of how the graph is walked -- not a bug in
the walk, a gap in what was ever recorded.
"""

from dataclasses import dataclass, field


@dataclass
class ColumnEdge:
    from_table: str
    from_column: str
    to_table: str
    to_column: str


@dataclass
class TableEdge:
    from_table: str
    to_table: str


class LineageGraph:
    def __init__(self):
        self.table_edges: list[TableEdge] = []
        self.column_edges: list[ColumnEdge] = []
        self.owners: dict[str, str] = {}

    def add_table_edge(self, from_table: str, to_table: str) -> None:
        self.table_edges.append(TableEdge(from_table, to_table))

    def add_column_edge(self, from_table: str, from_column: str, to_table: str, to_column: str) -> None:
        self.column_edges.append(ColumnEdge(from_table, from_column, to_table, to_column))

    def set_owner(self, table: str, owner: str) -> None:
        self.owners[table] = owner

    def downstream_tables_table_level(self, table: str) -> set[str]:
        """Every table that reads this table at all, whatever column it actually touches."""
        return {e.to_table for e in self.table_edges if e.from_table == table}

    def downstream_tables_column_level(self, table: str, column: str) -> set[str]:
        """Only tables whose own output column actually derives from this specific column."""
        return {e.to_table for e in self.column_edges if e.from_table == table and e.from_column == column}

    def notify_owners(self, affected_tables: set[str]) -> dict[str, list[str]]:
        """One deduplicated notification per owner, listing every table of theirs affected."""
        notifications: dict[str, list[str]] = {}
        for t in affected_tables:
            owner = self.owners.get(t, "unowned")
            notifications.setdefault(owner, []).append(t)
        return notifications


def main() -> None:
    g = LineageGraph()

    # orders.cust_id feeds three tables at the table level; only two of those three
    # actually derive an output column from cust_id itself (the third reads the table
    # for unrelated columns, per CHAPTER.md's own "catalog says three tables use it").
    g.add_table_edge("orders", "customer_summary")
    g.add_table_edge("orders", "revenue_dashboard")
    g.add_table_edge("orders", "shipping_report")

    g.add_column_edge("orders", "cust_id", "customer_summary", "customer_key")
    g.add_column_edge("orders", "cust_id", "revenue_dashboard", "customer_key")
    # shipping_report reads orders for shipping_address and order_date, never cust_id.

    g.set_owner("customer_summary", "analytics-team")
    g.set_owner("revenue_dashboard", "analytics-team")
    g.set_owner("shipping_report", "logistics-team")

    table_level = g.downstream_tables_table_level("orders")
    column_level = g.downstream_tables_column_level("orders", "cust_id")

    assert table_level == {"customer_summary", "revenue_dashboard", "shipping_report"}, (
        "table-level lineage should implicate every consumer of the whole table"
    )
    assert column_level == {"customer_summary", "revenue_dashboard"}, (
        "column-level lineage should implicate only consumers deriving from cust_id itself"
    )
    assert column_level < table_level, (
        "column-level lineage's affected set should be a strict subset of table-level's"
    )

    # Claim 2: deduplicated, one notification per owner.
    notifications = g.notify_owners(column_level)
    assert set(notifications.keys()) == {"analytics-team"}, "both affected tables share one owner"
    assert sorted(notifications["analytics-team"]) == ["customer_summary", "revenue_dashboard"], (
        "the one notification should list both of that owner's affected tables"
    )

    # Claim 3: an uninstrumented reader is invisible to the walk, regardless of method.
    # nightly_partner_export reads orders.cust_id directly in a script that was never wired
    # to emit a lineage event at all -- so no edge exists for it in either graph.
    all_known_readers_of_cust_id = column_level
    assert "nightly_partner_export" not in all_known_readers_of_cust_id, (
        "an uninstrumented reader should not appear in the lineage graph at all"
    )

    print("all claims verified")


if __name__ == "__main__":
    main()
