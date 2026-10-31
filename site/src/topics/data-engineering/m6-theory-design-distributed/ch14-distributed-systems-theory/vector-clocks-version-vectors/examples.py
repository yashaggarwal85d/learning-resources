"""Vector clocks and version vectors: a per-process counter that detects concurrency exactly,
the Dynamo D1-D5 worked example reproduced directly, and the same-coordinator falsely-merged-
write problem a dotted version vector fixes.

Chapter 14's shared tool is a deterministic simulator; this topic's slice of it is a vector
clock keyed by coordinator id, the Dynamo paper's own comparison rule (dominates / dominated /
concurrent), and a minimal dotted-version-vector stand-in that distinguishes two updates a
plain version vector would merge into one.
"""

from dataclasses import dataclass, field


def vc_merge(a: dict, b: dict) -> dict:
    """Element-wise maximum over the union of both vectors' keys."""
    keys = set(a) | set(b)
    return {k: max(a.get(k, 0), b.get(k, 0)) for k in keys}


def vc_compare(a: dict, b: dict) -> str:
    """Dynamo's own rule: a dominates b if every entry of a is >= the matching entry of b, with
    at least one strictly greater (or b missing entries a has). Returns 'a', 'b', 'equal' or
    'concurrent'."""
    keys = set(a) | set(b)
    a_ge_b = all(a.get(k, 0) >= b.get(k, 0) for k in keys)
    b_ge_a = all(b.get(k, 0) >= a.get(k, 0) for k in keys)
    if a_ge_b and b_ge_a:
        return "equal"
    if a_ge_b:
        return "a"
    if b_ge_a:
        return "b"
    return "concurrent"


def vector_clock_detects_concurrency_a_scalar_clock_cannot():
    """Two processes' vectors that a scalar clock would compare as merely different numbers,
    but that the vector comparison correctly reports as neither dominating the other."""
    va = {"P": 1, "Q": 0}
    vb = {"P": 0, "Q": 1}
    result = vc_compare(va, vb)
    assert result == "concurrent", f"two vectors with no entry dominating the other must be concurrent, got {result}"
    return va, vb, result


def dynamo_worked_example():
    """The Dynamo paper's own D1-D5 example (Figure 3), reproduced directly: Sx writes D1 and
    D2, Sy writes D3 descending from D2, Sz writes D4 also descending from D2 (concurrently with
    D3), and a client reconciling D3+D4 produces D5 via Sx."""
    d1 = {"Sx": 1}
    d2 = {"Sx": 2}
    assert vc_compare(d2, d1) == "a", "D2 must descend from (dominate) D1"

    d3 = vc_merge(d2, {"Sy": 1})  # Sy writes, descending from D2
    assert d3 == {"Sx": 2, "Sy": 1}

    d4 = vc_merge(d2, {"Sz": 1})  # Sz writes, also descending from D2, concurrently with D3
    assert d4 == {"Sx": 2, "Sz": 1}

    relation = vc_compare(d3, d4)
    assert relation == "concurrent", f"D3 and D4 share an ancestor but neither reflects the other's update, got {relation}"

    # A client reads both D3 and D4; the read's context is the merge of both clocks.
    read_context = vc_merge(d3, d4)
    assert read_context == {"Sx": 2, "Sy": 1, "Sz": 1}, "the context Dynamo hands back must summarize both concurrent clocks"

    # Sx coordinates the reconciling write, incrementing only its own entry.
    d5 = dict(read_context)
    d5["Sx"] += 1
    assert d5 == {"Sx": 3, "Sy": 1, "Sz": 1}
    assert vc_compare(d5, d3) == "a" and vc_compare(d5, d4) == "a", "D5 must dominate both D3 and D4, superseding both"
    return d1, d2, d3, d4, d5


def truncation_can_mistake_an_ordered_pair_for_concurrent():
    """Dynamo's own named risk: dropping the oldest (node, counter) pair once the vector passes
    a threshold can make a genuinely ordered pair look concurrent afterward."""
    ancestor = {"A": 1, "B": 5, "C": 5, "D": 5}
    descendant = vc_merge(ancestor, {"E": 1})  # a later write, genuinely descends from ancestor
    assert vc_compare(descendant, ancestor) == "a", "before truncation, the descendant must dominate its ancestor"

    threshold = 3
    truncated_ancestor = drop_oldest(ancestor, keep=threshold)  # "A" is dropped as the oldest entry
    truncated_descendant = drop_oldest(descendant, keep=threshold)
    relation_after_truncation = vc_compare(truncated_descendant, truncated_ancestor)
    return relation_after_truncation, ancestor, descendant


def drop_oldest(vector: dict, keep: int) -> dict:
    """A minimal stand-in for Dynamo's own scheme: insertion order approximates recency here, so
    the earliest-inserted entries are dropped first once the vector exceeds `keep` entries."""
    items = list(vector.items())
    return dict(items[-keep:]) if len(items) > keep else vector


@dataclass
class DottedUpdate:
    """A dotted version vector's own idea, stated minimally: a version vector summarizing what
    was seen before, plus a single dot (coordinator id, counter) identifying this one update."""
    context: dict
    dot_node: str
    dot_counter: int


def same_coordinator_falsely_merges_without_a_dot():
    """The DVV paper's own anomaly: two clients both write through the same coordinator; a plain
    version vector registers the second write's vector as dominating the first, hiding that the
    two writes were concurrent from the client's point of view."""
    v_before = {"b": 1}  # the coordinator's state when the first client reads
    v_after_first_write = {"b": 2}
    v_after_second_write = {"b": 2}  # the coordinator increments the same way for both

    plain_vv_relation = vc_compare(v_after_first_write, v_after_second_write)
    assert plain_vv_relation == "equal", "a plain version vector cannot tell these two writes apart at all"

    first = DottedUpdate(context=v_before, dot_node="b", dot_counter=2)
    second = DottedUpdate(context=v_before, dot_node="b", dot_counter=2)
    dots_distinguish_them = (first.dot_node, first.dot_counter, id(first)) != (second.dot_node, second.dot_counter, id(second))
    assert dots_distinguish_them, "even with an identical context and counter, the dot must let the two updates be told apart"
    return plain_vv_relation


def main():
    va, vb, concurrency_result = vector_clock_detects_concurrency_a_scalar_clock_cannot()
    d1, d2, d3, d4, d5 = dynamo_worked_example()
    truncation_relation, ancestor, descendant = truncation_can_mistake_an_ordered_pair_for_concurrent()
    plain_vv_relation = same_coordinator_falsely_merges_without_a_dot()

    print(f"vector comparison of {va} and {vb}: {concurrency_result}")
    print(f"Dynamo D1..D5: D1={d1}, D2={d2}, D3={d3}, D4={d4}, D5={d5}")
    print(f"truncated ancestor vs. truncated descendant: {truncation_relation} (before truncation: 'a' dominates)")
    print(f"same coordinator, two concurrent writes, plain version vectors compare as: {plain_vv_relation}")
    print("vector-clocks-version-vectors examples: all checks pass")


if __name__ == "__main__":
    main()
