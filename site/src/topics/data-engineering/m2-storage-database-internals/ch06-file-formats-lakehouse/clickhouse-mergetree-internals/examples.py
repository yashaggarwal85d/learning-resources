"""
Uses chdb (pip install chdb) -- a real, embedded ClickHouse engine with no server process to
start, no Docker daemon required -- to run real MergeTree mechanics against real tables: separate
INSERTs creating separate immutable parts, a real OPTIMIZE TABLE merge collapsing them, a real
EXPLAIN indexes=1 trace showing the sparse primary index and a minmax data-skipping index each
pruning granules, a real materialized view firing as an insert trigger into an AggregatingMergeTree
target, ReplacingMergeTree's real before/after-merge row counts, and a real lightweight DELETE
mutation. Every number below is chdb's own real output, not narrated or hand-computed.

chdb embeds ClickHouse 26.9 directly in this process (chdb.query / chdb.session.Session) --
genuinely the same MergeTree engine ClickHouse Cloud and self-hosted ClickHouse run, not a
simulation of it.
"""

import re
import shutil
import tempfile

import chdb


def _last_fraction(explain_text, label):
    """Finds the last "<label><a>/<b>" occurrence in an EXPLAIN CSV dump and returns (a, b) as ints."""
    matches = re.findall(re.escape(label) + r"(\d+)/(\d+)", explain_text)
    read, total = matches[-1]
    return int(read), int(total)


def fresh_session():
    workdir = tempfile.mkdtemp(prefix="chdb_mergetree_")
    return chdb.session.Session(workdir), workdir


def demo_immutable_parts_and_merge(sess):
    sess.query("CREATE DATABASE IF NOT EXISTS d1")
    sess.query(
        "CREATE TABLE d1.events (id UInt64, ts DateTime, kind String) "
        "ENGINE = MergeTree() ORDER BY ts"
    )
    sess.query("INSERT INTO d1.events SELECT number, toDateTime('2026-01-01') + number, 'click' FROM numbers(50000)")
    sess.query("INSERT INTO d1.events SELECT number + 50000, toDateTime('2026-01-01') + number + 50000, 'click' FROM numbers(50000)")
    parts_before = int(sess.query("SELECT count() FROM system.parts WHERE table='events' AND database='d1' AND active", "CSV").data().strip())
    sess.query("OPTIMIZE TABLE d1.events FINAL")
    parts_after = int(sess.query("SELECT count() FROM system.parts WHERE table='events' AND database='d1' AND active", "CSV").data().strip())
    row_count = int(sess.query("SELECT count() FROM d1.events", "CSV").data().strip())
    return parts_before, parts_after, row_count


def demo_sparse_primary_index(sess):
    sess.query("CREATE DATABASE IF NOT EXISTS d2")
    sess.query(
        "CREATE TABLE d2.events (id UInt64, ts DateTime, kind String) "
        "ENGINE = MergeTree() ORDER BY ts"
    )
    sess.query("INSERT INTO d2.events SELECT number, toDateTime('2026-01-01') + number, 'click' FROM numbers(200000)")
    explain = sess.query(
        "EXPLAIN indexes=1 SELECT count() FROM d2.events "
        "WHERE ts >= '2026-01-02 00:00:00' AND ts < '2026-01-02 01:00:00'",
        "CSV",
    ).data()
    granules_read, granules_total = _last_fraction(explain, "Granules: ")
    return granules_read, granules_total


def demo_minmax_skipping_index(sess):
    sess.query("CREATE DATABASE IF NOT EXISTS d3")
    sess.query(
        "CREATE TABLE d3.logs (id UInt64, ts DateTime, status_code UInt16, "
        "INDEX idx_status status_code TYPE minmax GRANULARITY 4) "
        "ENGINE = MergeTree() ORDER BY ts"
    )
    sess.query(
        "INSERT INTO d3.logs SELECT number, toDateTime('2026-01-01') + number, "
        "if(number = 150000, 500, 200) FROM numbers(300000)"
    )
    explain = sess.query(
        "EXPLAIN indexes=1 SELECT count() FROM d3.logs WHERE status_code = 500", "CSV"
    ).data()
    skip_section = explain.rsplit('Skip"', 1)[1]
    skip_granules_read, skip_granules_total = _last_fraction(skip_section, "Granules: ")
    return skip_granules_read, skip_granules_total


def demo_materialized_view_insert_trigger(sess):
    sess.query("CREATE DATABASE IF NOT EXISTS d4")
    sess.query("CREATE TABLE d4.src (id UInt64, amount Float64) ENGINE = MergeTree() ORDER BY id")
    sess.query(
        "CREATE TABLE d4.agg_target (total AggregateFunction(sum, Float64)) "
        "ENGINE = AggregatingMergeTree() ORDER BY tuple()"
    )
    sess.query("CREATE MATERIALIZED VIEW d4.mv TO d4.agg_target AS SELECT sumState(amount) AS total FROM d4.src")
    before = sess.query("SELECT sumMerge(total) FROM d4.agg_target", "CSV").data().strip()
    sess.query("INSERT INTO d4.src VALUES (1, 10.0), (2, 20.0)")
    sess.query("INSERT INTO d4.src VALUES (3, 30.0)")
    after = float(sess.query("SELECT sumMerge(total) FROM d4.agg_target", "CSV").data().strip())
    return before, after


def demo_replacing_merge_tree(sess):
    sess.query("CREATE DATABASE IF NOT EXISTS d5")
    sess.query(
        "CREATE TABLE d5.rmt (id UInt64, v String, ver UInt64) "
        "ENGINE = ReplacingMergeTree(ver) ORDER BY id"
    )
    sess.query("INSERT INTO d5.rmt VALUES (1, 'a', 1)")
    sess.query("INSERT INTO d5.rmt VALUES (1, 'b', 2)")
    rows_before = int(sess.query("SELECT count() FROM d5.rmt", "CSV").data().strip())
    sess.query("OPTIMIZE TABLE d5.rmt FINAL")
    rows_after, winning_value = sess.query("SELECT count(), any(v) FROM d5.rmt", "CSV").data().strip().split(",")
    return rows_before, int(rows_after), winning_value.strip('"')


def demo_lightweight_delete(sess):
    sess.query("CREATE DATABASE IF NOT EXISTS d6")
    sess.query("CREATE TABLE d6.t (id UInt64, v String) ENGINE = MergeTree() ORDER BY id")
    sess.query("INSERT INTO d6.t SELECT number, 'x' FROM numbers(1000)")
    rows_before = int(sess.query("SELECT count() FROM d6.t", "CSV").data().strip())
    sess.query("DELETE FROM d6.t WHERE id < 100")
    rows_after = int(sess.query("SELECT count() FROM d6.t", "CSV").data().strip())
    return rows_before, rows_after


if __name__ == "__main__":
    sess, workdir = fresh_session()
    try:
        parts_before, parts_after, row_count = demo_immutable_parts_and_merge(sess)
        print(f"immutable parts: two separate INSERTs -> {parts_before} parts; after OPTIMIZE TABLE (a merge) -> {parts_after} part")
        print(f"row count unchanged by the merge: {row_count}")
        assert parts_before == 2
        assert parts_after == 1
        assert row_count == 100000

        granules_read, granules_total = demo_sparse_primary_index(sess)
        print(f"sparse primary index: an hour-wide range reads {granules_read} of {granules_total} granules")
        assert granules_read < granules_total

        skip_read, skip_total = demo_minmax_skipping_index(sess)
        print(f"minmax skipping index on a non-sorted column: {skip_read} of {skip_total} granules read")
        assert skip_read < skip_total

        mv_before, mv_after = demo_materialized_view_insert_trigger(sess)
        print(f"materialized view as insert trigger: target sum before any insert: {mv_before!r}, after two inserts: {mv_after}")
        assert mv_before == "0"
        assert mv_after == 60.0

        rmt_before, rmt_after, winning_value = demo_replacing_merge_tree(sess)
        print(f"ReplacingMergeTree: {rmt_before} rows visible before merge, {rmt_after} after -- surviving value {winning_value!r}")
        assert rmt_before == 2
        assert rmt_after == 1
        assert winning_value == "b"

        lw_before, lw_after = demo_lightweight_delete(sess)
        print(f"lightweight DELETE: {lw_before} rows before, {lw_after} after")
        assert lw_before == 1000
        assert lw_after == 900

        print("All assertions passed.")
    finally:
        sess.close()
        shutil.rmtree(workdir, ignore_errors=True)
