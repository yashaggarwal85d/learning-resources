"""
Shreds a real nested record (an optional field inside a repeated group) into Dremel's own
repetition-level / definition-level column stripes, by hand, following the definitions in the
Dremel paper (Melnik et al., VLDB 2010) and Apache Parquet's own nested-encoding spec. Reassembles
the original records from those two flat streams and checks the round trip. Then builds the same
structure two other ways -- Apache Arrow's offsets-plus-validity-bitmap list layout, and Apache
ORC's present-plus-length stream layout -- and checks all three carry the same structural
information, just organized differently.

No pyarrow/pyorc installed in this sandbox: every layout is hand-rolled from each spec's own text.
"""

# ---------------------------------------------------------------------------
# Schema: message Order { required int64 order_id; repeated group item {
#   required string sku; optional string note; } }
# One repeated field (item) in every leaf's path: max repetition level 1.
# sku is required: its only non-required ancestor is item, so max definition level 1.
# note is optional: item (repeated) + note (optional) are both non-required, so max
# definition level 2.
# ---------------------------------------------------------------------------

MAX_REP_LEVEL = 1
SKU_MAX_DEF_LEVEL = 1
NOTE_MAX_DEF_LEVEL = 2


def shred_sku(records: list) -> tuple:
    """sku is required: a definition level of 1 means the enclosing item is present,
    0 means this record's item list was empty."""
    values, reps, defs = [], [], []
    for rec in records:
        items = rec['items']
        if not items:
            values.append(None)
            reps.append(0)
            defs.append(0)  # item itself is the only undefined ancestor
            continue
        for i, item in enumerate(items):
            values.append(item['sku'])
            reps.append(0 if i == 0 else 1)  # 0 = new record, 1 = item repeated
            defs.append(1)  # item present, sku (required) always present with it
    return values, reps, defs


def shred_note(records: list) -> tuple:
    """note is optional: definition level 2 means item present and note present,
    1 means item present but note missing, 0 means the item list itself was empty."""
    values, reps, defs = [], [], []
    for rec in records:
        items = rec['items']
        if not items:
            values.append(None)
            reps.append(0)
            defs.append(0)
            continue
        for i, item in enumerate(items):
            reps.append(0 if i == 0 else 1)
            if item['note'] is None:
                values.append(None)
                defs.append(1)
            else:
                values.append(item['note'])
                defs.append(2)
    return values, reps, defs


def reassemble(order_ids: list, sku_stream: tuple, note_stream: tuple) -> list:
    """Walks both leaf streams in lock-step, using repetition level 0 as the record
    boundary, and definition level to decide whether an item/field is actually present."""
    sku_values, sku_reps, sku_defs = sku_stream
    note_values, note_reps, note_defs = note_stream
    assert len(sku_values) == len(note_values)  # both leaves under the same repeated group
    assert sku_reps == note_reps  # same record/item boundaries in both streams

    records = []
    i = 0
    n = len(sku_values)
    for order_id in order_ids:
        items = []
        # Consume one record's worth of entries: the first entry (rep 0) plus every
        # following entry until the next rep-0 entry (a new record) or the stream ends.
        first = True
        while i < n and (first or sku_reps[i] != 0):
            first = False
            if sku_defs[i] == 0:  # item list was empty for this record
                i += 1
                break
            sku = sku_values[i]
            note = note_values[i] if note_defs[i] == NOTE_MAX_DEF_LEVEL else None
            items.append({'sku': sku, 'note': note})
            i += 1
        records.append({'order_id': order_id, 'items': items})
    assert i == n
    return records


# ---------------------------------------------------------------------------
# This topic's own 3-record worked example (the one drawn step by step in the reel).
# ---------------------------------------------------------------------------

worked_records = [
    {'order_id': 100, 'items': [
        {'sku': 'A1', 'note': 'gift'},
        {'sku': 'A2', 'note': None},
        {'sku': 'A3', 'note': 'fragile'},
    ]},
    {'order_id': 200, 'items': []},
    {'order_id': 300, 'items': [
        {'sku': 'B1', 'note': 'urgent'},
    ]},
]

sku_stream = shred_sku(worked_records)
note_stream = shred_note(worked_records)

assert sku_stream[0] == ['A1', 'A2', 'A3', None, 'B1']
assert sku_stream[1] == [0, 1, 1, 0, 0]          # repetition levels
assert sku_stream[2] == [1, 1, 1, 0, 1]          # definition levels

assert note_stream[0] == ['gift', None, 'fragile', None, 'urgent']
assert note_stream[1] == [0, 1, 1, 0, 0]
assert note_stream[2] == [2, 1, 2, 0, 2]

order_ids = [r['order_id'] for r in worked_records]
reassembled = reassemble(order_ids, sku_stream, note_stream)
assert reassembled == worked_records


# ---------------------------------------------------------------------------
# The same structure, built Arrow's way: an offsets buffer + validity bitmap per list,
# instead of one shared repetition/definition level pair across the whole nested path.
# ---------------------------------------------------------------------------

def arrow_list_layout(records: list) -> tuple:
    offsets = [0]
    for rec in records:
        offsets.append(offsets[-1] + len(rec['items']))
    validity = [1] * len(records)  # none of this topic's lists are null, only empty
    flat_skus = [item['sku'] for rec in records for item in rec['items']]
    flat_note_validity = [0 if item['note'] is None else 1 for rec in records for item in rec['items']]
    flat_notes = [item['note'] for rec in records for item in rec['items']]
    return offsets, validity, flat_skus, flat_note_validity, flat_notes


arrow_offsets, arrow_validity, arrow_skus, arrow_note_validity, arrow_notes = arrow_list_layout(worked_records)
assert arrow_offsets == [0, 3, 3, 4]
assert arrow_validity == [1, 1, 1]
assert arrow_skus == ['A1', 'A2', 'A3', 'B1']
assert arrow_note_validity == [1, 0, 1, 1]

arrow_item_counts = [arrow_offsets[i + 1] - arrow_offsets[i] for i in range(len(worked_records))]
assert arrow_item_counts == [3, 0, 1]


# ---------------------------------------------------------------------------
# The same structure, built ORC's way: a PRESENT stream (is the list itself null?) plus
# a LENGTH stream (how many items), instead of Arrow's cumulative offsets.
# ---------------------------------------------------------------------------

def orc_list_layout(records: list) -> tuple:
    present = [1] * len(records)  # none of this topic's lists are null, only empty
    length = [len(rec['items']) for rec in records]
    flat_note_present = [0 if item['note'] is None else 1 for rec in records for item in rec['items']]
    return present, length, flat_note_present


orc_present, orc_length, orc_note_present = orc_list_layout(worked_records)
assert orc_present == [1, 1, 1]
assert orc_length == [3, 0, 1]
assert orc_note_present == arrow_note_validity  # same information, same stream shape

# Arrow's offsets and ORC's lengths carry the identical per-record item counts.
assert arrow_item_counts == orc_length


# ---------------------------------------------------------------------------
# Cost of deep nesting: every record contributes at least one leaf-column entry per
# leaf field, even when its item list is empty -- that overhead is fixed per record,
# not per actual data value, and it has to be decoded on every reassembly pass.
# ---------------------------------------------------------------------------

ROW_COUNT = 100
EMPTY_EVERY = 5  # every 5th record has no items at all

synthetic_records = []
for i in range(ROW_COUNT):
    if i % EMPTY_EVERY == 0:
        synthetic_records.append({'order_id': i, 'items': []})
    else:
        item_count = 1 + (i % 3)
        synthetic_records.append({
            'order_id': i,
            'items': [
                {'sku': f'S{i}-{j}', 'note': ('n' if j % 2 == 0 else None)}
                for j in range(item_count)
            ],
        })

syn_sku_stream = shred_sku(synthetic_records)
syn_note_stream = shred_note(synthetic_records)
syn_order_ids = [r['order_id'] for r in synthetic_records]
assert reassemble(syn_order_ids, syn_sku_stream, syn_note_stream) == synthetic_records

level_entries = len(syn_sku_stream[0])
actual_items = sum(len(r['items']) for r in synthetic_records)
empty_records = sum(1 for r in synthetic_records if not r['items'])
assert empty_records == ROW_COUNT // EMPTY_EVERY
assert level_entries == actual_items + empty_records
overhead_pct = round(100 * empty_records / level_entries)
assert empty_records == 20
assert actual_items == 159
assert level_entries == 179
assert overhead_pct == 11

if __name__ == "__main__":
    print(f"sku column: {sku_stream[0]}")
    print(f"sku repetition levels: {sku_stream[1]}")
    print(f"sku definition levels: {sku_stream[2]}")
    print(f"note column: {note_stream[0]}")
    print(f"note definition levels: {note_stream[2]}")
    print(f"reassembled {len(reassembled)} record(s), matches original: {reassembled == worked_records}")
    print(f"arrow offsets: {arrow_offsets}, validity: {arrow_validity}")
    print(f"orc present: {orc_present}, length: {orc_length}")
    print(f"{ROW_COUNT} synthetic records, {empty_records} with empty item lists: "
          f"{level_entries} level entries for {actual_items} actual items "
          f"({overhead_pct}% pure empty-list overhead)")
    print("All assertions passed.")
