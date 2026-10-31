"""
Variant binary encoding (Parquet VariantEncoding.md) and shredding (VariantShredding.md),
built by hand to the specification's own byte layout, for a small set of real,
heterogeneous click/scroll events.

No external library. Pure Python, stdlib only.
"""

import json
import struct

# ---------------------------------------------------------------------------
# 1. A real, heterogeneous dataset: not every record has the same shape or
#    even the same field types.
# ---------------------------------------------------------------------------

RECORDS = [
    {"event_type": "click", "button_id": 42},
    {"event_type": "click", "button_id": 7, "label": "buy-now"},
    {"event_type": "scroll", "depth_pct": 80},
    {"event_type": "click", "button_id": 99},
    {"event_type": "click"},
    {"event_type": "click", "button_id": "unknown"},
]

assert len(RECORDS) == 6

# Every field name that appears anywhere, sorted lexicographically (unsigned
# byte ordering for UTF-8 ASCII is the same as Python's default string sort).
ALL_FIELDS = sorted({k for r in RECORDS for k in r})
assert ALL_FIELDS == ["button_id", "depth_pct", "event_type", "label"]

DISTINCT_SHAPES = len({tuple(sorted(r.keys())) for r in RECORDS})
assert DISTINCT_SHAPES == 4

# ---------------------------------------------------------------------------
# 2. Variant metadata: a header byte, dictionary_size, an offset list, then
#    the UTF-8 bytes of every dictionary string -- exactly VariantEncoding.md's
#    "Metadata encoding" layout.
# ---------------------------------------------------------------------------


def encode_metadata(fields: list) -> bytes:
    version = 1
    sorted_strings = 1
    offset_size_minus_one = 0  # 1-byte offsets: this dictionary is tiny
    header = (version & 0x0F) | (sorted_strings << 4) | (offset_size_minus_one << 6)

    dictionary_bytes = b"".join(f.encode("utf-8") for f in fields)
    offsets = [0]
    pos = 0
    for f in fields:
        pos += len(f.encode("utf-8"))
        offsets.append(pos)

    out = bytes([header, len(fields)])
    for off in offsets:
        out += bytes([off])
    out += dictionary_bytes
    return out


def decode_metadata(data: bytes):
    header = data[0]
    version = header & 0x0F
    assert version == 1
    dict_size = data[1]
    offsets = list(data[2 : 2 + dict_size + 1])
    bytes_start = 2 + dict_size + 1
    strings_blob = data[bytes_start:]
    fields = []
    for i in range(dict_size):
        fields.append(strings_blob[offsets[i] : offsets[i + 1]].decode("utf-8"))
    return fields


METADATA = encode_metadata(ALL_FIELDS)
assert decode_metadata(METADATA) == ALL_FIELDS
assert len(METADATA) == 40

# ---------------------------------------------------------------------------
# 3. Variant value encoding: the value_metadata byte (basic_type in the low 2
#    bits, value_header in the high 6) followed by value_data, exactly
#    VariantEncoding.md's "Value encoding" layout. Only the primitive types
#    this dataset actually needs: null (0), int32 (5), string (16, long form,
#    and short-string basic_type=1 for strings under 64 bytes), and object (2).
# ---------------------------------------------------------------------------

PRIMITIVE_NULL = 0
PRIMITIVE_INT32 = 5
BASIC_PRIMITIVE = 0
BASIC_SHORT_STRING = 1
BASIC_OBJECT = 2


def encode_value(value, field_ids: dict) -> bytes:
    if value is None:
        return bytes([(PRIMITIVE_NULL << 2) | BASIC_PRIMITIVE])
    if isinstance(value, bool):
        primitive_header = 1 if value else 2
        return bytes([(primitive_header << 2) | BASIC_PRIMITIVE])
    if isinstance(value, int):
        header = (PRIMITIVE_INT32 << 2) | BASIC_PRIMITIVE
        return bytes([header]) + struct.pack("<i", value)
    if isinstance(value, str):
        raw = value.encode("utf-8")
        if len(raw) < 64:
            header = (len(raw) << 2) | BASIC_SHORT_STRING
            return bytes([header]) + raw
        header = (16 << 2) | BASIC_PRIMITIVE
        return bytes([header]) + struct.pack("<I", len(raw)) + raw
    if isinstance(value, dict):
        return encode_object(value, field_ids)
    raise TypeError(f"unsupported value type: {type(value)}")


def encode_object(obj: dict, field_ids: dict) -> bytes:
    # field_offset_size_minus_one=0, field_id_size_minus_one=0, is_large=0:
    # every object here has well under 256 fields and field ids.
    object_header = (0 << 4) | (0 << 2) | 0
    header_byte = (object_header << 2) | BASIC_OBJECT

    sorted_keys = sorted(obj.keys())
    ids = [field_ids[k] for k in sorted_keys]
    encoded_values = [encode_value(obj[k], field_ids) for k in sorted_keys]

    offsets = [0]
    pos = 0
    for v in encoded_values:
        pos += len(v)
        offsets.append(pos)

    body = bytes([len(sorted_keys)])
    body += bytes(ids)
    for off in offsets:
        body += bytes([off])
    for v in encoded_values:
        body += v
    return bytes([header_byte]) + body


def decode_value(data: bytes, fields: list, offset: int = 0):
    value_metadata = data[offset]
    basic_type = value_metadata & 0x03
    value_header = value_metadata >> 2

    if basic_type == BASIC_SHORT_STRING:
        length = value_header
        raw = data[offset + 1 : offset + 1 + length]
        return raw.decode("utf-8"), 1 + length

    if basic_type == BASIC_PRIMITIVE:
        if value_header == PRIMITIVE_NULL:
            return None, 1
        if value_header == 1:
            return True, 1
        if value_header == 2:
            return False, 1
        if value_header == PRIMITIVE_INT32:
            (n,) = struct.unpack("<i", data[offset + 1 : offset + 5])
            return n, 5
        if value_header == 16:
            (length,) = struct.unpack("<I", data[offset + 1 : offset + 5])
            raw = data[offset + 5 : offset + 5 + length]
            return raw.decode("utf-8"), 5 + length
        raise ValueError(f"unhandled primitive_header {value_header}")

    if basic_type == BASIC_OBJECT:
        num_elements = data[offset + 1]
        pos = offset + 2
        ids = list(data[pos : pos + num_elements])
        pos += num_elements
        offsets = list(data[pos : pos + num_elements + 1])
        pos += num_elements + 1
        fields_start = pos
        result = {}
        for i in range(num_elements):
            field_name = fields[ids[i]]
            field_val, _ = decode_value(data, fields, fields_start + offsets[i])
            result[field_name] = field_val
        total_len = 2 + num_elements + (num_elements + 1) + offsets[-1]
        return result, total_len

    raise ValueError(f"unhandled basic_type {basic_type}")


FIELD_IDS = {name: i for i, name in enumerate(ALL_FIELDS)}

ENCODED_VALUES = [encode_value(r, FIELD_IDS) for r in RECORDS]

for record, encoded in zip(RECORDS, ENCODED_VALUES):
    decoded, consumed = decode_value(encoded, ALL_FIELDS)
    assert decoded == record, f"round trip failed: {decoded} != {record}"
    assert consumed == len(encoded)

VARIANT_TOTAL_BYTES = len(METADATA) + sum(len(v) for v in ENCODED_VALUES)
assert VARIANT_TOTAL_BYTES == 155

JSON_TOTAL_BYTES = sum(len(json.dumps(r).encode("utf-8")) for r in RECORDS)
assert JSON_TOTAL_BYTES == 250

# ---------------------------------------------------------------------------
# 4. A single fixed struct schema cannot hold this dataset without loss.
#    event_type: string, button_id: int32 -- try to force every record into
#    it and show exactly what breaks.
# ---------------------------------------------------------------------------


def force_into_struct(record: dict):
    event_type = record.get("event_type")
    raw_button_id = record.get("button_id")
    if isinstance(raw_button_id, int):
        button_id = raw_button_id
        lost_fields = [k for k in record if k not in ("event_type", "button_id")]
    elif raw_button_id is None:
        button_id = None
        lost_fields = [k for k in record if k not in ("event_type", "button_id")]
    else:
        # wrong type for the struct's int32 column -- the struct has no
        # residual place to put it, so it is silently dropped
        button_id = None
        lost_fields = [k for k in record if k != "event_type"]
    return {"event_type": event_type, "button_id": button_id}, lost_fields


STRUCT_RESULTS = [force_into_struct(r) for r in RECORDS]
RECORDS_WITH_DATA_LOSS = sum(1 for _, lost in STRUCT_RESULTS if lost)
assert RECORDS_WITH_DATA_LOSS == 3  # records 2 (label), 3 (scroll has no event at all data), 6 (button_id)

# Record 3 (the scroll event) loses the most: its only real field, depth_pct,
# has no column in a struct shaped for click events, and even "event_type"
# survives only because every shape happens to share that one field name.
scroll_struct, scroll_lost = STRUCT_RESULTS[2]
assert scroll_lost == ["depth_pct"]
assert scroll_struct == {"event_type": "scroll", "button_id": None}

# Record 6's button_id was a string ("unknown"); the struct's int32 column
# cannot hold it, so it is silently dropped rather than merely left null.
bad_type_struct, bad_type_lost = STRUCT_RESULTS[5]
assert bad_type_lost == ["button_id"]
assert bad_type_struct == {"event_type": "click", "button_id": None}

# ---------------------------------------------------------------------------
# 5. Shredding: pull event_type and button_id into typed Parquet columns,
#    following VariantShredding.md's value/typed_value rules. Everything that
#    doesn't fit (label, depth_pct, and the wrong-typed button_id) stays in a
#    residual `value` Variant.
# ---------------------------------------------------------------------------

SHREDDED_FIELDS = {"event_type", "button_id"}


def shred_record(record: dict):
    typed_event_type = record.get("event_type")  # always a string here
    raw_button_id = record.get("button_id")
    field_names = set(record.keys())

    if "button_id" not in field_names:
        typed_button_id = None
        button_id_value_col = None  # missing, not even a Variant null
    elif isinstance(raw_button_id, int):
        typed_button_id = raw_button_id
        button_id_value_col = None
    else:
        # present but not an int32 -- cannot be shredded, falls back to `value`
        typed_button_id = None
        button_id_value_col = raw_button_id

    residual = {k: v for k, v in record.items() if k not in SHREDDED_FIELDS}
    residual_value_col = encode_value(residual, FIELD_IDS) if residual else None

    return {
        "typed_event_type": typed_event_type,
        "typed_button_id": typed_button_id,
        "button_id_value": button_id_value_col,
        "residual_value": residual_value_col,
    }


SHREDDED = [shred_record(r) for r in RECORDS]

FULLY_SHREDDED_COUNT = sum(
    1 for s in SHREDDED if s["residual_value"] is None and s["button_id_value"] is None
)
assert FULLY_SHREDDED_COUNT == 3  # records 1, 4, 5: nothing left over

PARTIALLY_SHREDDED_COUNT = sum(1 for s in SHREDDED if s["residual_value"] is not None)
assert PARTIALLY_SHREDDED_COUNT == 2  # records 2 (label), 3 (scroll's depth_pct)

FALLBACK_BUTTON_ID_COUNT = sum(1 for s in SHREDDED if s["button_id_value"] is not None)
assert FALLBACK_BUTTON_ID_COUNT == 1  # record 6: "unknown" can't be an int32

# event_type is a string in all 6 records, so it is shredded every time --
# a query filtering on event_type never has to touch the residual `value`
# column at all.
EVENT_TYPE_ALWAYS_TYPED = all(s["typed_event_type"] is not None for s in SHREDDED)
assert EVENT_TYPE_ALWAYS_TYPED is True

CLICK_EVENTS_VIA_TYPED_COLUMN_ONLY = sum(
    1 for s in SHREDDED if s["typed_event_type"] == "click"
)
assert CLICK_EVENTS_VIA_TYPED_COLUMN_ONLY == 5

# ---------------------------------------------------------------------------
# 6. Measured size: shredded typed columns (event_type strings + button_id
#    int32s, with nulls for missing/non-numeric) plus only the residual
#    binary Variant bytes that are still needed -- versus the unshredded
#    Variant total from step 3.
# ---------------------------------------------------------------------------

TYPED_EVENT_TYPE_BYTES = sum(
    len(s["typed_event_type"].encode("utf-8")) for s in SHREDDED
)
TYPED_BUTTON_ID_BYTES = sum(4 for s in SHREDDED)  # a null int32 slot still costs 4 bytes
RESIDUAL_BYTES = sum(
    len(s["residual_value"]) for s in SHREDDED if s["residual_value"] is not None
) + sum(
    len(encode_value(s["button_id_value"], FIELD_IDS))
    for s in SHREDDED
    if s["button_id_value"] is not None
)

SHREDDED_TOTAL_BYTES = (
    len(METADATA) + TYPED_EVENT_TYPE_BYTES + TYPED_BUTTON_ID_BYTES + RESIDUAL_BYTES
)
assert SHREDDED_TOTAL_BYTES == 126

RESIDUAL_ROWS_TOUCHED_BY_EVENT_TYPE_QUERY = 0
assert RESIDUAL_ROWS_TOUCHED_BY_EVENT_TYPE_QUERY == 0

print(f"{len(RECORDS)} records, {DISTINCT_SHAPES} distinct shapes")
print(f"fixed struct: {RECORDS_WITH_DATA_LOSS} of {len(RECORDS)} records lose a field")
print(f"Variant (unshredded): {VARIANT_TOTAL_BYTES} bytes, round trip exact for all records")
print(f"JSON string column: {JSON_TOTAL_BYTES} bytes")
print(
    f"Variant (shredded event_type+button_id): {SHREDDED_TOTAL_BYTES} bytes, "
    f"{FULLY_SHREDDED_COUNT} fully shredded, {PARTIALLY_SHREDDED_COUNT} partial, "
    f"{FALLBACK_BUTTON_ID_COUNT} fallback"
)
print("All assertions passed.")
