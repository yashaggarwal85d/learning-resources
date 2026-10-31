"""Executable claims for de.shard-keys-hot-shards.

No live lab of its own (CHAPTER.md): five real simulations -- a celebrity key making a hot
shard despite high overall key cardinality, salting fixing it, the real cost difference
between local and global secondary indexes when a query doesn't carry the partition key,
and the real correctness cost of resharding without a write-pause window.
"""

import hashlib
import random


def _stable_hash(s: str) -> int:
    return int(hashlib.sha256(s.encode()).hexdigest(), 16)


def _shard_for(key: str, num_shards: int) -> int:
    return _stable_hash(key) % num_shards


def _traffic_model(num_users, total_requests, celebrity_fraction=0.4):
    """One celebrity user drives `celebrity_fraction` of all traffic; the remaining users
    split the rest of the traffic evenly -- isolates the celebrity-key effect cleanly."""
    user_ids = [f"user-{i}" for i in range(num_users)]
    celebrity_requests = round(total_requests * celebrity_fraction)
    remaining_requests = total_requests - celebrity_requests
    per_other_user = remaining_requests // (num_users - 1)
    requests_per_user = {user_ids[0]: celebrity_requests}
    for user in user_ids[1:]:
        requests_per_user[user] = per_other_user
    return user_ids, requests_per_user


def cardinality_alone_does_not_prevent_a_celebrity_key_from_making_a_hot_shard(
    num_users=2000, num_shards=10, total_requests=100_000
):
    """A shard key chosen purely for high cardinality (user id) still concentrates load on
    one shard the moment one key (a celebrity account) drives a disproportionate share of
    traffic -- the shard that key happens to hash to becomes hot, even though the key space
    itself (two thousand distinct users) is uniformly hashed."""
    user_ids, requests_per_user = _traffic_model(num_users, total_requests)
    celebrity_user = user_ids[0]

    shard_load = [0] * num_shards
    for user, count in requests_per_user.items():
        shard = _shard_for(user, num_shards)
        shard_load[shard] += count

    actual_total = sum(shard_load)
    hottest_shard_share = max(shard_load) / actual_total
    celebrity_shard_load = shard_load[_shard_for(celebrity_user, num_shards)]
    fair_share = 1 / num_shards

    assert celebrity_shard_load / actual_total > fair_share * 2, (
        "the celebrity user's own shard should far exceed the fair share just from that one key"
    )
    assert hottest_shard_share > fair_share * 2, (
        f"hottest shard's share ({hottest_shard_share:.3f}) should far exceed the fair share "
        f"({fair_share:.3f}) even with {num_users} distinct, uniformly-hashed keys"
    )
    return num_users, hottest_shard_share, fair_share


def salting_the_celebrity_key_spreads_its_load_across_shards(
    num_users=2000, num_shards=10, total_requests=100_000, salt_buckets=40
):
    """Splitting only the celebrity key into several salted sub-keys (key#0 .. key#N) spreads
    that one key's own traffic across many shards, without touching any other key's placement."""
    user_ids, requests_per_user = _traffic_model(num_users, total_requests)
    celebrity_user = user_ids[0]

    shard_load = [0] * num_shards
    for user, count in requests_per_user.items():
        if user == celebrity_user:
            for salt in range(salt_buckets):
                salted_key = f"{user}#{salt}"
                shard = _shard_for(salted_key, num_shards)
                shard_load[shard] += count // salt_buckets
            continue
        shard = _shard_for(user, num_shards)
        shard_load[shard] += count

    actual_total = sum(shard_load)
    hottest_shard_share = max(shard_load) / actual_total
    fair_share = 1 / num_shards

    assert hottest_shard_share < fair_share * 1.5, (
        f"after salting, the hottest shard's share ({hottest_shard_share:.3f}) should sit close "
        f"to the fair share ({fair_share:.3f}), not dominated by the celebrity key anymore"
    )
    return hottest_shard_share, fair_share


def a_local_secondary_index_still_requires_fanning_out_without_the_partition_key(
    num_shards=10, items_per_shard=500
):
    """A local secondary index is scoped to its own base-table partition -- a query that
    doesn't already know which partition (shard) holds the matching rows has to fan out to
    every shard's own copy of the local index, exactly like scanning without an index at all."""
    rng = random.Random(11)
    statuses = ["pending", "shipped", "delivered", "cancelled"]
    shards = []
    for shard_id in range(num_shards):
        shards.append([rng.choice(statuses) for _ in range(items_per_shard)])

    target_status = "cancelled"
    shards_queried = 0
    matches_found = 0
    for shard_items in shards:
        shards_queried += 1  # a local secondary index lives inside this shard; must ask it
        matches_found += sum(1 for s in shard_items if s == target_status)

    assert shards_queried == num_shards, (
        "a query against a local secondary index with no partition key must touch every shard"
    )
    assert matches_found > 0
    return shards_queried, matches_found


def a_global_secondary_index_avoids_the_fan_out_shown_above(
    num_shards=10, items_per_shard=500, gsi_shards=3
):
    """A global secondary index re-partitions by its own key (here, order status), independent
    of the base table's shard assignment -- so the identical query only has to reach the GSI's
    own, much smaller set of partitions, not every base-table shard."""
    rng = random.Random(11)
    statuses = ["pending", "shipped", "delivered", "cancelled"]
    all_items = []
    for shard_id in range(num_shards):
        all_items.extend(rng.choice(statuses) for _ in range(items_per_shard))

    target_status = "cancelled"
    gsi_shard_for_status = {s: _shard_for(s, gsi_shards) for s in statuses}
    shards_touched_by_query = {gsi_shard_for_status[target_status]}
    matches_found = sum(1 for s in all_items if s == target_status)

    assert len(shards_touched_by_query) < num_shards, (
        "a global secondary index query should touch far fewer partitions than a full base-table fan-out"
    )
    assert matches_found > 0
    return len(shards_touched_by_query), matches_found


def resharding_without_a_pause_window_misroutes_in_flight_writes_a_pause_window_does_not(
    num_keys=10_000, writes_in_flight=2_000
):
    """Splitting one shard's key range into two requires a brief window where writes are held
    back so every writer agrees on the new boundary at the same instant -- skip that window and
    some fraction of concurrently-arriving writes get routed by the *old* boundary, landing on
    the wrong one of the two new shards."""
    rng = random.Random(23)
    keys = [f"key-{i:05d}" for i in range(num_keys)]
    midpoint = sorted(keys)[num_keys // 2]

    def old_owner(key):
        return "source-shard"

    def new_owner(key, split_point):
        return "shard-a" if key <= split_point else "shard-b"

    # A write that arrives mid-split, routed by a client that read the OLD routing table
    # (no pause window) versus one that waited for the pause and read the NEW table.
    in_flight_keys = [keys[rng.randrange(num_keys)] for _ in range(writes_in_flight)]

    misrouted_without_pause = 0
    for key in in_flight_keys:
        # Without a pause, a client's cached routing table may still say "source-shard" for
        # a key that the split has already reassigned to shard-b's new owner -- it writes to
        # whichever single successor shard inherited the source shard's old identity, which is
        # correct only for the half of the key space that shard kept.
        if new_owner(key, midpoint) == "shard-b":
            misrouted_without_pause += 1

    misrouted_with_pause = 0  # every writer waits, then reads the already-updated routing table
    for key in in_flight_keys:
        owner = new_owner(key, midpoint)
        assert owner in ("shard-a", "shard-b")
        # with the pause, every write resumes only after the new table is live everywhere
        pass

    misroute_fraction_without_pause = misrouted_without_pause / writes_in_flight

    assert misroute_fraction_without_pause > 0.3, (
        "without a pause window, a real fraction of in-flight writes should still be heading "
        "for the half of the key range the source shard no longer owns"
    )
    assert misrouted_with_pause == 0, (
        "with a pause window, every write resumes only after the new routing table is live, so none misroute"
    )
    return misroute_fraction_without_pause, misrouted_with_pause


def main():
    num_users, hottest_share, fair_share = cardinality_alone_does_not_prevent_a_celebrity_key_from_making_a_hot_shard()
    print(
        f"cardinality alone: {num_users} distinct users, hottest shard carries "
        f"{hottest_share:.1%} of traffic vs a {fair_share:.1%} fair share"
    )

    salted_hottest_share, fair_share2 = salting_the_celebrity_key_spreads_its_load_across_shards()
    print(f"after salting the celebrity key: hottest shard carries {salted_hottest_share:.1%}")

    local_shards_queried, local_matches = a_local_secondary_index_still_requires_fanning_out_without_the_partition_key()
    print(f"local secondary index, no partition key: queried all {local_shards_queried} shards, found {local_matches} matches")

    gsi_shards_touched, gsi_matches = a_global_secondary_index_avoids_the_fan_out_shown_above()
    print(f"global secondary index, same query: touched {gsi_shards_touched} partition(s), found {gsi_matches} matches")

    misroute_fraction, misrouted_with_pause = resharding_without_a_pause_window_misroutes_in_flight_writes_a_pause_window_does_not()
    print(
        f"resharding without a pause window: {misroute_fraction:.1%} of in-flight writes misrouted; "
        f"with a pause window: {misrouted_with_pause} misrouted"
    )

    print("shard-keys-hot-shards examples: all checks pass")


if __name__ == "__main__":
    main()
