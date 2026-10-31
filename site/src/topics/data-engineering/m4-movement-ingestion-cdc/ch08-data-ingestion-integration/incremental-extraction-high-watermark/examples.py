# Real measurements against this sandbox's own PostgreSQL 16 cluster, database learnshop, table
# orders. Every number here is a direct observation: a real late-committing transaction whose
# updated_at is stamped at transaction START (transaction_timestamp() — fixed for the whole
# transaction), a real strict-cursor run that misses it, a real lookback window that catches it,
# a real idempotent re-run via INSERT ... ON CONFLICT DO UPDATE that changes nothing on repeat,
# and a real hard delete that no updated_at cursor can ever see.

import time
from datetime import timedelta

import psycopg

DSN = "host=127.0.0.1 port=5432 dbname=learnshop user=postgres password=postgres"


def late_committing_transaction_miss(slow_seconds=1.0):
    """A transaction that starts before a cursor run, is still open during that run (so the
    cursor sees nothing new), and only commits afterward. Its row is stamped with its own
    transaction START time (transaction_timestamp()), which is already behind the watermark the
    cursor advanced to during the run — a permanent miss under a strict cursor."""
    setup = psycopg.connect(DSN, autocommit=True)
    setup.execute("delete from orders where id = 5555555")
    setup.execute(
        "insert into orders (id, customer_id, status, amount) values (5555555, 1, 'completed', 42.00)"
    )

    watermark_before = setup.execute("select now()").fetchone()[0]

    tx = psycopg.connect(DSN)
    tx.execute("begin")
    tx_start = tx.execute("select transaction_timestamp()").fetchone()[0]

    time.sleep(slow_seconds)  # the transaction is still doing work; nothing it touches is visible yet

    # A cursor run happens while the slow transaction is still open. It finds nothing new, and
    # (the realistic bug) advances its watermark to the run's own wall-clock time anyway.
    found_during_run = setup.execute(
        "select id from orders where updated_at > %s", (watermark_before,)
    ).fetchall()
    watermark_after_run = setup.execute("select now()").fetchone()[0]

    tx.execute("update orders set updated_at = transaction_timestamp() where id = 5555555")
    tx.commit()
    tx.close()

    strict_miss = setup.execute(
        "select id from orders where updated_at > %s", (watermark_after_run,)
    ).fetchall()

    lookback_catch = setup.execute(
        "select id, updated_at from orders where updated_at > %s",
        (watermark_after_run - timedelta(seconds=2),),
    ).fetchall()

    setup.close()
    return {
        "tx_start_before_watermark": tx_start < watermark_after_run,
        "found_while_tx_still_open": len(found_during_run),
        "missed_by_strict_cursor": [row[0] for row in strict_miss],
        "caught_by_lookback": [row[0] for row in lookback_catch],
    }


def idempotent_merge_is_safe_to_repeat(order_id=5555555, repeats=3):
    """A lookback window re-reads rows the cursor already saw. An idempotent merge (INSERT ...
    ON CONFLICT DO UPDATE, keyed on the primary key) makes repeating that re-read harmless: the
    row count and the row's own data never change no matter how many times the same merge runs."""
    conn = psycopg.connect(DSN)
    row = conn.execute(
        "select customer_id, status, amount from orders where id = %s", (order_id,)
    ).fetchone()

    counts_after_each_merge = []
    for _ in range(repeats):
        conn.execute(
            """
            insert into orders (id, customer_id, status, amount)
            values (%s, %s, %s, %s)
            on conflict (id) do update set
                customer_id = excluded.customer_id,
                status = excluded.status,
                amount = excluded.amount
            """,
            (order_id, row[0], row[1], row[2]),
        )
        conn.commit()
        n = conn.execute("select count(*) from orders where id = %s", (order_id,)).fetchone()[0]
        counts_after_each_merge.append(n)
    conn.close()
    return counts_after_each_merge


def hard_delete_is_invisible_to_a_cursor():
    """A row deleted outright leaves nothing behind with an updated_at for a cursor to find —
    an updated_at-based incremental extract cannot distinguish 'nothing changed' from 'this row
    is gone'. Only a full row-count reconciliation against the source catches it."""
    conn = psycopg.connect(DSN, autocommit=True)
    conn.execute("delete from orders where id = 7777777")
    conn.execute(
        "insert into orders (id, customer_id, status, amount) values (7777777, 1, 'completed', 9.00)"
    )
    watermark = conn.execute("select now()").fetchone()[0]
    source_count_before = conn.execute("select count(*) from orders").fetchone()[0]

    conn.execute("delete from orders where id = 7777777")

    source_count_after = conn.execute("select count(*) from orders").fetchone()[0]
    cursor_finds_anything = conn.execute(
        "select id from orders where id = 7777777 and updated_at > %s", (watermark,)
    ).fetchall()
    conn.close()
    return {
        "source_count_before": source_count_before,
        "source_count_after": source_count_after,
        "cursor_sees_the_deletion": len(cursor_finds_anything) > 0,
    }


def check():
    miss = late_committing_transaction_miss()
    assert miss["found_while_tx_still_open"] == 0  # nothing visible while the transaction is still open
    assert miss["tx_start_before_watermark"] is True
    assert miss["missed_by_strict_cursor"] == []  # the strict cursor never sees it, ever again
    assert miss["caught_by_lookback"] == [5555555]  # a lookback window catches it on the next run

    counts = idempotent_merge_is_safe_to_repeat()
    assert counts == [1, 1, 1]  # repeating the merge never creates a duplicate or changes the count

    deletion = hard_delete_is_invisible_to_a_cursor()
    assert deletion["source_count_after"] == deletion["source_count_before"] - 1
    assert deletion["cursor_sees_the_deletion"] is False  # the cursor has no way to know


if __name__ == "__main__":
    check()
    print("de.incremental-extraction-high-watermark: all checks passed")
