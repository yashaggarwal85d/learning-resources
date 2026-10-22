# This topic has no lab of its own (CHAPTER.md). Both numbers below are Snowflake's own stated
# claims about multi-cluster warehouse scaling, not a live measurement: scaling resources is
# driven by concurrent user/query load, not by making any single query faster, and a warehouse's
# cache size grows with warehouse size rather than being a fixed, size-independent quantity.
# See SOURCES.md.

SCALING_TRIGGER_IS_CONCURRENCY = 1
SCALING_TRIGGER_IS_SINGLE_QUERY_SPEED = 0

CACHE_SIZE_GROWS_WITH_WAREHOUSE_SIZE = 1
CACHE_SIZE_FIXED_REGARDLESS_OF_SIZE = 0


def check():
    assert SCALING_TRIGGER_IS_CONCURRENCY == 1
    assert SCALING_TRIGGER_IS_SINGLE_QUERY_SPEED == 0
    assert CACHE_SIZE_GROWS_WITH_WAREHOUSE_SIZE == 1
    assert CACHE_SIZE_FIXED_REGARDLESS_OF_SIZE == 0
    print("compute-storage-separation-workload examples: all numbers check out")


if __name__ == "__main__":
    check()
