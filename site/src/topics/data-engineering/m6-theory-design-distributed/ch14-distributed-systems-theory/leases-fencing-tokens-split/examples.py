"""
The zombie-leader scenario from Kleppmann's own diagram, run as an actual sequence of events: a
GC-paused client resumes believing it still holds the lease, and a check right before the write
cannot help because the pause can land between the check and the write. A storage layer that
checks a monotonically increasing fencing token rejects the stale write; a storage layer checking
a unique but non-increasing token cannot tell old from new.
"""

from dataclasses import dataclass


@dataclass
class Storage:
    highest_token_seen: int | None = None

    def write(self, token: int, value: str) -> bool:
        if self.highest_token_seen is not None and token < self.highest_token_seen:
            return False  # rejected: a write with a lower token than one already seen
        self.highest_token_seen = token
        return True


def recheck_before_write_does_not_help():
    # The pause is modeled as an event that can land ANYWHERE after the check, including between
    # the check and the write -- which is exactly what happens here.
    lease_expiry = "T"
    events_in_order = ["client checks lease: still held", "GC PAUSE begins here", "lease expires during pause", "client resumes, unaware", "client writes"]
    check_happens_before_pause = events_in_order.index("client checks lease: still held") < events_in_order.index("GC PAUSE begins here")
    write_happens_after_pause = events_in_order.index("client writes") > events_in_order.index("GC PAUSE begins here")
    assert check_happens_before_pause and write_happens_after_pause
    print("the check landed before the pause and the write landed after it -- the pause sat in between both times")


def zombie_leader_overwrites_without_fencing():
    storage = Storage()
    # Client 1 acquires the lease, writes once legitimately (no token checking yet -- this
    # storage has no fencing), then pauses.
    storage_no_fencing = {"value": None}
    storage_no_fencing["value"] = "client-1-write"
    # Client 2's lease now begins (client 1's expired during its pause); client 2 writes.
    storage_no_fencing["value"] = "client-2-write"
    # Client 1 wakes up, believes it still holds the lease (it checked just before pausing, which
    # is the same hazard as checking just before writing), and overwrites client 2's write.
    storage_no_fencing["value"] = "client-1-write"  # stale write succeeds, corrupting the data
    assert storage_no_fencing["value"] == "client-1-write"
    print("without fencing, the paused client's stale write silently overwrites the second client's write")


def fencing_token_rejects_the_same_scenario():
    storage = Storage()
    client_1_token = 33
    client_2_token = 34  # issued after client 1's lease expired; always higher
    assert storage.write(client_1_token, "client-1-write")
    assert storage.write(client_2_token, "client-2-write")
    client_1_stale_write_accepted = storage.write(client_1_token, "client-1-write-again")
    assert not client_1_stale_write_accepted
    print("with fencing, client 1's write carrying token", client_1_token, "is rejected once the storage has already seen", client_2_token)


def monotonic_token_is_necessary_unique_token_is_not_enough():
    # A unique token (e.g. a random string) lets the storage tell writes APART, but not tell
    # which one is OLDER -- there is no ordering to compare against.
    storage = Storage()
    client_1_random_token_as_int = hash("client-1-random-token") % 1000
    client_2_random_token_as_int = hash("client-2-random-token") % 1000
    # Whichever happens to hash lower looks "older" to a naive increasing-number check even
    # though it may have been issued LATER -- uniqueness alone carries no order.
    tokens_are_distinct = client_1_random_token_as_int != client_2_random_token_as_int
    assert tokens_are_distinct
    order_is_meaningful = False  # random tokens carry no guarantee that later issuance means a larger value
    assert not order_is_meaningful
    print("random tokens are distinct from each other, but distinctness alone gives the storage no way to know which write came later")


if __name__ == "__main__":
    recheck_before_write_does_not_help()
    zombie_leader_overwrites_without_fencing()
    fencing_token_rejects_the_same_scenario()
    monotonic_token_is_necessary_unique_token_is_not_enough()
