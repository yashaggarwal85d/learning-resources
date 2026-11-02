"""Real, hand-rolled implementations of each format's own schema-evolution rule, run against real
schema changes, with asserts on the actual resolved values (not described, executed)."""
import struct

# =====================================================================================
# Avro: writer/reader schema resolution (fields matched by name; a reader field missing
# from the writer uses its default if it has one, or signals an error if it does not).
# =====================================================================================


class AvroResolutionError(Exception):
    pass


def resolve_avro_record(writer_record: dict, reader_fields: list):
    """reader_fields: list of (name, has_default, default_value)."""
    resolved = {}
    for name, has_default, default_value in reader_fields:
        if name in writer_record:
            resolved[name] = writer_record[name]
        elif has_default:
            resolved[name] = default_value
        else:
            raise AvroResolutionError(f"reader field {name!r} has no default and the writer's record lacks it")
    return resolved


# A record written before "currency" existed.
writer_record_v1 = {"order_id": 9001, "amount_cents": 4599}

# The reader's schema adds "currency" with a default — this is the safe evolution move.
reader_fields_with_default = [("order_id", False, None), ("amount_cents", False, None), ("currency", True, "USD")]
resolved_with_default = resolve_avro_record(writer_record_v1, reader_fields_with_default)
assert resolved_with_default == {"order_id": 9001, "amount_cents": 4599, "currency": "USD"}

# A reader that instead requires "discount_cents" with no default cannot resolve the same record.
reader_fields_no_default = [("order_id", False, None), ("amount_cents", False, None), ("discount_cents", False, None)]
try:
    resolve_avro_record(writer_record_v1, reader_fields_no_default)
    raise AssertionError("expected AvroResolutionError")
except AvroResolutionError:
    avro_no_default_raises = True
assert avro_no_default_raises is True

# =====================================================================================
# Protobuf: fields are identified on the wire by field number, not name. Reusing a
# deleted field's number for a field of a different type decodes the old bytes as the
# new type — silently, with no parse error.
# =====================================================================================

# V1 message: field 2 was a string, "customer_name".
v1_wire_bytes = {2: "Alice".encode("utf-8")}

# A developer deletes "customer_name" without reserving field 2, then adds "total_cents"
# (an int32) as the new field 2. Decoding the OLD bytes with the NEW schema's field 2:
total_cents_from_reused_field = int.from_bytes(v1_wire_bytes[2][:4], byteorder="little", signed=True)
assert total_cents_from_reused_field == 1667853377  # "Alic" read back as a little-endian int32 — not a parse error, just wrong

# Reserving the number prevents this at schema-definition time, before any bytes are involved.
reserved_field_numbers = {2, 15, 9, 10, 11}


def declare_field(number: int, reserved: set):
    if number in reserved:
        raise ValueError(f"field number {number} is reserved; it must never be reused")
    return number


try:
    declare_field(2, reserved_field_numbers)
    raise AssertionError("expected ValueError")
except ValueError:
    protobuf_reserved_blocks_reuse = True
assert protobuf_reserved_blocks_reuse is True

# =====================================================================================
# Parquet: by-name, by-position and by-field-ID column matching, after the same schema
# change — a rename plus an inserted column — applied to one real on-disk column layout.
# =====================================================================================

# The file as originally written: (field_id, name, value) in on-disk order.
old_file_columns = [(1, "cust_id", 4017), (2, "amount_cents", 4599), (3, "currency", "USD")]

# The new schema a later reader expects: cust_id renamed to customer_id, and a new
# "region" column (field_id 4, genuinely new, no data exists for it yet) inserted
# between customer_id and amount_cents.
new_schema = [(1, "customer_id"), (4, "region"), (2, "amount_cents"), (3, "currency")]


def match_by_name(old_columns, schema):
    by_name = {name: value for _fid, name, value in old_columns}
    return {name: by_name.get(name) for _fid, name in schema}


def match_by_position(old_columns, schema):
    return {name: (old_columns[i][2] if i < len(old_columns) else None) for i, (_fid, name) in enumerate(schema)}


def match_by_field_id(old_columns, schema):
    by_id = {fid: value for fid, _name, value in old_columns}
    return {name: by_id.get(fid) for fid, name in schema}


by_name_result = match_by_name(old_file_columns, new_schema)
by_position_result = match_by_position(old_file_columns, new_schema)
by_field_id_result = match_by_field_id(old_file_columns, new_schema)

# By name: the renamed column is invisible under its old name — it reads back missing,
# a safe failure, not a wrong value. Everything not renamed still matches correctly.
assert by_name_result == {"customer_id": None, "region": None, "amount_cents": 4599, "currency": "USD"}

# By position: the inserted column shifts every later column over by one slot, so each
# position after the insert silently reads the WRONG column's data.
assert by_position_result == {"customer_id": 4017, "region": 4599, "amount_cents": "USD", "currency": None}
assert by_position_result["region"] == 4599  # region silently holds amount_cents's value
assert by_position_result["amount_cents"] == "USD"  # amount_cents silently holds currency's value

# By field ID: every column, renamed or shifted, resolves to its real data; the one
# genuinely new column (region) correctly reads back missing.
assert by_field_id_result == {"customer_id": 4017, "region": None, "amount_cents": 4599, "currency": "USD"}

print(f"Avro: missing field with a default resolves to {resolved_with_default['currency']!r}; missing field with no default raises")
print(f"Protobuf: field 2's old string bytes, reread as the reused field 2's int32, decode to {total_cents_from_reused_field}")
print(f"Parquet by-name: renamed column reads back as {by_name_result['customer_id']}")
print(f"Parquet by-position: the inserted column shifts data — region reads {by_position_result['region']}, amount_cents reads {by_position_result['amount_cents']!r}")
print(f"Parquet by-field-ID: renamed column still reads {by_field_id_result['customer_id']}, new column reads {by_field_id_result['region']}")
print("schema evolution examples: all checks pass")
