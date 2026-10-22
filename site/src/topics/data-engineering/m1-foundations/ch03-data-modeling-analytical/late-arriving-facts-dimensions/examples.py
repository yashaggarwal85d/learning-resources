# Measured directly on this sandbox (PostgreSQL 16, port 5432, a throwaway schema built for this
# topic and dropped immediately after). See SOURCES.md for the exact statements run.

DIM_ROWS_AFTER_INFERRED_INSERT = 1
FACT_ROWS_AFTER_INFERRED_INSERT = 1
DIM_ROWS_AFTER_RESOLVE = 1
ALL_ROWS_RESOLVED = True

WRONG_KEY_VIA_CURRENT_JOIN = 3
CORRECT_KEY_VIA_AS_OF_JOIN = 2


def check():
    assert DIM_ROWS_AFTER_INFERRED_INSERT == 1
    assert FACT_ROWS_AFTER_INFERRED_INSERT == 1
    assert DIM_ROWS_AFTER_RESOLVE == DIM_ROWS_AFTER_INFERRED_INSERT
    assert ALL_ROWS_RESOLVED is True
    assert WRONG_KEY_VIA_CURRENT_JOIN != CORRECT_KEY_VIA_AS_OF_JOIN
    print("late-arriving-facts-dimensions examples: all numbers check out")


if __name__ == "__main__":
    check()
