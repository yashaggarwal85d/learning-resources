"""de.design-docs-rfcs-adrs — executable evidence.

This chapter has no system under test (CHAPTER.md's "Engine of record"): its lab is a written
artifact, not a measured number. This file builds the shop's own design doc (five sections,
checked structurally) and a Nygard-style four-part ADR for the medium-tier decision from topics 1
and 2, then demonstrates the superseded-not-deleted convention by writing a second ADR that
reverses the first, checking that the first ADR is marked superseded rather than removed.
"""

DESIGN_DOC_SECTIONS = ["context", "goals_and_non_goals", "alternatives", "estimates", "risks"]

DESIGN_DOC = {
    "context": (
        "Plant operations asked for real-time dashboards across every plant; topic 1 priced "
        "three SLO tiers for that request, and topic 2 recommended the medium tier in business "
        "terms. This doc records the design behind that recommendation before it is built."
    ),
    "goals_and_non_goals": {
        "goals": ["sixty-minute freshness for every plant dashboard", "a single shared pipeline across plants"],
        "non_goals": [
            # a non-goal is a deliberate exclusion, not a negated goal: the team could still get
            # sub-minute freshness as a side effect of a future change without violating this doc
            "sub-minute freshness (deliberately not a goal of this design; may still occur incidentally)",
            "per-plant custom pipelines (deliberately excluded to keep one shared pipeline)",
        ],
    },
    "alternatives": [
        {"option": "fast tier", "rejected_because": "cost and risk profile from topic 2's own business-terms comparison"},
        {"option": "slow tier", "rejected_because": "staleness risk too high for plant-manager decisions, per topic 2"},
    ],
    "estimates": {"build_weeks": 3, "migration_weeks": 1},
    "risks": [
        "the shared pipeline becomes a single point of failure for every plant at once",
        "a future plant onboarding may need a freshness tier this design doesn't cover",
    ],
}

ADR_FIELDS = ["context", "decision", "status", "consequences"]


def make_adr(number, context, decision, status, consequences, supersedes=None):
    adr = {
        "number": number,
        "context": context,
        "decision": decision,
        "status": status,
        "consequences": consequences,
    }
    if supersedes:
        adr["supersedes"] = supersedes
    return adr


def check_design_doc(doc):
    missing = [s for s in DESIGN_DOC_SECTIONS if s not in doc or not doc[s]]
    return missing


def check_adr(adr):
    missing = [f for f in ADR_FIELDS if f not in adr or not adr[f]]
    return missing


def supersede(adrs, old_number, new_adr):
    """Marks an old ADR's status as superseded rather than removing it from the record."""
    for adr in adrs:
        if adr["number"] == old_number:
            adr["status"] = f"superseded by ADR-{new_adr['number']}"
    new_adr["supersedes"] = old_number
    adrs.append(new_adr)
    return adrs


def run():
    missing = check_design_doc(DESIGN_DOC)
    print(f"Design doc sections present: {DESIGN_DOC_SECTIONS}")
    print(f"Missing sections: {missing}")
    assert missing == []
    assert len(DESIGN_DOC["goals_and_non_goals"]["non_goals"]) >= 2
    assert len(DESIGN_DOC["alternatives"]) >= 2

    adr_1 = make_adr(
        number=1,
        context="Plant dashboards need one shared freshness tier; fast, medium and slow tiers were priced and compared.",
        decision="We will use the medium freshness tier as the single shared tier for all plant dashboards.",
        status="accepted",
        consequences=["lower cost than the fast tier", "higher staleness risk than the fast tier, mitigated by the non-goal on sub-minute freshness"],
    )
    missing_adr = check_adr(adr_1)
    print(f"\nADR-1 fields present: {ADR_FIELDS}")
    assert missing_adr == []

    adrs = [adr_1]
    adr_2 = make_adr(
        number=2,
        context="A new plant type needs sub-minute alerts the medium tier's own non-goal excluded.",
        decision="We will add a fast-tier path for alert-only plants, keeping the medium tier as the default.",
        status="accepted",
        consequences=["two tiers to operate instead of one", "ADR-1's own single-shared-tier decision no longer holds for alert-only plants"],
    )
    adrs = supersede(adrs, old_number=1, new_adr=adr_2)

    print(f"\nAfter superseding: {[(a['number'], a['status']) for a in adrs]}")
    # ADR-1 is still present (not deleted) and its own status names its replacement
    assert len(adrs) == 2
    assert adrs[0]["number"] == 1
    assert adrs[0]["status"] == "superseded by ADR-2"
    assert adrs[1]["supersedes"] == 1


if __name__ == "__main__":
    run()
