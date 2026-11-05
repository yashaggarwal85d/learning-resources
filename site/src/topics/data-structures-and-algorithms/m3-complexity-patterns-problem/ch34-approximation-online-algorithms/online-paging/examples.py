"""Online paging: every number this topic shows on screen, computed and asserted here.
A cache of k pages, requests arriving one at a time with no knowledge of the future, and
three policies: LRU and FIFO (online, deciding with only the past) against Bélády's offline
optimum MIN (deciding with the whole future in hand, used only as a benchmark no real
policy can run). Two experiments: the classic adversary trace that forces any deterministic
online policy to fault on every single request while MIN does not, and Bélády's own anomaly
(FIFO's fault count can go up, not down, with more memory)."""


def lru_faults(sequence, k):
    frames = []
    faults = 0
    for page in sequence:
        if page in frames:
            frames.remove(page)
            frames.append(page)
            continue
        faults += 1
        if len(frames) < k:
            frames.append(page)
        else:
            frames.pop(0)
            frames.append(page)
    return faults


def fifo_faults(sequence, k):
    frames = []
    faults = 0
    for page in sequence:
        if page in frames:
            continue
        faults += 1
        if len(frames) < k:
            frames.append(page)
        else:
            frames.pop(0)
            frames.append(page)
    return faults


def opt_faults(sequence, k):
    """Bélády's MIN: on a fault, evict whichever cached page is next needed furthest
    in the future (or never again). Needs the whole sequence in advance."""
    frames = []
    faults = 0
    n = len(sequence)

    def next_use(page, from_index):
        for j in range(from_index, n):
            if sequence[j] == page:
                return j
        return float("inf")

    for i, page in enumerate(sequence):
        if page in frames:
            continue
        faults += 1
        if len(frames) < k:
            frames.append(page)
        else:
            evict = max(frames, key=lambda f: next_use(f, i + 1))
            frames.remove(evict)
            frames.append(page)
    return faults


# --- The adversary argument: no deterministic online policy beats a ratio of k ---------
#
# A cache holds k pages. The adversary has k + 1 distinct pages and, on every request,
# asks for exactly the one page the algorithm just evicted (the one page guaranteed not
# to be in its cache). Any deterministic online algorithm, LRU and FIFO included, faults
# on every single request this way, because it can never hold the one page being asked
# for next. The offline optimum, seeing the whole trace in advance, can arrange its
# evictions so that it faults only about once every k requests.

def build_adversary_trace(k, request_count, evict_from_front):
    """evict_from_front selects which of the two online policies' own eviction order
    the adversary trace is built against (LRU and FIFO evict the same page on this
    particular cyclic trace, so one builder serves both)."""
    frames = list(range(k))
    sequence = []
    last_evicted = k  # not yet in cache: the very first request is forced to fault
    for _ in range(request_count):
        page = last_evicted
        sequence.append(page)
        if page in frames:
            continue
        evicted = frames.pop(0) if evict_from_front else frames.pop(0)
        frames.append(page)
        last_evicted = evicted
    return sequence


K = 4
REQUEST_COUNT = 2000

ADVERSARY_TRACE = build_adversary_trace(K, REQUEST_COUNT, evict_from_front=True)

LRU_ADVERSARY_FAULTS = lru_faults(ADVERSARY_TRACE, K)
FIFO_ADVERSARY_FAULTS = fifo_faults(ADVERSARY_TRACE, K)
OPT_ADVERSARY_FAULTS = opt_faults(ADVERSARY_TRACE, K)

assert LRU_ADVERSARY_FAULTS == REQUEST_COUNT
assert FIFO_ADVERSARY_FAULTS == REQUEST_COUNT
assert OPT_ADVERSARY_FAULTS == 503

RATIO_AT_K4 = LRU_ADVERSARY_FAULTS / OPT_ADVERSARY_FAULTS
assert round(RATIO_AT_K4, 2) == 3.98

# The ratio approaches k itself as the trace grows, checked at several cache sizes.
RATIO_BY_K = {}
for k in (2, 3, 4, 5):
    trace = build_adversary_trace(k, REQUEST_COUNT, evict_from_front=True)
    faults = lru_faults(trace, k)
    opt = opt_faults(trace, k)
    assert faults == REQUEST_COUNT
    RATIO_BY_K[k] = round(faults / opt, 2)

assert RATIO_BY_K == {2: 2.0, 3: 2.99, 4: 3.98, 5: 4.95}

# --- Bélády's anomaly: FIFO's fault count going up, not down, with more memory ---------
#
# The classic reference string, checked against three, then four, frames.

ANOMALY_SEQUENCE = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]

FIFO_FAULTS_3_FRAMES = fifo_faults(ANOMALY_SEQUENCE, 3)
FIFO_FAULTS_4_FRAMES = fifo_faults(ANOMALY_SEQUENCE, 4)
LRU_FAULTS_3_FRAMES = lru_faults(ANOMALY_SEQUENCE, 3)
LRU_FAULTS_4_FRAMES = lru_faults(ANOMALY_SEQUENCE, 4)
OPT_FAULTS_3_FRAMES = opt_faults(ANOMALY_SEQUENCE, 3)
OPT_FAULTS_4_FRAMES = opt_faults(ANOMALY_SEQUENCE, 4)

assert FIFO_FAULTS_3_FRAMES == 9
assert FIFO_FAULTS_4_FRAMES == 10
assert FIFO_FAULTS_4_FRAMES > FIFO_FAULTS_3_FRAMES  # the anomaly itself: more memory, more faults

assert LRU_FAULTS_3_FRAMES == 10
assert LRU_FAULTS_4_FRAMES == 8
assert LRU_FAULTS_4_FRAMES < LRU_FAULTS_3_FRAMES  # LRU is monotone: more memory never hurts

assert OPT_FAULTS_3_FRAMES == 7
assert OPT_FAULTS_4_FRAMES == 6
assert OPT_FAULTS_4_FRAMES < OPT_FAULTS_3_FRAMES  # the true optimum is monotone too


if __name__ == "__main__":
    print(f"adversary trace, k={K}, {REQUEST_COUNT} requests:")
    print(f"  LRU faults:  {LRU_ADVERSARY_FAULTS}")
    print(f"  FIFO faults: {FIFO_ADVERSARY_FAULTS}")
    print(f"  OPT faults:  {OPT_ADVERSARY_FAULTS}")
    print(f"  ratio: {RATIO_AT_K4:.2f} (k = {K})")
    print(f"ratio by k: {RATIO_BY_K}")
    print(f"Bélády's anomaly, FIFO: {FIFO_FAULTS_3_FRAMES} faults at 3 frames, "
          f"{FIFO_FAULTS_4_FRAMES} at 4 frames")
    print(f"  LRU (monotone): {LRU_FAULTS_3_FRAMES} at 3 frames, {LRU_FAULTS_4_FRAMES} at 4 frames")
    print(f"  OPT (monotone): {OPT_FAULTS_3_FRAMES} at 3 frames, {OPT_FAULTS_4_FRAMES} at 4 frames")
    print("All assertions passed.")
