# This topic's engine of record is the SLO derivation itself (CHAPTER.md: "an estimate sheet
# and a simulator, not a cluster" — here, before any estimate exists, the derivation of the
# requirements an estimate will later serve). Every number on screen in the reel is asserted here.
#
# The scenario: the shop's head of marketing asks for "real-time, accurate revenue on the
# executive dashboard." Engineering and finance both meet their own reading of that sentence and
# still disagree by two percent at the first board meeting. The five questions below are the
# fixed habit (SOURCES.md §1-2) that would have caught the gap before either team wrote code.

ASK = "real-time, accurate revenue on the executive dashboard"

# --- Five questions that turn an adjective into a number -------------------------------------
# Resolved for this ask, reasoned from its actual consequence (a board reviews the number, acts
# on it that same business day, and would lose confidence in it if it moved after being reported).
FIVE_QUESTIONS = {
    "for_whom": "the board, reviewing the number live in the meeting",
    "measured_where": "the dashboard's own displayed total, not an upstream job's internal state",
    "percentile": "p100 of the displayed value at read time (a dashboard shows one number, not a distribution)",
    "window_minutes": 15,  # smaller than the shortest gap between a data change and a board glance
    "consequence_on_miss": "the board acts on a stale number and the next correction erodes trust in the dashboard",
}


def five_questions_to_slo():
    # The freshness SLO is the one number this derivation produces: the maximum staleness the
    # dashboard's displayed total may have, in minutes.
    return FIVE_QUESTIONS["window_minutes"]


# --- Six-dimension checklist -------------------------------------------------------------------
# For each dimension: a value for this ask, or "not needed" with the reason it's genuinely out of
# scope here (never "not needed" because it's inconvenient to specify).
SIX_DIMENSIONS = {
    "freshness": {"value": "15 minutes maximum staleness", "needed": True},
    "latency": {"value": "dashboard page must render within 2 seconds of open", "needed": True},
    # These two are exactly what "real-time, accurate" left silent — the hook's whole point.
    "completeness": {"value": None, "needed": True, "left_silent_by_ask": True},
    "correctness": {"value": None, "needed": True, "left_silent_by_ask": True},
    "availability": {"value": "not needed beyond the dashboard's own existing uptime target", "needed": False},
    "retention": {"value": "not needed — this ask is about a live total, not a stored history", "needed": False},
}


def six_dimension_checklist():
    silent = [name for name, d in SIX_DIMENSIONS.items() if d.get("left_silent_by_ask")]
    return silent


# --- Four definitions of "correct" --------------------------------------------------------------
# Same ask, four different specifications of what "correct" means, each implying a different
# system and a different one-line dominant cost. Named, not built (this chapter's rule: point at
# the mechanism's home topic, don't re-teach it).
FOUR_DEFINITIONS = [
    {
        "name": "exactly-once effect",
        "guarantee": "every order counted exactly once, ever, even under retries or replay",
        "cost": "idempotent writes keyed by order id, checked on every apply",
    },
    {
        "name": "eventual completeness by T+1",
        "guarantee": "a number reported today may revise once by tomorrow morning, then is final",
        "cost": "a correction window and a second, slower reconciliation pass",
    },
    {
        "name": "bounded error",
        "guarantee": "the displayed total is within a stated percentage of the true total at all times",
        "cost": "a sampling or sketch-based estimator instead of an exact count",
    },
    {
        "name": "at-most-once",
        "guarantee": "an order may be dropped under failure, never double-counted",
        "cost": "no replay path at all — the simplest and cheapest, and the wrong choice for revenue",
    },
]


def four_definitions_of_correct():
    # The dashboard's actual consequence (a board meeting, not a bill or a refund) tolerates a
    # small, bounded error far more cheaply than it needs a strict exactly-once guarantee —
    # unlike a billing system (topic 12), which cannot tolerate bounded error at all.
    return next(d for d in FOUR_DEFINITIONS if d["name"] == "bounded error")


# --- Rejecting an unmeasurable requirement ------------------------------------------------------
SECOND_ASK = "make it reliable"


def reject_unmeasurable():
    # Running "make it reliable" through the same five questions: none of them has an answer yet,
    # because no indicator was even proposed, regardless of whether everyone agrees what
    # "reliable" means in English.
    missing = ["for_whom", "measured_where", "percentile", "window_minutes", "consequence_on_miss"]
    return missing


def check():
    assert five_questions_to_slo() == 15
    silent = six_dimension_checklist()
    assert set(silent) == {"completeness", "correctness"}
    chosen = four_definitions_of_correct()
    assert chosen["name"] == "bounded error"
    assert len(FOUR_DEFINITIONS) == 4
    assert len({d["name"] for d in FOUR_DEFINITIONS}) == 4
    missing = reject_unmeasurable()
    assert len(missing) == 5
    print("requirements-into-slos examples: all numbers check out")


if __name__ == "__main__":
    check()
