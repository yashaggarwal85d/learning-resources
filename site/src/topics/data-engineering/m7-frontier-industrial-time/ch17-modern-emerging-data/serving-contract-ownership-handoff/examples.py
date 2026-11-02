"""de.serving-contract-ownership-handoff — executable evidence.

CHAPTER.md: "Lab: none; a conceptual, organizational topic." There is no numeric claim this topic
asks the reel to show on screen (reel.tsx carries zero digits), so nothing here is required to
satisfy the build's "every number on screen is computed here" check. This file exists anyway to
make the hook's own claim concrete rather than purely asserted: two dashboards, each built with a
query its own author insists is correct, reaching two different totals from the identical mart,
because the mart's grain was never documented — and the fix, a single compiled metric definition
both consumers call instead of writing their own SQL.
"""
import sqlite3


def build_mart(conn):
    conn.executescript(
        """
        CREATE TABLE mart_bookings (
            booking_id INTEGER PRIMARY KEY,
            user_id INTEGER NOT NULL,
            month TEXT NOT NULL
        );
        CREATE TABLE mart_booking_line_items (
            line_item_id INTEGER PRIMARY KEY,
            booking_id INTEGER NOT NULL,
            night_number INTEGER NOT NULL
        );
        """
    )
    # Three bookings this month, by three distinct users. One booking has a
    # multi-night stay, so it fans out into several line items.
    bookings = [
        (1, 101, "2026-10"),
        (2, 102, "2026-10"),
        (3, 103, "2026-10"),
    ]
    conn.executemany("INSERT INTO mart_bookings VALUES (?, ?, ?)", bookings)
    line_items = [
        (1, 1, 1),
        (2, 1, 2),
        (3, 1, 3),  # booking 1 is a 3-night stay: 3 line items
        (4, 2, 1),  # booking 2 is a 1-night stay: 1 line item
        (5, 3, 1),
        (6, 3, 2),  # booking 3 is a 2-night stay: 2 line items
    ]
    conn.executemany("INSERT INTO mart_booking_line_items VALUES (?, ?, ?)", line_items)


def dashboard_booking_grain_query(conn, month):
    """One engineer's dashboard: queries the mart at its actual grain (one row per booking)."""
    cur = conn.execute(
        "SELECT COUNT(DISTINCT user_id) FROM mart_bookings WHERE month = ?", (month,)
    )
    return cur.fetchone()[0]


def dashboard_line_item_grain_query(conn, month):
    """The other engineer's dashboard: joins to the line-item table (a finer grain) without
    realizing the join fans out, then counts rows instead of distinct users — SQL that is, on
    its own, syntactically and logically correct for what it asks, but asks the wrong question
    because the mart's grain was never documented."""
    cur = conn.execute(
        """
        SELECT COUNT(*) FROM mart_bookings b
        JOIN mart_booking_line_items li ON li.booking_id = b.booking_id
        WHERE b.month = ?
        """,
        (month,),
    )
    return cur.fetchone()[0]


def compiled_active_users_metric(conn, month):
    """The semantic layer's single, compiled definition of 'active users this month.' Both
    consumers below call this same function instead of writing their own SQL."""
    return dashboard_booking_grain_query(conn, month)


def run():
    conn = sqlite3.connect(":memory:")
    build_mart(conn)

    booking_grain_total = dashboard_booking_grain_query(conn, "2026-10")
    line_item_grain_total = dashboard_line_item_grain_query(conn, "2026-10")

    assert booking_grain_total == 3, f"expected 3 distinct active users, got {booking_grain_total}"
    assert line_item_grain_total == 6, f"expected 6 (fanned-out) rows, got {line_item_grain_total}"
    assert booking_grain_total != line_item_grain_total, (
        "the two queries should disagree on an undocumented grain, or this example doesn't "
        "demonstrate the hook's claim"
    )
    print(f"booking-grain dashboard: {booking_grain_total} active users this month")
    print(f"line-item-grain dashboard: {line_item_grain_total} active users this month")
    print("same mart, same month, two different numbers — neither engineer's SQL is wrong on its own terms")

    # The fix: both consumers call the one compiled metric definition instead.
    dashboard_one_result = compiled_active_users_metric(conn, "2026-10")
    dashboard_two_result = compiled_active_users_metric(conn, "2026-10")
    assert dashboard_one_result == dashboard_two_result == booking_grain_total
    print(f"\nboth dashboards calling the compiled metric: {dashboard_one_result} and {dashboard_two_result} — identical, by construction")

    conn.close()
    print("\nall assertions passed")


if __name__ == "__main__":
    run()
