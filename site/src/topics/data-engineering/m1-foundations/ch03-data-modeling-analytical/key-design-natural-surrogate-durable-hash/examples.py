"""Measured and computed truth for key-design-natural-surrogate-durable-hash.

Two kinds of numbers here:
1. Measured directly against this sandbox's PostgreSQL clusters (port 5432, PG
   16.15; port 5433, PG 18.6 — the only cluster with uuidv7()). Recorded as
   constants from the actual psql session, not re-run by this script.
2. Computed directly by the birthday-bound formula below (not hand-asserted).
"""
import math

# --- 1. Natural key vs. surrogate key, a real FK-constrained table pair ---
# kd_customers_natural(customer_email primary key) <- kd_orders_natural(customer_email references ...)
# UPDATE kd_customers_natural SET customer_email = 'amina.k@example.com' WHERE customer_email = 'amina@example.com';
# -> ERROR: update or delete on table "kd_customers_natural" violates foreign key
#    constraint "kd_orders_natural_customer_email_fkey"
#    DETAIL: Key (customer_email)=(amina@example.com) is still referenced from table "kd_orders_natural".
NATURAL_KEY_UPDATE_BLOCKED = True

# kd_customers_surrogate(customer_id primary key, customer_email) <- kd_orders_surrogate(customer_id references ...)
# UPDATE kd_customers_surrogate SET customer_email = ... WHERE customer_id = 1;  -> UPDATE 1, no error
# orders still resolve by customer_id afterward:
ORDERS_STILL_RESOLVING_AFTER_SURROGATE_EMAIL_CHANGE = 3
SURROGATE_KEY_ROWS_CHANGED_BY_EMAIL_UPDATE = 1

# --- 2. Generation cost: 100,000 inserts into a table with a pre-built btree index ---
# (PostgreSQL 18.6, port 5433; \timing results from the actual session)
SEQUENCE_INSERT_MS = 221.876
UUIDV7_INSERT_MS = 347.448
UUIDV4_INSERT_MS = 444.299

# --- 3. Index locality: pgstatindex() on the same three tables after the inserts above ---
SEQUENCE_LEAF_DENSITY_PCT = 89.78
UUIDV7_LEAF_DENSITY_PCT = 89.79
UUIDV4_LEAF_DENSITY_PCT = 65.52
SEQUENCE_LEAF_PAGES = 274
UUIDV7_LEAF_PAGES = 384
UUIDV4_LEAF_PAGES = 527

# --- 4. Hash-collision risk: the birthday bound, computed, not asserted ---

def birthday_n_for_p(bits: int, p: float = 0.5) -> float:
    """Items needed for a p probability of at least one collision, for a d = 2**bits space."""
    d = 2 ** bits
    return math.sqrt(2 * d * math.log(1 / (1 - p)))


def collision_probability(bits: int, n: int) -> float:
    d = 2 ** bits
    return 1 - math.exp(-(n * (n - 1)) / (2 * d))


HASH32_FIFTY_PERCENT_N = birthday_n_for_p(32)          # a 32-bit truncated hash key
HASH64_FIFTY_PERCENT_N = birthday_n_for_p(64)          # a 64-bit truncated hash key
UUIDV4_FIFTY_PERCENT_N = birthday_n_for_p(122)         # UUIDv4's 122 random bits
MD5_FIFTY_PERCENT_N = birthday_n_for_p(128)            # a full 128-bit MD5 hash key

ONE_BILLION_ROWS = 1_000_000_000
HASH32_COLLISION_PROB_AT_1B = collision_probability(32, ONE_BILLION_ROWS)
HASH64_COLLISION_PROB_AT_1B = collision_probability(64, ONE_BILLION_ROWS)
MD5_COLLISION_PROB_AT_1B = collision_probability(128, ONE_BILLION_ROWS)


def check():
    assert NATURAL_KEY_UPDATE_BLOCKED is True
    assert SURROGATE_KEY_ROWS_CHANGED_BY_EMAIL_UPDATE == 1
    assert ORDERS_STILL_RESOLVING_AFTER_SURROGATE_EMAIL_CHANGE == 3
    assert SEQUENCE_INSERT_MS < UUIDV7_INSERT_MS < UUIDV4_INSERT_MS
    assert SEQUENCE_LEAF_PAGES < UUIDV7_LEAF_PAGES < UUIDV4_LEAF_PAGES
    assert abs(SEQUENCE_LEAF_DENSITY_PCT - UUIDV7_LEAF_DENSITY_PCT) < 0.1
    assert UUIDV4_LEAF_DENSITY_PCT < SEQUENCE_LEAF_DENSITY_PCT - 20
    assert HASH32_FIFTY_PERCENT_N < 100_000
    assert HASH64_FIFTY_PERCENT_N < ONE_BILLION_ROWS * 10
    assert UUIDV4_FIFTY_PERCENT_N > 1e17
    assert HASH32_COLLISION_PROB_AT_1B > 0.999
    assert 0.01 < HASH64_COLLISION_PROB_AT_1B < 0.05
    assert MD5_COLLISION_PROB_AT_1B < 1e-9
    print("key-design-natural-surrogate-durable-hash examples: all numbers check out")


if __name__ == "__main__":
    check()
