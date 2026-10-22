# This topic has no lab of its own (CHAPTER.md). The two constants below are this topic's own
# structural count of each named architecture's pipelines at serving time: Lambda runs two
# parallel pipelines (batch, speed) merged at serving, Kappa runs exactly one stream-only
# pipeline with no serving-time merge. See SOURCES.md.

LAMBDA_PIPELINE_COUNT = 2
KAPPA_PIPELINE_COUNT = 1

def check():
    assert LAMBDA_PIPELINE_COUNT == 2
    assert KAPPA_PIPELINE_COUNT == 1
    assert KAPPA_PIPELINE_COUNT < LAMBDA_PIPELINE_COUNT
    print("lambda-vs-kappa-architectures examples: all numbers check out")

if __name__ == "__main__":
    check()
