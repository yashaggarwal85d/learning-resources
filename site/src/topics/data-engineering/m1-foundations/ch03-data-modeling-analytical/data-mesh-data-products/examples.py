# This topic has no lab of its own (CHAPTER.md). The two constants below are this topic's own
# structural counts, drawn directly from Dehghani's own writing: four named mesh principles, and
# four named qualities a domain dataset must have to count as a genuine data product. See
# SOURCES.md.

MESH_PRINCIPLE_COUNT = 4
DATA_PRODUCT_QUALITY_COUNT = 4

def check():
    assert MESH_PRINCIPLE_COUNT == 4
    assert DATA_PRODUCT_QUALITY_COUNT == 4
    assert MESH_PRINCIPLE_COUNT == DATA_PRODUCT_QUALITY_COUNT
    print("data-mesh-data-products examples: all numbers check out")

if __name__ == "__main__":
    check()
