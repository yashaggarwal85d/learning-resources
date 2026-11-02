"""Toy barrier-sweep model: a checkpoint barrier injected behind an in-flight backlog on one
channel, compared under aligned (wait for the barrier, drain the backlog first) and unaligned
(snapshot on first sight, absorb the backlog into the snapshot) checkpointing; and an incremental
vs full checkpoint-cost comparison across several rounds of growing state.
"""


def aligned_checkpoint_duration(backlog, drain_rate, base_overhead):
    """Aligned: the operator must finish everything ahead of the barrier on this channel (the
    backlog) before it can snapshot and forward the barrier, so duration grows with the backlog
    this channel happened to be carrying when the checkpoint was triggered."""
    drain_ticks = -(-backlog // drain_rate)  # ceiling division
    return drain_ticks + base_overhead


def unaligned_checkpoint_duration(base_overhead):
    """Unaligned: the operator snapshots the moment it sees the barrier, folding whatever backlog
    is still in flight into the snapshot itself instead of waiting for it to drain first —
    duration is just the fixed snapshotting overhead, independent of the backlog."""
    return base_overhead


def unaligned_snapshot_size(backlog, per_record_bytes, base_bytes):
    """What unaligned checkpointing trades for that independence: the in-flight backlog becomes
    part of the recorded snapshot, so the snapshot itself grows with the backlog."""
    return base_bytes + backlog * per_record_bytes


def run_incremental_checkpoints(num_rounds, growth_per_round, full_state_seed=0):
    """`num_rounds` successive checkpoints of a state that keeps growing by `growth_per_round`
    each round. A full checkpoint always copies the whole accumulated state; an incremental
    checkpoint only ever copies the diff since the previous checkpoint, so its cost is bounded by
    that round's growth, not by how much history has piled up."""
    full_state = full_state_seed
    rounds = []
    for _ in range(num_rounds):
        full_state += growth_per_round
        full_cost = full_state
        incremental_cost = growth_per_round
        rounds.append((full_cost, incremental_cost))
    return rounds


if __name__ == "__main__":
    drain_rate, base_overhead = 2, 1

    no_backpressure_aligned = aligned_checkpoint_duration(backlog=0, drain_rate=drain_rate, base_overhead=base_overhead)
    no_backpressure_unaligned = unaligned_checkpoint_duration(base_overhead=base_overhead)
    assert no_backpressure_aligned == no_backpressure_unaligned, (
        "with no backlog at all, aligned and unaligned should cost the same fixed overhead, got "
        f"{no_backpressure_aligned} vs {no_backpressure_unaligned}"
    )
    print(f"no backpressure: aligned duration {no_backpressure_aligned}, unaligned duration "
          f"{no_backpressure_unaligned} (equal — nothing to drain either way)")

    heavy_backlog = 40
    backpressure_aligned = aligned_checkpoint_duration(backlog=heavy_backlog, drain_rate=drain_rate, base_overhead=base_overhead)
    backpressure_unaligned = unaligned_checkpoint_duration(base_overhead=base_overhead)
    assert backpressure_aligned > 10 * backpressure_unaligned, (
        "under heavy backlog, aligned duration should dwarf unaligned duration, got "
        f"{backpressure_aligned} vs {backpressure_unaligned}"
    )
    print(f"heavy backpressure (backlog={heavy_backlog}): aligned duration {backpressure_aligned}, "
          f"unaligned duration {backpressure_unaligned} ({backpressure_aligned / backpressure_unaligned:.1f}x)")

    per_record_bytes, base_bytes = 3, 5
    small_snapshot = unaligned_snapshot_size(backlog=0, per_record_bytes=per_record_bytes, base_bytes=base_bytes)
    large_snapshot = unaligned_snapshot_size(backlog=heavy_backlog, per_record_bytes=per_record_bytes, base_bytes=base_bytes)
    assert large_snapshot > small_snapshot, "a bigger backlog must produce a bigger unaligned snapshot"
    print(f"unaligned snapshot size: {small_snapshot} bytes with no backlog, {large_snapshot} bytes "
          f"absorbing the heavy backlog — the price paid for the duration independence above")

    rounds = run_incremental_checkpoints(num_rounds=6, growth_per_round=10, full_state_seed=0)
    full_costs = [r[0] for r in rounds]
    incremental_costs = [r[1] for r in rounds]
    assert full_costs == sorted(full_costs), "full-checkpoint cost must keep growing round over round"
    assert full_costs[-1] > 5 * full_costs[0], (
        f"full-checkpoint cost should grow substantially over {len(rounds)} rounds, got {full_costs}"
    )
    assert len(set(incremental_costs)) == 1, (
        f"incremental-checkpoint cost should stay flat round over round, got {incremental_costs}"
    )
    assert incremental_costs[0] == incremental_costs[-1] == rounds[0][1], "incremental cost must equal the per-round delta, nothing more"
    print(f"full-checkpoint cost over {len(rounds)} rounds: {full_costs} (keeps growing); "
          f"incremental-checkpoint cost each round: {incremental_costs} (bounded by the delta, flat)")

    print("all checks passed")
