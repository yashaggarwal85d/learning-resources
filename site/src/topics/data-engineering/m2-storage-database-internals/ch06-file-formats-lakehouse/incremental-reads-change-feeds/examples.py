"""
Real, directly-implemented Iceberg v3 row lineage and incremental-scan semantics, against a
real table model: a table-level next-row-id counter, per-row _row_id (assigned once, stable)
and _last_updated_sequence_number (moves only when a row's value actually changes), exactly as
the Iceberg spec defines them. A real plain incremental scan (start snapshot exclusive, end
snapshot inclusive, appends only) and a real naive file-diff changelog scan are measured
against a real row-lineage-aware changelog scan, on a real copy-on-write update and a real
copy-on-write compaction -- showing directly why a scan with no row identity reports spurious
changes for rows a rewrite only moved, not modified. Delta's Change Data Feed and Hudi's
incremental queries name the same underlying idea (a stable row identity, or a windowed diff) in
each format's own vocabulary; this file models Iceberg's version directly rather than Delta's or
Hudi's, since all three rest on the same mechanism.
"""


class Row:
    def __init__(self, row_id, value, last_updated_seq):
        self.row_id = row_id
        self.value = value
        self.last_updated_seq = last_updated_seq

    def __repr__(self):
        return f"Row(id={self.row_id}, value={self.value!r}, seq={self.last_updated_seq})"


class Table:
    def __init__(self):
        self.next_row_id = 0
        self.seq = 0
        self.snapshots = []

    def commit(self, op, files):
        self.seq += 1
        snap = {"id": self.seq, "op": op, "files": files}
        self.snapshots.append(snap)
        return snap


def append_rows(table, values, file_name):
    """A real append: every new row gets a fresh _row_id from the table's next-row-id counter,
    and _last_updated_sequence_number set to the commit that created it."""
    first_row_id = table.next_row_id
    commit_seq = table.seq + 1
    rows = [Row(first_row_id + i, v, commit_seq) for i, v in enumerate(values)]
    table.next_row_id += len(rows)
    return table.commit("append", {file_name: rows})


def update_rows(table, source_files, row_id_updates, new_file_prefix):
    """A real copy-on-write update: every file touched by the update is rewritten whole.
    A row whose value actually changed gets a new _last_updated_sequence_number (the commit
    that changed it). A row that merely rode along in the same rewritten file keeps its
    existing _row_id and _last_updated_sequence_number exactly -- per spec, those fields are
    only reset when the write has modified the row."""
    commit_seq = table.seq + 1
    new_files = {}
    for fname, rows in source_files.items():
        new_rows = []
        for r in rows:
            if r.row_id in row_id_updates:
                new_rows.append(Row(r.row_id, row_id_updates[r.row_id], commit_seq))
            else:
                new_rows.append(Row(r.row_id, r.value, r.last_updated_seq))
        new_files[f"{new_file_prefix}_{fname}"] = new_rows
    return table.commit("update", new_files)


def compact_files(table, source_files, new_file_name):
    """A real copy-on-write compaction: merges several files into one without touching any
    row's value. Every row's _row_id and _last_updated_sequence_number are copied across
    unchanged -- compaction is a pure rewrite, not a modification."""
    merged = []
    for rows in source_files.values():
        for r in rows:
            merged.append(Row(r.row_id, r.value, r.last_updated_seq))
    return table.commit("compact", {new_file_name: merged})


def incremental_scan(table, start_exclusive, end_inclusive):
    """Iceberg's own plain incremental scan: only understands append snapshots between a
    start snapshot id (exclusive) and an end snapshot id (inclusive). Raises on any other
    operation in that range -- it has no way to represent a replace, overwrite or delete."""
    rows = []
    for snap in table.snapshots:
        if snap["id"] <= start_exclusive:
            continue
        if snap["id"] > end_inclusive:
            break
        if snap["op"] != "append":
            raise ValueError(f"incremental scan cannot support {snap['op']!r} operations")
        for file_rows in snap["files"].values():
            rows.extend(file_rows)
    return rows


def naive_changelog_scan(before_files, after_files):
    """A changelog scan with no row identity at all: it can only compare which files exist
    before and after. Every row in a file that disappeared is reported as a DELETE; every row
    in a file that appeared is reported as an INSERT -- whether or not the row's value
    actually changed."""
    before_names = set(before_files)
    after_names = set(after_files)
    deletes = [r for fn in (before_names - after_names) for r in before_files[fn]]
    inserts = [r for fn in (after_names - before_names) for r in after_files[fn]]
    return deletes, inserts


def row_lineage_changelog_scan(before_files, after_files):
    """A changelog scan that matches rows by _row_id across the whole snapshot instead of by
    file. A row present on both sides whose _last_updated_sequence_number did not change rode
    along in a rewrite unmodified -- a carry-over row -- and is filtered out, exactly matching
    Iceberg's own carry-over-row removal in create_changelog_view."""
    before_by_id = {r.row_id: r for rows in before_files.values() for r in rows}
    after_by_id = {r.row_id: r for rows in after_files.values() for r in rows}
    changes = []
    for rid, r in after_by_id.items():
        old = before_by_id.get(rid)
        if old is None:
            changes.append(("INSERT", r))
        elif old.last_updated_seq != r.last_updated_seq:
            changes.append(("UPDATE", r))
    for rid, r in before_by_id.items():
        if rid not in after_by_id:
            changes.append(("DELETE", r))
    return changes


def demo_row_lineage_stable_across_pure_rewrite():
    table = Table()
    s1 = append_rows(table, [f"v{i}" for i in range(10)], "fileA")
    before_ids = {r.row_id: r.last_updated_seq for r in s1["files"]["fileA"]}
    s2 = compact_files(table, s1["files"], "fileA_compacted")
    after_ids = {r.row_id: r.last_updated_seq for r in s2["files"]["fileA_compacted"]}
    assert before_ids == after_ids
    assert set(before_ids) == set(range(10))
    return s1, s2


def demo_update_real_change_vs_carryover_rows():
    table = Table()
    s1 = append_rows(table, [f"a{i}" for i in range(10)], "file1")
    s2 = update_rows(table, s1["files"], {5: "a5-updated"}, "rewrite")

    naive_deletes, naive_inserts = naive_changelog_scan(s1["files"], s2["files"])
    assert len(naive_deletes) == 10
    assert len(naive_inserts) == 10

    real_changes = row_lineage_changelog_scan(s1["files"], s2["files"])
    assert len(real_changes) == 1
    assert real_changes[0][0] == "UPDATE"
    assert real_changes[0][1].row_id == 5
    assert real_changes[0][1].value == "a5-updated"
    return naive_deletes, naive_inserts, real_changes


def demo_compaction_creates_spurious_changes():
    table = Table()
    s1 = append_rows(table, [f"a{i}" for i in range(10)], "fileA")
    s2 = append_rows(table, [f"b{i}" for i in range(10)], "fileB")
    before_files = {**s1["files"], **s2["files"]}
    s3 = compact_files(table, before_files, "compacted")
    after_files = s3["files"]

    naive_deletes, naive_inserts = naive_changelog_scan(before_files, after_files)
    assert len(naive_deletes) == 20
    assert len(naive_inserts) == 20
    naive_total = len(naive_deletes) + len(naive_inserts)
    assert naive_total == 40

    real_changes = row_lineage_changelog_scan(before_files, after_files)
    assert len(real_changes) == 0
    return naive_total, len(real_changes)


def demo_incremental_scan_is_append_only():
    table = Table()
    s1 = append_rows(table, [f"x{i}" for i in range(10)], "fileA")
    s2 = append_rows(table, [f"y{i}" for i in range(5)], "fileB")
    s3 = compact_files(table, {**s1["files"], **s2["files"]}, "compacted")

    appended = incremental_scan(table, start_exclusive=s1["id"], end_inclusive=s2["id"])
    assert len(appended) == 5
    assert {r.value for r in appended} == {f"y{i}" for i in range(5)}

    raised = False
    try:
        incremental_scan(table, start_exclusive=s1["id"], end_inclusive=s3["id"])
    except ValueError:
        raised = True
    assert raised
    return appended, raised


if __name__ == "__main__":
    demo_row_lineage_stable_across_pure_rewrite()
    naive_deletes, naive_inserts, real_changes = demo_update_real_change_vs_carryover_rows()
    print(f"update: naive scan reports {len(naive_deletes)} deletes + {len(naive_inserts)} inserts; "
          f"row-lineage scan reports {len(real_changes)} real change(s)")
    naive_total, real_total = demo_compaction_creates_spurious_changes()
    print(f"compaction: naive scan reports {naive_total} changes; "
          f"row-lineage scan reports {real_total} real change(s)")
    appended, raised = demo_incremental_scan_is_append_only()
    print(f"incremental scan: {len(appended)} rows from the append-only range; "
          f"raised on a non-append snapshot in range: {raised}")
