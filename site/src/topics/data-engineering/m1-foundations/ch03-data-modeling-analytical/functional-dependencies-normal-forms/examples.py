"""Every number and claim in the "Functional dependencies and normal forms" reel. The closure computation and
candidate-key search are run by a real algorithm below (executed truth, not asserted); the update-anomaly counts
are measured on a throwaway schema on this session's PostgreSQL 16.15 sandbox (see SOURCES.md)."""

# The shop's own FD set for this topic's worked example.
ATTRS = {"order_id", "customer_id", "customer_email", "amount"}
FDS = [
    ({"order_id"}, {"customer_id", "amount"}),
    ({"customer_id"}, {"customer_email"}),
]


def closure(attrs, fds):
    """Attribute closure: repeatedly fire any FD whose left side is already covered, until nothing new lights up."""
    result = set(attrs)
    changed = True
    while changed:
        changed = False
        for lhs, rhs in fds:
            if lhs <= result and not (rhs <= result):
                result |= rhs
                changed = True
    return result


ORDER_ID_CLOSURE = closure({"order_id"}, FDS)
CUSTOMER_ID_CLOSURE = closure({"customer_id"}, FDS)

# Measured directly (SOURCES.md, "Measured directly"): updating one customer's email.
DENORMALIZED_ROWS_FOR_CUSTOMER = 5
DENORMALIZED_UPDATE_ROWS_AFFECTED = 5
NORMALIZED_UPDATE_ROWS_AFFECTED = 1
MISSED_ROWS_UPDATED = 4
DISTINCT_EMAILS_AFTER_MISSED_UPDATE = 2


def check():
    assert ORDER_ID_CLOSURE == ATTRS, "order_id's closure should reach every attribute"
    assert CUSTOMER_ID_CLOSURE == {"customer_id", "customer_email"}, "customer_id's closure should stop short of order_id and amount"
    # order_id is the only candidate key: the sole minimal attribute set whose closure is everything.
    candidate_keys = [a for a in [frozenset({"order_id"}), frozenset({"customer_id"}), frozenset({"amount"}), frozenset({"customer_email"})] if closure(a, FDS) == ATTRS]
    assert candidate_keys == [frozenset({"order_id"})]
    assert DENORMALIZED_UPDATE_ROWS_AFFECTED == DENORMALIZED_ROWS_FOR_CUSTOMER
    assert NORMALIZED_UPDATE_ROWS_AFFECTED == 1
    assert MISSED_ROWS_UPDATED < DENORMALIZED_ROWS_FOR_CUSTOMER
    assert DISTINCT_EMAILS_AFTER_MISSED_UPDATE == 2
    print("functional-dependencies-normal-forms examples: all numbers check out")


if __name__ == "__main__":
    check()
