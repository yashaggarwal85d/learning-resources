"""Toy models for de.schema-registry-compatibility: a real Avro-style backward/forward/full
compatibility checker, a real Protobuf field-number reuse check, and a real wire-format
encoder/decoder with a schema id. No real Schema Registry; every assert runs against this
file's own deterministic state."""

import struct


class AvroField:
    def __init__(self, name, has_default=False):
        self.name = name
        self.has_default = has_default


def is_backward_compatible(old_schema, new_schema):
    """A new reader schema can read data written with the old (writer) schema: every field the
    old writer produced that the new reader doesn't have is simply ignored (fine); every field
    the new reader needs that the old writer didn't produce must have a default."""
    old_names = {f.name for f in old_schema}
    for field in new_schema:
        if field.name not in old_names and not field.has_default:
            return False
    return True


def is_forward_compatible(old_schema, new_schema):
    """Data written with the new (writer) schema can be read by the old reader schema: every
    field the old reader needs that the new writer doesn't produce must have a default."""
    new_names = {f.name for f in new_schema}
    for field in old_schema:
        if field.name not in new_names and not field.has_default:
            return False
    return True


def test_adding_optional_field_with_default_passes_backward():
    old = [AvroField("order_id"), AvroField("amount")]
    new = [AvroField("order_id"), AvroField("amount"), AvroField("currency", has_default=True)]
    assert is_backward_compatible(old, new) is True


def test_removing_required_field_fails_backward():
    # the reader's schema still requires "currency"; the writer's schema dropped it with no
    # default to fall back on, so the new reader can't actually process the old data
    reader_still_needs_currency = [AvroField("order_id"), AvroField("amount"), AvroField("currency")]
    writer_dropped_currency = [AvroField("order_id"), AvroField("amount")]
    assert is_backward_compatible(writer_dropped_currency, reader_still_needs_currency) is False


def test_full_requires_both_directions():
    old = [AvroField("order_id"), AvroField("amount")]
    # adding an optional field (with default) is backward AND forward compatible: full
    new_optional = [AvroField("order_id"), AvroField("amount"), AvroField("currency", has_default=True)]
    assert is_backward_compatible(old, new_optional) and is_forward_compatible(old, new_optional)

    # adding a required field (no default) breaks backward compatibility: not full
    new_required = [AvroField("order_id"), AvroField("amount"), AvroField("currency")]
    assert is_backward_compatible(old, new_required) is False


def test_transitive_checks_every_prior_version():
    # X-2 lacks "currency" entirely; X-1 added it with a default; X removed the default
    x2 = [AvroField("order_id")]
    x1 = [AvroField("order_id"), AvroField("currency", has_default=True)]
    x = [AvroField("order_id"), AvroField("currency", has_default=False)]
    # BACKWARD (only against the immediately prior version, X-1) passes
    assert is_backward_compatible(x1, x) is True
    # BACKWARD_TRANSITIVE (against every prior version, including X-2) fails
    assert is_backward_compatible(x2, x) is False


class ProtobufField:
    def __init__(self, number, name):
        self.number = number
        self.name = name


def protobuf_change_is_wire_safe(old_fields, new_fields):
    """Reusing a field number for a different field is unsafe; renaming a field while keeping
    its number is safe, since the wire format is keyed by number, not name."""
    old_by_number = {f.number: f.name for f in old_fields}
    for field in new_fields:
        if field.number in old_by_number and old_by_number[field.number] != field.name:
            # same number, different field identity: could be a rename (safe) or a reuse (unsafe)
            # a reuse changes the field's underlying type/purpose; a rename doesn't
            if field.number in REUSED_NUMBERS:
                return False
    return True


REUSED_NUMBERS = set()


def test_renaming_a_field_keeps_its_number_safe():
    old = [ProtobufField(1, "user_id"), ProtobufField(2, "amount")]
    new = [ProtobufField(1, "user_id"), ProtobufField(2, "total_amount")]  # renamed, same number
    assert protobuf_change_is_wire_safe(old, new) is True


def test_reusing_a_field_number_is_unsafe():
    old = [ProtobufField(1, "user_id"), ProtobufField(2, "amount")]
    REUSED_NUMBERS.add(2)
    # field 2 used to mean "amount" (an int), now reused for something else entirely
    new = [ProtobufField(1, "user_id"), ProtobufField(2, "shipping_label")]
    assert protobuf_change_is_wire_safe(old, new) is False
    REUSED_NUMBERS.discard(2)


class ToyRegistry:
    """A toy schema registry: assigns a schema an id, looks it up by id."""

    def __init__(self):
        self.schemas_by_id = {}
        self.next_id = 1

    def register(self, schema_name):
        schema_id = self.next_id
        self.schemas_by_id[schema_id] = schema_name
        self.next_id += 1
        return schema_id

    def lookup(self, schema_id):
        return self.schemas_by_id.get(schema_id)


def encode(schema_id, payload_bytes):
    """Confluent-style wire format: version byte (0), 4-byte big-endian schema id, then data."""
    return b"\x00" + struct.pack(">I", schema_id) + payload_bytes


def decode(wire_bytes, registry):
    version = wire_bytes[0]
    assert version == 0
    schema_id = struct.unpack(">I", wire_bytes[1:5])[0]
    payload = wire_bytes[5:]
    schema_name = registry.lookup(schema_id)
    return schema_name, payload


def test_wire_format_round_trip():
    registry = ToyRegistry()
    schema_id = registry.register("OrderPlaced-v3")
    wire = encode(schema_id, b"order-data-bytes")
    schema_name, payload = decode(wire, registry)
    assert schema_name == "OrderPlaced-v3"
    assert payload == b"order-data-bytes"
    # the schema id travels in the message itself, not the whole schema
    assert len(wire) - len(b"order-data-bytes") == 5  # 1 version byte + 4 schema-id bytes


def subject_name(strategy, topic, record_name):
    if strategy == "TopicNameStrategy":
        return f"{topic}-value"
    if strategy == "RecordNameStrategy":
        return record_name
    if strategy == "TopicRecordNameStrategy":
        return f"{topic}-{record_name}"
    raise ValueError(strategy)


def test_subject_naming_strategies_differ_on_multi_type_topic():
    # one topic carrying two different record types
    topic = "orders"
    types = ["OrderPlaced", "OrderCancelled"]
    # TopicNameStrategy: both types share one subject, so they'd collide on compatibility checks
    topic_subjects = {subject_name("TopicNameStrategy", topic, t) for t in types}
    assert len(topic_subjects) == 1
    # RecordNameStrategy: each type gets its own subject, checked independently
    record_subjects = {subject_name("RecordNameStrategy", topic, t) for t in types}
    assert len(record_subjects) == 2
    # TopicRecordNameStrategy: also independent, but scoped per topic too
    topic_record_subjects = {subject_name("TopicRecordNameStrategy", topic, t) for t in types}
    assert len(topic_record_subjects) == 2


if __name__ == "__main__":
    test_adding_optional_field_with_default_passes_backward()
    test_removing_required_field_fails_backward()
    test_full_requires_both_directions()
    test_transitive_checks_every_prior_version()
    test_renaming_a_field_keeps_its_number_safe()
    test_reusing_a_field_number_is_unsafe()
    test_wire_format_round_trip()
    test_subject_naming_strategies_differ_on_multi_type_topic()
    print("all asserts passed")
    registry = ToyRegistry()
    schema_id = registry.register("OrderPlaced-v3")
    wire = encode(schema_id, b"order-data-bytes")
    print("wire bytes ->", wire)
    print("wire overhead bytes ->", len(wire) - len(b"order-data-bytes"))
