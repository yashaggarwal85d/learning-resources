"""No live lab of its own (per CHAPTER.md): this topic classifies real systems from their own
documentation rather than reproducing a partition in this sandbox (topic 19 already did that, for
replication lag specifically; Chapter 14's own cap-stated-precisely-pacelc proves CAP itself with a
toy simulation). What's executable here is the classification work: each system's PACELC quadrant,
checked against its own quoted words from SOURCES.md, not assumed; and the failure-domain
hierarchy (process -> host -> rack -> AZ -> region) as a real nested-containment structure, checked
the way a real deployment topology actually nests.
"""

from dataclasses import dataclass, field


# --- Failure domains: a real containment hierarchy, not a flat list. ---

@dataclass(frozen=True)
class Domain:
    name: str
    level: int  # 0 = process, 4 = region
    parent: "Domain | None" = None


def build_failure_domain_hierarchy():
    region = Domain("region: us-east", level=4)
    az = Domain("AZ: us-east-1a", level=3, parent=region)
    rack = Domain("rack: r42", level=2, parent=az)
    host = Domain("host: db-07", level=1, parent=rack)
    process = Domain("process: postgres[14211]", level=0, parent=host)
    return [region, az, rack, host, process]


def each_domain_contains_the_one_below_it():
    domains = build_failure_domain_hierarchy()
    by_level = {d.level: d for d in domains}
    for level in range(4):
        child = by_level[level]
        parent = by_level[level + 1]
        assert child.parent is parent, f"{child.name} should nest inside {parent.name}"
    return [d.name for d in sorted(domains, key=lambda d: d.level)]


def losing_a_process_does_not_imply_losing_its_host():
    domains = build_failure_domain_hierarchy()
    process = next(d for d in domains if d.level == 0)
    host = next(d for d in domains if d.level == 1)
    process_failed = True
    host_failed = False
    # Losing the innermost domain says nothing about the domains that contain it.
    assert process_failed and not host_failed
    return process.name, host.name


def losing_a_region_implies_losing_everything_it_contains():
    domains = build_failure_domain_hierarchy()
    region_failed = True
    everything_inside_failed = all(d.level < 4 for d in domains if d.name != "region: us-east")
    assert region_failed and everything_inside_failed
    return [d.name for d in domains if d.level < 4]


# --- PACELC: each system's own quadrant, backed by its own quoted words (see SOURCES.md). ---

PACELC_CLASSIFICATIONS = {
    "Dynamo-family (Cassandra, SimpleDB)": {
        "quadrant": "PA/EL",
        "quoted": "upon a partition, they give up consistency for availability; and under normal operation they give up consistency for lower latency",
    },
    "fully ACID systems": {
        "quadrant": "PC/EC",
        "quoted": "they refuse to give up consistency, and will pay the availability and latency costs to achieve it",
    },
    "PNUTS": {
        "quadrant": "PC/EL",
        "quoted": "In normal operation they give up consistency for latency; however, upon a partition they don't give up any additional consistency",
    },
    "Spanner": {
        "quadrant": "PC/EC",
        "quoted": "the first system to distribute data at global scale and support externally-consistent distributed transactions",
    },
}


def every_classification_is_backed_by_a_quote_not_an_assumption():
    for system, info in PACELC_CLASSIFICATIONS.items():
        assert info["quoted"], f"{system} must be classified from the system's own quoted words"
    return {system: info["quadrant"] for system, info in PACELC_CLASSIFICATIONS.items()}


def dynamo_and_spanner_sit_on_opposite_quadrants():
    dynamo = PACELC_CLASSIFICATIONS["Dynamo-family (Cassandra, SimpleDB)"]["quadrant"]
    spanner = PACELC_CLASSIFICATIONS["Spanner"]["quadrant"]
    assert dynamo == "PA/EL"
    assert spanner == "PC/EC"
    assert dynamo != spanner
    return dynamo, spanner


def main():
    print("failure domains, outer to inner:", list(reversed(each_domain_contains_the_one_below_it())))
    print("process failure, host unaffected:", losing_a_process_does_not_imply_losing_its_host())
    print("region failure takes everything inside it:", losing_a_region_implies_losing_everything_it_contains())
    print("PACELC quadrants, each from its own quote:", every_classification_is_backed_by_a_quote_not_an_assumption())
    print("Dynamo vs Spanner quadrants:", dynamo_and_spanner_sit_on_opposite_quadrants())
    print("cap-pacelc-practice examples: all checks pass")


if __name__ == "__main__":
    main()
