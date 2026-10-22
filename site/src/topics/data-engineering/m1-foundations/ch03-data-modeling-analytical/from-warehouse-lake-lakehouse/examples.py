# This topic has no lab of its own (CHAPTER.md). Both numbers below are the paper's own claim
# about pipeline shape, not a live measurement: Armbrust et al. state that a first-generation
# platform ETLs data directly into a warehouse (one step), while today's two-tier lake-plus-
# warehouse architecture ETLs into the lake and then ELTs again into the warehouse (two steps).
# See SOURCES.md.

PIPELINE_STEPS_FIRST_GENERATION = 1
PIPELINE_STEPS_TWO_TIER_LAKE_AND_WAREHOUSE = 2

ARCHITECTURE_STAGE_COUNT = 3


def check():
    assert PIPELINE_STEPS_FIRST_GENERATION == 1
    assert PIPELINE_STEPS_TWO_TIER_LAKE_AND_WAREHOUSE == 2
    assert PIPELINE_STEPS_TWO_TIER_LAKE_AND_WAREHOUSE > PIPELINE_STEPS_FIRST_GENERATION
    assert ARCHITECTURE_STAGE_COUNT == 3
    print("from-warehouse-lake-lakehouse examples: all numbers check out")


if __name__ == "__main__":
    check()
