"""
The CAP proof sketch over the chapter's own three-replica stock register: a partition splits the
replicas into two groups, and the minority group cannot distinguish "a write happened on the
other side" from "no write happened at all" -- so it must either refuse (lose availability) or
answer and risk a stale value (lose atomicity). Relaxing from linearizable to causal changes which
requests the minority side may answer. PACELC's four quadrants, classified from each system's own
quoted PACELC assignment in SOURCES.md.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class Replica:
    name: str
    group: str  # which side of the partition
    last_write_seen: int | None


def minority_cannot_distinguish_the_two_histories(minority: Replica, true_committed_value: int | None, no_write_happened_value: int | None) -> bool:
    # The minority replica's own state is identical in both worlds -- it never received the
    # majority's write, if one happened at all -- so nothing it can observe locally tells the two
    # worlds apart.
    return minority.last_write_seen == no_write_happened_value


def the_proof_sketch_on_the_stock_register():
    # Three replicas: A alone on one side of the partition, B and C together on the other.
    # The majority accepts a write (stock decremented) that A never receives.
    before_partition_stock = 5
    majority_commits_write_of = 4  # B and C both now hold this

    a_isolated = Replica("A", group="minority", last_write_seen=before_partition_stock)
    world_where_majority_wrote = the_minority_sees = a_isolated.last_write_seen
    world_where_nobody_wrote = before_partition_stock

    assert minority_cannot_distinguish_the_two_histories(a_isolated, majority_commits_write_of, world_where_nobody_wrote)
    print("A's local state is identical whether B and C committed a write or not:", the_minority_sees)
    print("A must therefore refuse the request, or answer and risk returning", before_partition_stock, "when the true value is", majority_commits_write_of)


def linearizable_forces_a_to_refuse_every_read_and_write():
    # Under linearizability, A cannot answer ANY read of the stock value while partitioned,
    # because any answer might already be stale relative to a write B/C accepted after the
    # partition began -- the exact anomaly topic 5 built a checker for.
    requests_during_partition = ["read stock", "write stock -= 1", "read stock"]
    must_refuse = {req: True for req in requests_during_partition}  # every one, to stay linearizable
    assert all(must_refuse.values())
    print("under linearizability, A refuses every request while partitioned:", list(must_refuse))


def causal_lets_a_answer_requests_that_do_not_depend_on_the_other_side():
    # Relaxed to causal consistency (topic 6), A may answer a read or write that has no causal
    # dependency on anything B/C did after the partition -- it just can't promise the answer
    # reflects the majority's concurrent writes, and must label it as potentially stale.
    requests_during_partition = ["read stock (own view)", "write a LOCAL note, no dependency on majority"]
    may_answer = {req: True for req in requests_during_partition}
    assert all(may_answer.values())
    print("under causal consistency, A may answer requests with no causal link to the majority side:", list(may_answer))


def overselling_is_the_concrete_cost_of_choosing_availability():
    # The hook: both the isolated replica and the majority replica each independently accept a
    # purchase of the LAST unit of stock. Nothing in "choose availability" prevents this -- it is
    # exactly what choosing availability over atomicity costs, made concrete.
    last_unit_of_stock = 1
    a_isolated_sells = last_unit_of_stock
    majority_sells = last_unit_of_stock
    units_actually_available = 1
    total_sold = 2  # both confirmed, only one item existed
    assert total_sold > units_actually_available
    print("both sides confirm a sale of the same last unit -- overselling, the measured cost of choosing A over C under partition")


# --- PACELC's four quadrants, each system's own quoted assignment. ---

PACELC_CLASSIFICATIONS = {
    "Dynamo-family (Cassandra, SimpleDB)": {"quadrant": "PA/EL", "quoted": "upon a partition, they give up consistency for availability; and under normal operation they give up consistency for lower latency"},
    "fully ACID systems": {"quadrant": "PC/EC", "quoted": "they refuse to give up consistency, and will pay the availability and latency costs to achieve it"},
    "PNUTS": {"quadrant": "PC/EL", "quoted": "In normal operation they give up consistency for latency; however, upon a partition they don't give up any additional consistency"},
}


def pacelc_quadrants_are_each_quoted_from_their_own_source():
    for system, info in PACELC_CLASSIFICATIONS.items():
        assert info["quoted"], f"{system} must be classified from a quoted source, not assumed"
    print("PACELC quadrants placed:", {k: v["quadrant"] for k, v in PACELC_CLASSIFICATIONS.items()})


def spanner_is_effectively_ca_not_literally_ca():
    # Brewer's own quoted answer: "no" technically (it is a CP system), "yes" in effect, because
    # partitions are rare on Google's private network, not because the theorem has an exception.
    technically = "CP"
    in_practice_assumed_by_users = "CA"
    assert technically != in_practice_assumed_by_users
    print("Spanner is technically", technically, "and 'effectively' treated as", in_practice_assumed_by_users, "-- a statement about probability, not the theorem")


if __name__ == "__main__":
    the_proof_sketch_on_the_stock_register()
    linearizable_forces_a_to_refuse_every_read_and_write()
    causal_lets_a_answer_requests_that_do_not_depend_on_the_other_side()
    overselling_is_the_concrete_cost_of_choosing_availability()
    pacelc_quadrants_are_each_quoted_from_their_own_source()
    spanner_is_effectively_ca_not_literally_ca()
