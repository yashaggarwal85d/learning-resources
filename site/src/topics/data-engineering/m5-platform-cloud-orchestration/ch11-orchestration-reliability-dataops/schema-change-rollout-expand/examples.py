"""
A real, if toy, Confluent-style compatibility checker, and a real simulation
of renaming a column on the shop's orders schema (amount -> total_amount)
through expand, migrate and contract -- including what genuinely breaks if
contract runs before every consumer has actually migrated.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path

SOURCES_DIR = Path(__file__).parent / "sources"

MAX_DUAL_WRITE_WINDOW_TICKS = 5


@dataclass
class Field:
    name: str
    required: bool = True
    has_default: bool = False


@dataclass
class Schema:
    name: str
    fields: list[Field] = field(default_factory=list)


def backward_compatible(old: Schema, new: Schema) -> bool:
    """Confluent's BACKWARD rule: a reader using `new` can process data written with `old`."""
    old_names = {f.name for f in old.fields}
    for f in new.fields:
        if f.required and not f.has_default and f.name not in old_names:
            return False  # the new reader needs a field the old writer never wrote, with no default to fall back on
    return True


def forward_compatible(old: Schema, new: Schema) -> bool:
    """Confluent's FORWARD rule: a reader using `old` can process data written with `new`."""
    new_names = {f.name for f in new.fields}
    for f in old.fields:
        if f.required and not f.has_default and f.name not in new_names:
            return False  # the old reader needs a field the new writer no longer writes
    return True


def full_compatible(old: Schema, new: Schema) -> bool:
    """Confluent's FULL rule: both directions hold."""
    return backward_compatible(old, new) and forward_compatible(old, new)


def check_compatibility_modes() -> dict:
    v1 = Schema("orders_v1", [Field("order_id"), Field("amount")])
    v2_expand = Schema("orders_v2_expand", [Field("order_id"), Field("amount"), Field("total_amount", required=False, has_default=True)])
    v3_contract = Schema("orders_v3_contract", [Field("order_id"), Field("total_amount")])

    expand_result = {
        "backward": backward_compatible(v1, v2_expand),
        "forward": forward_compatible(v1, v2_expand),
        "full": full_compatible(v1, v2_expand),
    }
    assert expand_result == {"backward": True, "forward": True, "full": True}

    contract_too_early = {
        "backward": backward_compatible(v2_expand, v3_contract),
        "forward": forward_compatible(v2_expand, v3_contract),
    }
    # forward fails: a consumer still reading v2's "amount" field cannot process v3's data,
    # which is exactly why contract must wait until every consumer has actually migrated off it.
    assert contract_too_early == {"backward": True, "forward": False}

    return {"expand": expand_result, "contract_before_migrate": contract_too_early}


@dataclass
class Record:
    fields: dict


def produce_v1(order_id: int, amount: float) -> Record:
    return Record({"order_id": order_id, "amount": amount})


def produce_dual_write(order_id: int, amount: float) -> Record:
    return Record({"order_id": order_id, "amount": amount, "total_amount": amount})


def produce_contract(order_id: int, amount: float) -> Record:
    return Record({"order_id": order_id, "total_amount": amount})


def read_as_old(record: Record) -> float:
    return record.fields["amount"]


def read_as_new(record: Record) -> float:
    return record.fields["total_amount"]


CONSUMERS = ["dashboard_revenue", "dashboard_finance", "dashboard_ops"]


def run_expand_migrate_contract_rollout() -> dict:
    """The shop's own rename of orders.amount -> orders.total_amount, ticked through all three phases."""
    migrated = {c: False for c in CONSUMERS}
    dual_write_start_tick = 0
    dual_write_end_tick = None
    errors_during_dual_write = []

    # expand: the producer starts dual-writing both fields; every consumer, migrated or not, keeps working.
    # only the first two of three consumers migrate during this window -- the third is still a laggard.
    for tick in range(1, 3):
        record = produce_dual_write(order_id=tick, amount=100.0 * tick)
        for consumer in CONSUMERS:
            reader = read_as_new if migrated[consumer] else read_as_old
            try:
                reader(record)
            except KeyError as e:
                errors_during_dual_write.append((tick, consumer, str(e)))
        migrated[CONSUMERS[tick - 1]] = True  # migrate one consumer per tick

    assert errors_during_dual_write == []  # dual-write kept every consumer working through the whole migrate phase
    dual_write_end_tick = 2
    window_ticks = dual_write_end_tick - dual_write_start_tick
    assert window_ticks <= MAX_DUAL_WRITE_WINDOW_TICKS

    # a premature contract, attempted before every consumer has migrated, genuinely breaks the laggard.
    still_on_old_field = [c for c, done in migrated.items() if not done]
    assert still_on_old_field == ["dashboard_ops"]  # the third consumer never migrated yet
    premature_contract_errors = []
    premature_record = produce_contract(order_id=99, amount=500.0)
    for consumer in still_on_old_field:
        try:
            read_as_old(premature_record)
        except KeyError as e:
            premature_contract_errors.append((consumer, str(e)))
    assert premature_contract_errors  # the laggard genuinely raises KeyError("amount"): the field is gone

    # migrate the rest, then contract for real only once every consumer reads the new field.
    for consumer in CONSUMERS:
        migrated[consumer] = True
    assert all(migrated.values())

    final_record = produce_contract(order_id=100, amount=600.0)
    safe_contract_errors = []
    for consumer in CONSUMERS:
        try:
            read_as_new(final_record)
        except KeyError as e:
            safe_contract_errors.append((consumer, str(e)))
    assert safe_contract_errors == []

    return {
        "dual_write_window_ticks": window_ticks,
        "errors_during_dual_write": errors_during_dual_write,
        "premature_contract_would_break": [c for c, _ in premature_contract_errors],
        "safe_contract_errors": safe_contract_errors,
    }


def verify_confluent_backward_definition() -> dict:
    text = " ".join((SOURCES_DIR / "confluent-schema-evolution.txt").read_text().split())
    quote = "BACKWARD compatibility means that consumers using the new schema can read data produced with the last schema."
    assert quote in text, "quote not found verbatim in fetched source"
    return {"claim": "BACKWARD compatibility: new-schema consumers can read data produced with the last schema", "quote": quote}


def verify_confluent_forward_definition() -> dict:
    text = " ".join((SOURCES_DIR / "confluent-schema-evolution.txt").read_text().split())
    quote = (
        "FORWARD compatibility means that data produced with a new schema can be read by "
        "consumers using the last schema, even though they may not be able to use the full "
        "capabilities of the new schema."
    )
    assert quote in text, "quote not found verbatim in fetched source"
    return {"claim": "FORWARD compatibility: old-schema consumers can still read data produced with the new schema", "quote": quote}


def verify_confluent_full_definition() -> dict:
    text = " ".join((SOURCES_DIR / "confluent-schema-evolution.txt").read_text().split())
    quote = "FULL compatibility means schemas are both backward and forward compatible."
    assert quote in text, "quote not found verbatim in fetched source"
    return {"claim": "FULL compatibility means both backward and forward hold at once", "quote": quote}


def verify_fowler_parallel_change() -> dict:
    text = re.sub(r"\s+([,.;:])", r"\1", " ".join((SOURCES_DIR / "fowler-parallel-change.txt").read_text().split()))
    quote = (
        "Parallel change, also known as expand and contract, is a pattern to implement "
        "backward-incompatible changes to an interface in a safe manner, by breaking the "
        "change into three distinct phases: expand, migrate, and contract."
    )
    assert quote in text, "quote not found verbatim in fetched source"
    return {"claim": "expand and contract breaks a breaking change into three distinct phases", "quote": quote}


if __name__ == "__main__":
    modes = check_compatibility_modes()
    print(f"Expand step compatibility: {modes['expand']}")
    print(f"Contracting straight from the expand schema (skipping migrate): {modes['contract_before_migrate']}")
    print("-> forward compatibility fails exactly because a consumer still on the old field can't read it.")

    rollout = run_expand_migrate_contract_rollout()
    print()
    print(f"Dual-write window: {rollout['dual_write_window_ticks']} ticks (bound: {MAX_DUAL_WRITE_WINDOW_TICKS})")
    print(f"Errors while every consumer worked through dual-write: {rollout['errors_during_dual_write']}")
    print(f"Consumers a premature contract would have broken: {rollout['premature_contract_would_break']}")
    print(f"Errors after a real, fully-migrated contract: {rollout['safe_contract_errors']}")

    print()
    for fn in (
        verify_confluent_backward_definition,
        verify_confluent_forward_definition,
        verify_confluent_full_definition,
        verify_fowler_parallel_change,
    ):
        r = fn()
        print(f"Sourced: {r['claim']}")

    print()
    print("OK: expand kept every consumer working, a premature contract genuinely broke the laggard, "
          "and the real rollout only contracted once every consumer had migrated.")
