"""
de.schema-evolution-column-ids — the same rename-plus-reorder corruption topic 3 reproduced for
plain Parquet, now reproduced and fixed at the table level: a real local "Iceberg-style" table
(field IDs stored alongside each data file) and a real local "Delta-style" table (column mapping:
a logical name mapped to a stable physical column name, independent of the data file's own
column names). Pure Python standard library, no external dependencies; plain CSV files stand in
for Parquet/Iceberg/Delta's real binary formats, disclosed below and in FACT-CHECK.md.
"""
import csv
import os

ROOT = "/tmp/schema_evolution_demo"

# =====================================================================================
# Part 1 — Iceberg-style table: a real data file on disk, columns selected by field ID,
# not by name or position. The same rename-plus-insert schema change topic 3 used.
# =====================================================================================

# The file as originally written: field IDs 1, 2, 3 in this on-disk order.
V1_SCHEMA = [(1, "cust_id"), (2, "amount_cents"), (3, "currency")]
V1_ROWS = [(4017, 4599, "USD"), (4018, 1200, "USD")]

# The new schema: cust_id renamed to customer_id (same field ID, 1), and a new "region"
# column (field ID 4, genuinely new, no data exists for it) inserted before amount_cents.
V2_SCHEMA = [(1, "customer_id"), (4, "region"), (2, "amount_cents"), (3, "currency")]


def write_iceberg_style_file(path, schema, rows):
    """A real on-disk data file: the header row stores field IDs, not names — this is the
    projection key every later read must use, exactly as Iceberg's spec requires."""
    with open(path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([fid for fid, _name in schema])
        for row in rows:
            writer.writerow(row)


def read_iceberg_file(path):
    with open(path, newline="") as f:
        reader = csv.reader(f)
        header_field_ids = [int(x) for x in next(reader)]
        rows = [tuple(r) for r in reader]
    return header_field_ids, rows


def project_by_position(header_field_ids, rows, schema):
    """The naive, wrong approach: trust the data file's column order to still line up with
    the new schema's order. This is exactly topic 3's by-position corruption, now read from
    a real file on disk instead of an in-memory list."""
    out = []
    for row in rows:
        resolved = {}
        for i, (_fid, name) in enumerate(schema):
            resolved[name] = row[i] if i < len(row) else None
        out.append(resolved)
    return out


def project_by_field_id(header_field_ids, rows, schema):
    """Iceberg's real mechanism: match the data file's own field IDs against the schema's
    field IDs, regardless of name or position."""
    out = []
    for row in rows:
        by_id = dict(zip(header_field_ids, row))
        resolved = {name: by_id.get(fid) for fid, name in schema}
        out.append(resolved)
    return out


def demo_iceberg_field_ids():
    print("Part 1: a real on-disk table, read by position versus read by field ID\n")
    os.makedirs(ROOT, exist_ok=True)
    data_path = os.path.join(ROOT, "iceberg_table.csv")
    write_iceberg_style_file(data_path, V1_SCHEMA, V1_ROWS)

    header_field_ids, rows = read_iceberg_file(data_path)

    by_position = project_by_position(header_field_ids, rows, V2_SCHEMA)
    by_field_id = project_by_field_id(header_field_ids, rows, V2_SCHEMA)

    print(f"  by position, row 1: {by_position[0]}")
    print(f"  by field ID, row 1: {by_field_id[0]}")

    # By position: the inserted "region" column shifts every later column over by one slot.
    assert by_position[0]["region"] == "4599"  # region silently holds amount_cents's real value
    assert by_position[0]["amount_cents"] == "USD"  # amount_cents silently holds currency's value

    # By field ID: the rename survives correctly, and the genuinely new column reads back missing.
    assert by_field_id[0]["customer_id"] == "4017"
    assert by_field_id[0]["region"] is None
    assert by_field_id[0]["amount_cents"] == "4599"
    assert by_field_id[0]["currency"] == "USD"

    return data_path


# =====================================================================================
# Part 2 — Delta-style column mapping: a logical column name mapped to a stable physical
# column name, stored in table metadata, independent of the data file's own column names.
# =====================================================================================


def write_delta_style_table(root, logical_to_physical, rows_by_physical):
    os.makedirs(root, exist_ok=True)
    data_path = os.path.join(root, "part-0000.csv")
    physical_names = list(logical_to_physical.values())
    with open(data_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(physical_names)
        for row in rows_by_physical:
            writer.writerow(row)
    return data_path


def rename_without_column_mapping(data_path, old_logical, new_logical):
    """Without column mapping, the physical column name IS the logical name — renaming
    means rewriting the data file's own header, a real file write."""
    with open(data_path, newline="") as f:
        reader = csv.reader(f)
        header = next(reader)
        rows = list(reader)
    header = [new_logical if h == old_logical else h for h in header]
    with open(data_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(rows)


def rename_with_column_mapping(logical_to_physical, old_logical, new_logical):
    """With column mapping, only the metadata's logical-to-physical map changes — the
    data file's own bytes are never touched."""
    physical = logical_to_physical.pop(old_logical)
    logical_to_physical[new_logical] = physical


def demo_delta_column_mapping():
    print("\nPart 2: renaming a column with and without Delta's column mapping\n")

    # Without column mapping: physical name == logical name.
    no_mapping_root = os.path.join(ROOT, "delta_no_mapping")
    no_mapping_path = write_delta_style_table(no_mapping_root, {"cust_id": "cust_id", "amount_cents": "amount_cents"}, [(4017, 4599)])
    before_bytes = open(no_mapping_path, "rb").read()
    rename_without_column_mapping(no_mapping_path, "cust_id", "customer_id")
    after_bytes = open(no_mapping_path, "rb").read()
    file_was_rewritten = before_bytes != after_bytes
    print(f"  without column mapping: renaming cust_id -> customer_id rewrote the data file: {file_was_rewritten}")
    assert file_was_rewritten is True

    # With column mapping: a stable physical name per logical column, in metadata only.
    mapping_root = os.path.join(ROOT, "delta_with_mapping")
    logical_to_physical = {"cust_id": "col-1", "amount_cents": "col-2"}
    mapping_path = write_delta_style_table(mapping_root, logical_to_physical, [(4017, 4599)])
    before_mapped_bytes = open(mapping_path, "rb").read()
    rename_with_column_mapping(logical_to_physical, "cust_id", "customer_id")
    after_mapped_bytes = open(mapping_path, "rb").read()
    file_was_untouched = before_mapped_bytes == after_mapped_bytes
    print(f"  with column mapping: renaming cust_id -> customer_id left the data file untouched: {file_was_untouched}")
    print(f"  the logical name now in metadata: {'customer_id' in logical_to_physical}, still pointing at physical name: {logical_to_physical.get('customer_id')}")

    assert file_was_untouched is True
    assert logical_to_physical["customer_id"] == "col-1"
    assert "cust_id" not in logical_to_physical

    return file_was_rewritten, file_was_untouched


if __name__ == "__main__":
    demo_iceberg_field_ids()
    rewrote, untouched = demo_delta_column_mapping()

    print("\n--- Summary ---")
    print("Iceberg: field-ID projection survives a rename and an insert; position-based projection silently corrupts data.")
    print(f"Delta: without column mapping a rename rewrites the file ({rewrote}); with column mapping it does not ({untouched}).")
    print("\nAll assertions passed.")
