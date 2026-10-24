"""
Real measurements against this sandbox's own PostgreSQL 16 cluster (database `learnshop`,
already used by Chapter 4's connection-pooling/resilience topics), using the `pageinspect`
extension to read live pages' own bytes directly rather than diagram an abstraction.

InnoDB's own overflow-page mechanism (the syllabus's comparison point) is named and sourced
directly in FACT-CHECK.md rather than reproduced here, since this sandbox has no running
InnoDB/MySQL instance.
"""

import psycopg2

DSN = dict(host="127.0.0.1", port=5432, dbname="learnshop", user="postgres", password="postgres")


def connect():
    conn = psycopg2.connect(**DSN)
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("CREATE EXTENSION IF NOT EXISTS pageinspect")
    return conn, cur


def page_has_five_real_parts(cur):
    """A page's own header, line-pointer array, and item data growing toward each other."""
    cur.execute("DROP TABLE IF EXISTS page_demo")
    cur.execute("CREATE TABLE page_demo (id int, name text) WITH (autovacuum_enabled = off)")
    cur.execute("INSERT INTO page_demo SELECT g, 'row-' || g FROM generate_series(1, 3) g")

    cur.execute("SELECT lower, upper, special FROM page_header(get_raw_page('page_demo', 0))")
    lower, upper, special = cur.fetchone()
    assert lower < upper, "pd_lower (end of line-pointer array) must sit before pd_upper (start of item data)"
    assert upper <= special, "item data must end at or before the special space, which is empty for an ordinary table"

    cur.execute("SELECT lp, lp_off, lp_len FROM heap_page_items(get_raw_page('page_demo', 0)) ORDER BY lp")
    rows = cur.fetchall()
    assert len(rows) == 3, "one line pointer per inserted row"
    offsets = [r[1] for r in rows]
    assert offsets == sorted(offsets, reverse=True), "item data is allocated backwards from the end of the page, newest item lowest"
    for lp, lp_off, lp_len in rows:
        assert lp_off + lp_len <= 8192, "an item's bytes must fit inside the page"
    print(f"page_demo page 0: pd_lower={lower}, pd_upper={upper}, pd_special={special}, "
          f"{len(rows)} line pointers at offsets {offsets}")
    return lower, upper, rows


def slot_decouples_identity_from_physical_offset(cur):
    """A CTID is (page, line-pointer index), not a byte offset — it survives VACUUM moving the item."""
    cur.execute("DROP TABLE IF EXISTS slot_demo")
    cur.execute("CREATE TABLE slot_demo (id int, name text) WITH (autovacuum_enabled = off)")
    cur.execute("INSERT INTO slot_demo SELECT g, 'row-' || g FROM generate_series(1, 5) g")

    cur.execute("SELECT lp, lp_off FROM heap_page_items(get_raw_page('slot_demo', 0)) ORDER BY lp")
    before = dict(cur.fetchall())

    cur.execute("DELETE FROM slot_demo WHERE id IN (1, 2, 3)")
    cur.execute("SELECT ctid, id FROM slot_demo ORDER BY id")
    ctids_before_vacuum = dict((id_, str(ctid)) for ctid, id_ in cur.fetchall())

    cur.execute("VACUUM slot_demo")

    cur.execute("SELECT lp, lp_off FROM heap_page_items(get_raw_page('slot_demo', 0)) ORDER BY lp")
    after = dict(cur.fetchall())
    cur.execute("SELECT ctid, id FROM slot_demo ORDER BY id")
    ctids_after_vacuum = dict((id_, str(ctid)) for ctid, id_ in cur.fetchall())

    assert ctids_before_vacuum == ctids_after_vacuum, (
        "the surviving rows' CTIDs must be unchanged by VACUUM: a CTID names a line-pointer "
        "index, not a byte offset, so it stays valid even when the item physically moves"
    )
    moved = {lp: (before.get(lp), after.get(lp)) for lp in after if after[lp] and before.get(lp) != after[lp]}
    assert moved, "VACUUM must have actually compacted at least one surviving item to a new offset"
    print(f"slot_demo: CTIDs stable across VACUUM ({ctids_after_vacuum}); "
          f"line pointers whose physical offset moved: {moved}")
    return ctids_before_vacuum, ctids_after_vacuum, moved


def null_bitmap_marks_the_missing_column(cur):
    """The heap tuple header's optional null bitmap, read directly off a real row with a null."""
    cur.execute("DROP TABLE IF EXISTS null_demo")
    cur.execute("CREATE TABLE null_demo (id int, name text, note text)")
    cur.execute("INSERT INTO null_demo VALUES (1, 'alice', NULL)")
    cur.execute("INSERT INTO null_demo VALUES (2, 'bob', 'has a note')")

    cur.execute(
        "SELECT t_infomask, t_bits FROM heap_page_items(get_raw_page('null_demo', 0)) ORDER BY lp"
    )
    rows = cur.fetchall()
    HEAP_HASNULL = 0x0001
    (infomask_with_null, bits_with_null), (infomask_without_null, bits_without_null) = rows

    assert infomask_with_null & HEAP_HASNULL, "row 1 has a null column, so HEAP_HASNULL must be set in t_infomask"
    assert not (infomask_without_null & HEAP_HASNULL), "row 2 has no null column, so HEAP_HASNULL must be clear"
    assert bits_without_null is None, "a row with no null column carries no null bitmap at all"
    third_bit = bits_with_null[2]
    assert third_bit == "0", f"the third column (note) is null, so its bitmap bit must be 0, got {bits_with_null!r}"
    print(f"null_demo: row with a null note has t_bits={bits_with_null!r} (bit 3 is 0); "
          f"row with no null has t_bits={bits_without_null!r}")
    return bits_with_null, bits_without_null


def toast_moves_a_large_value_out_of_line(cur):
    """An incompressible value past the ~2 kB threshold is chunked into a real, separate TOAST table."""
    import os
    import base64

    cur.execute("DROP TABLE IF EXISTS toast_demo")
    cur.execute("CREATE TABLE toast_demo (id int, big text)")

    small_value = "short"
    cur.execute("INSERT INTO toast_demo VALUES (1, %s)", (small_value,))
    cur.execute("SELECT lp_len FROM heap_page_items(get_raw_page('toast_demo', 0)) WHERE lp = 1")
    small_lp_len = cur.fetchone()[0]

    cur.execute("TRUNCATE toast_demo")
    big_value = base64.b64encode(os.urandom(6000)).decode()  # incompressible, well past the 2 kB threshold
    cur.execute("INSERT INTO toast_demo VALUES (1, %s)", (big_value,))

    cur.execute("SELECT reltoastrelid::regclass FROM pg_class WHERE relname = 'toast_demo'")
    toast_relation = cur.fetchone()[0]
    assert toast_relation, "a table with a TOAST-able column must have an associated TOAST table"

    cur.execute(f"SELECT count(*), max(chunk_seq) FROM {toast_relation}")
    chunk_count, max_chunk_seq = cur.fetchone()
    assert chunk_count > 1, "an 8000-byte base64-encoded random value must be split into multiple TOAST chunks"
    assert max_chunk_seq == chunk_count - 1, "chunk_seq must number the chunks 0..count-1"

    cur.execute("SELECT lp_len FROM heap_page_items(get_raw_page('toast_demo', 0)) WHERE lp = 1")
    big_lp_len = cur.fetchone()[0]
    assert big_lp_len < len(big_value), (
        f"the main-table row ({big_lp_len} bytes) must be far smaller than the real value it "
        f"stores ({len(big_value)} bytes) once TOAST has moved it out of line"
    )

    cur.execute("SELECT length(big) FROM toast_demo")
    (logical_length,) = cur.fetchone()
    assert logical_length == len(big_value), "the logical value, read back through TOAST, must round-trip exactly"

    print(f"toast_demo: a {small_lp_len}-byte in-line row for a short value vs. a {big_lp_len}-byte "
          f"in-heap row pointing at {chunk_count} real TOAST chunks for an {len(big_value)}-byte value "
          f"(round-trips to the exact original {logical_length} bytes)")
    return small_lp_len, big_lp_len, chunk_count, logical_length


def main():
    conn, cur = connect()
    try:
        page_has_five_real_parts(cur)
        slot_decouples_identity_from_physical_offset(cur)
        null_bitmap_marks_the_missing_column(cur)
        toast_moves_a_large_value_out_of_line(cur)
    finally:
        for t in ("page_demo", "slot_demo", "null_demo", "toast_demo"):
            cur.execute(f"DROP TABLE IF EXISTS {t}")
        cur.close()
        conn.close()
    print("pages-slotted-pages-tuple examples: all checks pass")


if __name__ == "__main__":
    main()
