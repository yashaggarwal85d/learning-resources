# This topic has no lab of its own (CHAPTER.md). The two constants below are this topic's own
# structural count of medallion architecture's named layers, not a live measurement: three named
# layers (Bronze, Silver, Gold) is the convention's own definition, and layer sprawl is defined
# as any pipeline running more named layers than that without a correspondingly named new
# contract for each extra one. See SOURCES.md.

MEDALLION_NAMED_LAYER_COUNT = 3
LAYER_SPRAWL_THRESHOLD = MEDALLION_NAMED_LAYER_COUNT


def check():
    assert MEDALLION_NAMED_LAYER_COUNT == 3
    assert LAYER_SPRAWL_THRESHOLD == MEDALLION_NAMED_LAYER_COUNT
    print("medallion-architecture-limits examples: all numbers check out")


if __name__ == "__main__":
    check()
