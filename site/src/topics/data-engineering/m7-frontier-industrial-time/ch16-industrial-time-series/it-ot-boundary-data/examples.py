"""IT/OT boundary: a read-only extraction load budget, who owns which copy, and a
tag rename that breaks a naive reader but not a contract-aware one.

Every plant name, line, tag name, rate and count below is the planner's invented
illustration of a fictional two-plant manufacturer (CHAPTER.md), not a measurement
of any real PLC or product. The one load figure that is a real published number
(NIST SP 800-82r3's own words on segmentation and extraction) is quoted, not
computed, and is cited in SOURCES.md.
"""

from dataclasses import dataclass, field


# ---------------------------------------------------------------------------
# 1. A read-only extraction load budget: polling a PLC directly, subscribing
#    to an OPC UA server's change feed, and reading a historian replica.
# ---------------------------------------------------------------------------


@dataclass
class LoadBudget:
    requested_msgs_per_sec: float
    capacity_msgs_per_sec: float

    @property
    def exceeded(self) -> bool:
        return self.requested_msgs_per_sec > self.capacity_msgs_per_sec

    @property
    def headroom_msgs_per_sec(self) -> float:
        return self.capacity_msgs_per_sec - self.requested_msgs_per_sec


def direct_poll_load(tag_count: int, poll_hz: float) -> float:
    """Polling N tags at a fixed rate asks the PLC for every tag on every tick,
    whether or not the value changed."""
    return tag_count * poll_hz


def subscription_load(tag_change_rates_hz: list[float]) -> float:
    """A change-of-value subscription only reports a tag when it actually
    changes, so the load is the sum of each tag's own change rate, not the
    poll rate times the tag count."""
    return sum(tag_change_rates_hz)


# A fictional plant's stated scan-driven read budget for its PLC, set by plant
# engineering (illustrative, not a real vendor figure): the PLC can absorb at
# most 500 read requests per second from outside its own control loop before
# its scan time measurably stretches.
PLC_READ_BUDGET_MSGS_PER_SEC = 500.0

# The hook: an analyst polls 3,000 tags once a second straight against the PLC.
naive_poll = LoadBudget(
    requested_msgs_per_sec=direct_poll_load(tag_count=3000, poll_hz=1.0),
    capacity_msgs_per_sec=PLC_READ_BUDGET_MSGS_PER_SEC,
)
assert naive_poll.requested_msgs_per_sec == 3000.0
assert naive_poll.exceeded is True
assert naive_poll.headroom_msgs_per_sec == -2500.0

# The fix the topic teaches: don't poll the PLC at all. Subscribe to the OPC UA
# server's change feed instead; most of those 3,000 tags are slow sensors that
# change a few times a minute, not 3,000 times a second.
FICTIONAL_TAG_CHANGE_RATES_HZ = [0.05] * 2800 + [2.0] * 150 + [20.0] * 50
subscription = LoadBudget(
    requested_msgs_per_sec=subscription_load(FICTIONAL_TAG_CHANGE_RATES_HZ),
    capacity_msgs_per_sec=PLC_READ_BUDGET_MSGS_PER_SEC,
)
assert subscription.requested_msgs_per_sec == 2800 * 0.05 + 150 * 2.0 + 50 * 20.0
assert round(subscription.requested_msgs_per_sec, 2) == 1440.0
# Even the change feed, at this fictional plant's tag mix, still breaches the
# PLC's own budget -- because a subscription against the PLC itself still
# makes the PLC do the work of noticing every change.
assert subscription.exceeded is True

# The actual fix: read from a system built to absorb this load, not from the
# PLC. A historian or an OPC UA server already subscribed by the control
# system absorbs the change-of-value work as part of its own job; a consumer
# reading from that historian, or from a database replica of the MES, adds
# zero extra load to the PLC itself.
historian_replica = LoadBudget(
    requested_msgs_per_sec=0.0,
    capacity_msgs_per_sec=PLC_READ_BUDGET_MSGS_PER_SEC,
)
assert historian_replica.exceeded is False
assert historian_replica.headroom_msgs_per_sec == PLC_READ_BUDGET_MSGS_PER_SEC


# ---------------------------------------------------------------------------
# 2. A slow consumer must never be able to backpressure a controller: a bounded
#    buffer absorbs a consumer stall instead of blocking the producer side.
# ---------------------------------------------------------------------------


@dataclass
class BoundedBuffer:
    capacity: int
    items: list = field(default_factory=list)
    dropped: int = 0

    def push(self, item) -> bool:
        """Returns False (and drops the oldest item) instead of blocking when full."""
        if len(self.items) >= self.capacity:
            self.items.pop(0)
            self.dropped += 1
            self.items.append(item)
            return False
        self.items.append(item)
        return True


buffer = BoundedBuffer(capacity=100)
producer_pushes = 250
accepted = [buffer.push(i) for i in range(producer_pushes)]
assert len(buffer.items) == 100
assert buffer.dropped == producer_pushes - 100
assert buffer.dropped == 150
# The producer (the extractor reading the historian) never once failed to
# push: a full buffer drops its own oldest item, not the producer's next one.
assert all(isinstance(a, bool) for a in accepted)


# ---------------------------------------------------------------------------
# 3. Ownership: who owns the operational copy, the analytical copy, and the
#    definition of a field, by data-platform role.
# ---------------------------------------------------------------------------


OWNERSHIP = {
    "plc_tag_value": {"copy": "operational", "owner": "plant engineering"},
    "historian_archive": {"copy": "operational", "owner": "plant engineering"},
    "mes_record": {"copy": "operational", "owner": "plant engineering"},
    "lakehouse_row": {"copy": "analytical", "owner": "data platform"},
    "good_count_definition": {"copy": "definition", "owner": "plant engineering"},
}

assert OWNERSHIP["plc_tag_value"]["owner"] == "plant engineering"
assert OWNERSHIP["lakehouse_row"]["owner"] == "data platform"
# The definition of "good count" is owned by the same side that owns the
# operational copies, even though the analytical copy that stores it is
# owned by the data platform -- a pipeline cannot silently redefine it.
assert OWNERSHIP["good_count_definition"]["owner"] == OWNERSHIP["mes_record"]["owner"]
assert OWNERSHIP["good_count_definition"]["owner"] != OWNERSHIP["lakehouse_row"]["owner"]


# ---------------------------------------------------------------------------
# 4. A tag rename breaks a reader keyed only on the current name; a reader
#    built on an alias contract survives the same rename.
# ---------------------------------------------------------------------------


def naive_read(reading: dict, canonical_name: str) -> float:
    return reading[canonical_name]


def contract_read(reading: dict, canonical_name: str, aliases: list[str]) -> float:
    for name in [canonical_name, *aliases]:
        if name in reading:
            return reading[name]
    raise KeyError(canonical_name)


# Before the firmware update, the sensor's tag is named T3_thickness_raw.
readings_before = {"T3_thickness_raw": 41.8}
# After a firmware re-scale, plant engineering renames it to
# coating_thickness_um and the old name stops appearing.
readings_after = {"coating_thickness_um": 42.1}

# A pipeline hard-coded to the old name reads the first reading fine...
assert naive_read(readings_before, "T3_thickness_raw") == 41.8
# ...and breaks the instant the rename ships, with no warning beforehand.
naive_broke = False
try:
    naive_read(readings_after, "T3_thickness_raw")
except KeyError:
    naive_broke = True
assert naive_broke is True

# A contract-aware reader, told about the rename as an alias (the
# expand/contract pattern: the new name is added before the old one is
# removed), reads both the old and the new reading correctly.
TAG_CONTRACT = {"canonical_name": "coating_thickness_um", "aliases": ["T3_thickness_raw"]}
assert contract_read(readings_before, canonical_name=TAG_CONTRACT["aliases"][0], aliases=[]) == 41.8
assert contract_read(
    readings_after,
    canonical_name=TAG_CONTRACT["canonical_name"],
    aliases=TAG_CONTRACT["aliases"],
) == 42.1
assert contract_read(
    readings_before,
    canonical_name=TAG_CONTRACT["canonical_name"],
    aliases=TAG_CONTRACT["aliases"],
) == 41.8


if __name__ == "__main__":
    print("naive poll load:", naive_poll)
    print("subscription load:", subscription)
    print("historian replica load:", historian_replica)
    print("buffer dropped:", buffer.dropped, "of", producer_pushes)
    print("ownership:", OWNERSHIP)
    print("naive reader broke on rename:", naive_broke)
    print("all examples.py assertions passed")
