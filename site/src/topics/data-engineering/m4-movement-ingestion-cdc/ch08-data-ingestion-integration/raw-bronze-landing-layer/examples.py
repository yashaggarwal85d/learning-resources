"""de.raw-bronze-landing-layer: immutable raw capture, source metadata, rebuild by replay,
and the retention/PII tension an immutable raw layer creates.

Every function below is a direct, reproducible measurement against an in-process raw layer
and silver table. No network, no real warehouse: the mechanism (append-only capture, replay
determinism, erasure as a tracked exception) is what's being measured, not any particular
storage engine.
"""

import hashlib
import json


class RawLayer:
    """An append-only strip of records, each stamped with its own source metadata."""

    def __init__(self):
        self.records = []

    def append(self, schema_version, **payload):
        rec = {
            "source_offset": len(self.records),
            "ingest_ts": 1000 + len(self.records),
            "schema_version": schema_version,
            **payload,
        }
        self.records.append(rec)
        return rec


def checksum(obj):
    return hashlib.sha256(json.dumps(obj, sort_keys=True).encode()).hexdigest()


def raw_capture_is_append_only():
    raw = RawLayer()
    raw.append(1, order_id="o1", amount=100, currency="USD")
    raw.append(1, order_id="o2", amount=200, currency="EUR")
    raw.append(1, order_id="o3", amount=50, currency="USD")
    before = [dict(r) for r in raw.records]

    # a correction to o2's amount arrives later as a brand new record, never touching the first
    raw.append(1, order_id="o2", amount=210, currency="EUR", correction_of=1)

    after_original_three = [dict(r) for r in raw.records[:3]]
    unmutated = before == after_original_three

    # current state is derived, not stored: replay last-offset-wins per order id
    latest = {}
    for r in raw.records:
        latest[r["order_id"]] = r

    result = {
        "raw_record_count": len(raw.records),
        "original_three_records_unmutated": unmutated,
        "o2_amount_via_replay": latest["o2"]["amount"],
    }
    assert result["original_three_records_unmutated"] is True
    assert result["o2_amount_via_replay"] == 210
    assert result["raw_record_count"] == 4
    return result


def source_metadata_fields_present():
    raw = RawLayer()
    raw.append(1, order_id="o1", amount=100, currency="USD")
    raw.append(2, order_id="o2", amount=200, currency="EUR", fx_rate=0.92)

    required = {"source_offset", "ingest_ts", "schema_version"}
    fields_ok = all(required <= set(r.keys()) for r in raw.records)
    schema_versions = [r["schema_version"] for r in raw.records]

    result = {
        "every_record_has_the_three_fields": fields_ok,
        "schema_versions_seen": schema_versions,
    }
    assert result["every_record_has_the_three_fields"] is True
    assert result["schema_versions_seen"] == [1, 2]
    return result


FX = {"USD": 1.0, "EUR": 0.92, "GBP": 0.79}


def buggy_transform(rec):
    # last year's actual bug: treats every amount as already converted, ignoring currency
    return {"order_id": rec["order_id"], "amount_usd": rec["amount"]}


def fixed_transform(rec):
    rate = FX.get(rec["currency"], 1.0)
    return {"order_id": rec["order_id"], "amount_usd": round(rec["amount"] * rate, 2)}


def build_silver(raw, transform):
    silver = {}
    for r in raw.records:
        row = transform(r)
        silver[row["order_id"]] = row
    return silver


def rebuild_by_replay_is_deterministic():
    raw = RawLayer()
    raw.append(1, order_id="o1", amount=100, currency="USD")
    raw.append(1, order_id="o2", amount=200, currency="EUR")
    raw.append(1, order_id="o3", amount=300, currency="GBP")

    silver_first_build = checksum(build_silver(raw, fixed_transform))
    # simulate deleting the silver table entirely and rebuilding from raw alone
    silver_second_build = checksum(build_silver(raw, fixed_transform))

    result = {
        "first_build_checksum": silver_first_build,
        "second_build_checksum": silver_second_build,
        "identical": silver_first_build == silver_second_build,
    }
    assert result["identical"] is True
    return result


def rebuild_with_bug_fix_isolates_the_change():
    raw = RawLayer()
    raw.append(1, order_id="o1", amount=100, currency="USD")
    raw.append(1, order_id="o2", amount=200, currency="EUR")
    raw.append(1, order_id="o3", amount=300, currency="GBP")
    raw.append(1, order_id="o4", amount=400, currency="USD")

    silver_buggy = build_silver(raw, buggy_transform)
    silver_fixed = build_silver(raw, fixed_transform)

    changed = sorted(oid for oid in silver_buggy if silver_buggy[oid]["amount_usd"] != silver_fixed[oid]["amount_usd"])
    unchanged = sorted(oid for oid in silver_buggy if silver_buggy[oid]["amount_usd"] == silver_fixed[oid]["amount_usd"])

    result = {"orders_changed_by_the_fix": changed, "orders_unchanged_by_the_fix": unchanged}
    assert result["orders_changed_by_the_fix"] == ["o2", "o3"]
    assert result["orders_unchanged_by_the_fix"] == ["o1", "o4"]
    return result


def erasure_against_plaintext_raw_breaks_immutability():
    raw = RawLayer()
    raw.append(1, order_id="o1", customer_email="a@example.com", amount=100)
    raw.append(1, order_id="o2", customer_email="b@example.com", amount=200)
    raw.append(1, order_id="o3", customer_email="a@example.com", amount=50)
    raw.append(1, order_id="o4", customer_email="a@example.com", amount=70)

    target = "a@example.com"
    records_naming_target = [r for r in raw.records if r["customer_email"] == target]

    # the only way to satisfy an erasure request here is to mutate each historical record
    for r in records_naming_target:
        r["customer_email"] = "[erased]"

    plaintext_remaining = any(r["customer_email"] == target for r in raw.records)

    result = {
        "raw_records_mutated_to_satisfy_erasure": len(records_naming_target),
        "plaintext_remaining_after_erasure": plaintext_remaining,
    }
    assert result["raw_records_mutated_to_satisfy_erasure"] == 3
    assert result["plaintext_remaining_after_erasure"] is False
    return result


def erasure_against_tokenized_raw_preserves_immutability():
    vault = {"tok-1": "a@example.com", "tok-2": "b@example.com"}
    raw = RawLayer()
    raw.append(1, order_id="o1", customer_token="tok-1", amount=100)
    raw.append(1, order_id="o2", customer_token="tok-2", amount=200)
    raw.append(1, order_id="o3", customer_token="tok-1", amount=50)
    raw.append(1, order_id="o4", customer_token="tok-1", amount=70)

    checksum_before = checksum([dict(r) for r in raw.records])

    # erasure deletes only the vault's mapping; not one raw record is touched
    del vault["tok-1"]

    checksum_after = checksum([dict(r) for r in raw.records])

    result = {
        "raw_checksum_unchanged_by_erasure": checksum_before == checksum_after,
        "token_still_resolves_to_an_email": "tok-1" in vault,
    }
    assert result["raw_checksum_unchanged_by_erasure"] is True
    assert result["token_still_resolves_to_an_email"] is False
    return result


if __name__ == "__main__":
    raw_capture_is_append_only()
    source_metadata_fields_present()
    rebuild_by_replay_is_deterministic()
    rebuild_with_bug_fix_isolates_the_change()
    erasure_against_plaintext_raw_breaks_immutability()
    erasure_against_tokenized_raw_preserves_immutability()
    print("de.raw-bronze-landing-layer: all checks passed")
