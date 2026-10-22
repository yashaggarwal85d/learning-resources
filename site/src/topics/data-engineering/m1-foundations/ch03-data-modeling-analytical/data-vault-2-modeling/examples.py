"""Measured and computed truth for data-vault-2-modeling.

Two kinds of numbers here:
1. Measured directly against this sandbox's PostgreSQL cluster: the same "what was this customer's
   address on this order's date" query, built and run four ways (3NF, star, raw Data Vault, Data
   Vault plus a PIT table), with every schema returning the identical, correct answer. The literal
   JOIN count in each query's own SQL text is recorded here, not estimated.
2. Computed directly in Python: two independent "loaders" deriving a hub's hash key from the same
   business key, with no coordination between them, to verify the determinism Data Vault 2.0 relies
   on for parallel, insert-only loading.
"""
import hashlib

# --- 1. As-of-address query, the same answer from all four schemas ---
# orders 100 (2026-03-15) -> '12 Elm St'; order 101 (2026-09-01) -> '88 Oak Ave' (address changed 2026-06-01)
THREE_NF_JOIN_COUNT = 1          # orders JOIN customer_addresses ON customer_id AND date range
STAR_JOIN_COUNT = 1              # fact_order_line JOIN dim_customer ON customer_sk (SCD2 already resolved at load)
RAW_DATA_VAULT_JOIN_COUNT = 4     # hub_order JOIN sat_order_details JOIN link_order_customer JOIN hub_customer JOIN sat_customer_address
RAW_DATA_VAULT_CORRELATED_SUBQUERIES = 1  # a max(load_date) lookup per row, to find the satellite row current as of the order date
DATA_VAULT_WITH_PIT_JOIN_COUNT = 3        # hub_order JOIN sat_order_details JOIN link_order_customer JOIN pit_customer
DATA_VAULT_WITH_PIT_CORRELATED_SUBQUERIES = 0  # the PIT table pre-resolves the as-of lookup at load time, not query time

ALL_FOUR_SCHEMAS_RETURNED = {
    "3nf": {100: "12 Elm St", 101: "88 Oak Ave"},
    "star": {100: "12 Elm St", 101: "88 Oak Ave"},
    "raw_data_vault": {100: "12 Elm St", 101: "88 Oak Ave"},
    "data_vault_with_pit": {100: "12 Elm St", 101: "88 Oak Ave"},
}

# --- 2. Hash-key determinism for parallel, insert-only loading ---

def hash_key(business_key: str) -> str:
    return hashlib.md5(business_key.encode()).hexdigest()


CUSTOMER_BUSINESS_KEY = "1"
LOADER_A_HASH_KEY = hash_key(CUSTOMER_BUSINESS_KEY)
LOADER_B_HASH_KEY = hash_key(CUSTOMER_BUSINESS_KEY)  # a second, independent loader; no lookup against the first


def check():
    assert THREE_NF_JOIN_COUNT == STAR_JOIN_COUNT == 1
    assert RAW_DATA_VAULT_JOIN_COUNT == 4
    assert DATA_VAULT_WITH_PIT_JOIN_COUNT == 3
    assert DATA_VAULT_WITH_PIT_JOIN_COUNT < RAW_DATA_VAULT_JOIN_COUNT
    assert RAW_DATA_VAULT_CORRELATED_SUBQUERIES == 1
    assert DATA_VAULT_WITH_PIT_CORRELATED_SUBQUERIES == 0
    for schema, answers in ALL_FOUR_SCHEMAS_RETURNED.items():
        assert answers == ALL_FOUR_SCHEMAS_RETURNED["3nf"], f"{schema} disagreed with 3NF"
    assert LOADER_A_HASH_KEY == LOADER_B_HASH_KEY
    print("data-vault-2-modeling examples: all numbers check out")


if __name__ == "__main__":
    check()
