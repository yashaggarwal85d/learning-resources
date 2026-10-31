"""Toy dynamic-table model: a changelog-mode interpreter (append, upsert, retract) run over the
same stream of events, a join-state-cost comparison between a regular join (keeps everything
forever) and an interval join (bounded by a time window), and a materialized-table refresh-mode
chooser driven by a freshness target.
"""


def apply_changelog(events, mode):
    """Replays a stream of (op, key, value) events against a table in the given changelog mode
    and returns the resulting table as a dict of key -> value, plus the list of emitted messages.
    "insert" always adds a new logical row; "update" changes an existing key's value; "delete"
    removes a key. Mirrors what append-only, upsert, and retract streams each actually encode."""
    table = {}
    messages = []
    for op, key, value in events:
        if mode == "append":
            if op != "insert":
                raise ValueError("append-only mode cannot encode update or delete")
            table[key] = value
            messages.append(("insert", key, value))
        elif mode == "upsert":
            if op in ("insert", "update"):
                table[key] = value
                messages.append(("upsert", key, value))
            elif op == "delete":
                del table[key]
                messages.append(("delete", key, None))
        elif mode == "retract":
            if op == "insert":
                table[key] = value
                messages.append(("add", key, value))
            elif op == "update":
                old_value = table[key]
                table[key] = value
                messages.append(("retract", key, old_value))
                messages.append(("add", key, value))
            elif op == "delete":
                old_value = table.pop(key)
                messages.append(("retract", key, old_value))
        else:
            raise ValueError(mode)
    return table, messages


def regular_join_state_size(left_events, right_events):
    """A regular join must keep every row ever seen on both sides, since any future row on
    either side could still match it. State size only grows."""
    sizes = []
    left_state, right_state = [], []
    for l, r in zip(left_events, right_events):
        left_state.append(l)
        right_state.append(r)
        sizes.append(len(left_state) + len(right_state))
    return sizes


def interval_join_state_size(left_events, right_events, window_ticks):
    """An interval join only needs to keep rows within the matching time window of each other;
    rows older than the window age out of state instead of being kept forever."""
    sizes = []
    left_state, right_state = [], []
    for tick, (l, r) in enumerate(zip(left_events, right_events)):
        left_state.append((tick, l))
        right_state.append((tick, r))
        left_state = [(t, v) for t, v in left_state if tick - t <= window_ticks]
        right_state = [(t, v) for t, v in right_state if tick - t <= window_ticks]
        sizes.append(len(left_state) + len(right_state))
    return sizes


def choose_refresh_mode(freshness_minutes, threshold_minutes):
    """A materialized table's refresh mode is inferred from its freshness target: a tight
    target needs a continuously running streaming job, a loose target can be served by a
    periodically triggered batch job instead."""
    return "continuous" if freshness_minutes <= threshold_minutes else "full"


if __name__ == "__main__":
    events = [
        ("insert", "order-1", 100),
        ("insert", "order-2", 50),
        ("update", "order-1", 120),
        ("insert", "order-3", 75),
        ("delete", "order-2", None),
    ]

    append_table, append_messages = apply_changelog(
        [e for e in events if e[0] == "insert"], "append"
    )
    assert append_table == {"order-1": 100, "order-2": 50, "order-3": 75}
    assert all(m[0] == "insert" for m in append_messages)

    upsert_table, upsert_messages = apply_changelog(events, "upsert")
    assert upsert_table == {"order-1": 120, "order-3": 75}
    assert sum(1 for m in upsert_messages if m[0] == "upsert") == 4
    assert sum(1 for m in upsert_messages if m[0] == "delete") == 1

    retract_table, retract_messages = apply_changelog(events, "retract")
    assert retract_table == upsert_table, "retract and upsert modes must agree on the final table"
    retract_count = sum(1 for m in retract_messages if m[0] == "retract")
    add_count = sum(1 for m in retract_messages if m[0] == "add")
    assert retract_count == 2, "one retract for the update, one for the delete"
    assert add_count == 4, "one add per insert, plus one add for the update's new value"
    assert len(retract_messages) > len(upsert_messages), (
        "retract mode must emit more messages than upsert mode for the same changes"
    )
    print(f"append table: {append_table}")
    print(f"upsert table: {upsert_table} via {len(upsert_messages)} messages")
    print(f"retract table: {retract_table} via {len(retract_messages)} messages "
          f"({retract_count} retracts, {add_count} adds)")

    num_ticks = 30
    left_stream = [f"l{i}" for i in range(num_ticks)]
    right_stream = [f"r{i}" for i in range(num_ticks)]
    regular_sizes = regular_join_state_size(left_stream, right_stream)
    interval_sizes = interval_join_state_size(left_stream, right_stream, window_ticks=5)
    assert regular_sizes[-1] > interval_sizes[-1], "regular join state must exceed interval join state eventually"
    assert regular_sizes == sorted(regular_sizes), "regular join state must never shrink"
    assert max(interval_sizes) < max(regular_sizes), "interval join must stay bounded below regular join's growth"
    assert interval_sizes[-5:] == interval_sizes[-6:-1], "interval join state must plateau once the window is full"
    print(f"after {num_ticks} ticks: regular join state size {regular_sizes[-1]}, "
          f"interval join state size {interval_sizes[-1]} (plateaued, bounded by the window)")

    tight_mode = choose_refresh_mode(freshness_minutes=2, threshold_minutes=10)
    loose_mode = choose_refresh_mode(freshness_minutes=60, threshold_minutes=10)
    assert tight_mode == "continuous"
    assert loose_mode == "full"
    print(f"a tight freshness target chooses '{tight_mode}' refresh; "
          f"a loose one chooses '{loose_mode}' refresh")

    print("all checks passed")
