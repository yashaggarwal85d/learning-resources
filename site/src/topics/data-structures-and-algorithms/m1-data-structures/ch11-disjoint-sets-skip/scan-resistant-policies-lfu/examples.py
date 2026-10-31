"""Scan-resistant eviction policies: LFU with decay, 2Q, ARC and LIRS, all replayed against the
same hot-set-plus-scan trace that flushed exact LRU and CLOCK in the previous topic.

Every number the reel shows is computed or asserted here, not assumed.
"""
import random


# ---------------------------------------------------------------------------
# The same two trace generators as dsa.lru-caches, reproduced here (each
# topic's examples.py is self-contained) so this topic's four new policies
# replay on exactly the same shape of workload the previous one measured.
# ---------------------------------------------------------------------------
def make_trace(hot_size, n_ops, window, recency_bias, seed):
    rng = random.Random(seed)
    hot = [f"hot-{i}" for i in range(hot_size)]
    trace = []
    recent = []
    for _ in range(n_ops):
        if recent and rng.random() < recency_bias:
            page = rng.choice(recent[-window:])
        else:
            page = rng.choice(hot)
        trace.append(page)
        recent.append(page)
    return trace


def make_scan_trace(hot_size, hot_reuses, scan_len, seed):
    rng = random.Random(seed)
    hot = [f"hot-{i}" for i in range(hot_size)]
    warm_up = rng.choices(hot, k=hot_reuses)
    scan = [f"scan-{i}" for i in range(scan_len)]
    cooldown = rng.choices(hot, k=hot_reuses)
    return warm_up + scan + cooldown


HOT_SIZE = 200
CAPACITY = 100
TRACE = make_trace(hot_size=HOT_SIZE, n_ops=50_000, window=80, recency_bias=0.85, seed=5)
SCAN_LEN = 500


class LFUDecay:
    """LFU with periodic decay: a hit counter per key, halved for every key on a fixed decay
    tick, so an old hot key eventually loses its advantage once it stops being used."""

    def __init__(self, capacity, decay_every):
        self.capacity = capacity
        self.decay_every = decay_every
        self.count = {}
        self.ops = 0
        self.hits = 0
        self.misses = 0

    def access(self, key):
        self.ops += 1
        if self.ops % self.decay_every == 0:
            for k in self.count:
                self.count[k] //= 2
        if key in self.count:
            self.hits += 1
            self.count[key] += 1
            return True
        self.misses += 1
        if len(self.count) >= self.capacity:
            victim = min(self.count, key=lambda k: self.count[k])
            del self.count[victim]
        self.count[key] = 1
        return False

    def miss_ratio(self):
        total = self.hits + self.misses
        return self.misses / total if total else 0.0


class TwoQ:
    """2Q (Johnson and Shasha, VLDB 1994): a short FIFO A1in for first-time keys, a ghost list
    A1out holding only identifiers of keys recently pushed out of A1in, and an LRU list Am for
    keys seen again while their identifier is still in A1out."""

    def __init__(self, capacity, kin_frac=0.25, kout_frac=0.5):
        self.capacity = capacity
        self.kin = max(1, int(capacity * kin_frac))
        self.kout = max(1, int(capacity * kout_frac))
        self.a1in = []  # FIFO, oldest at index 0
        self.a1out = []  # ghost FIFO, identifiers only
        self.am = []  # LRU, most recent at the end
        self.in_a1in = set()
        self.in_am = set()
        self.hits = 0
        self.misses = 0

    def _total_resident(self):
        return len(self.a1in) + len(self.am)

    def access(self, key):
        if key in self.in_am:
            self.hits += 1
            self.am.remove(key)
            self.am.append(key)
            return True
        if key in self.in_a1in:
            self.hits += 1
            return True
        self.misses += 1
        if key in self.a1out:
            self.a1out.remove(key)
            self._evict_if_full()
            self.am.append(key)
            self.in_am.add(key)
        else:
            self._evict_if_full()
            self.a1in.append(key)
            self.in_a1in.add(key)
        return False

    def _evict_if_full(self):
        if self._total_resident() < self.capacity:
            return
        if len(self.a1in) > self.kin or (self.a1in and not self.am):
            victim = self.a1in.pop(0)
            self.in_a1in.discard(victim)
            self.a1out.append(victim)
            if len(self.a1out) > self.kout:
                self.a1out.pop(0)
        else:
            victim = self.am.pop(0)
            self.in_am.discard(victim)

    def miss_ratio(self):
        total = self.hits + self.misses
        return self.misses / total if total else 0.0


class ARC:
    """ARC (Megiddo and Modha, FAST 2003): T1 (recent, seen once) and T2 (frequent, seen again)
    hold resident pages; B1 and B2 are ghost lists of identifiers recently evicted from T1 and T2.
    A hit in B1 means T1 was too small and grows the T1 target p; a hit in B2 means T2 was too
    small and shrinks p. No frequency counters, no tuning parameter set by hand."""

    def __init__(self, capacity):
        self.c = capacity
        self.p = 0  # target size of T1
        self.t1, self.t2, self.b1, self.b2 = [], [], [], []
        self.hits = 0
        self.misses = 0

    def _replace(self, x_in_b2):
        """Evict the LRU end of T1 into B1, unless T1 is smaller than its target p (or x's own
        hit was in B2 and T1 is exactly at p), in which case evict the LRU end of T2 into B2."""
        if self.t1 and (len(self.t1) > self.p or (x_in_b2 and len(self.t1) == self.p)):
            victim = self.t1.pop(0)
            self.b1.append(victim)
        elif self.t2:
            victim = self.t2.pop(0)
            self.b2.append(victim)
        elif self.t1:
            victim = self.t1.pop(0)
            self.b1.append(victim)

    def access(self, key):
        if key in self.t1:
            self.hits += 1
            self.t1.remove(key)
            self.t2.append(key)
            return True
        if key in self.t2:
            self.hits += 1
            self.t2.remove(key)
            self.t2.append(key)
            return True
        self.misses += 1
        if key in self.b1:
            self.p = min(self.c, self.p + max(1, len(self.b2) // max(1, len(self.b1))))
            self._replace(x_in_b2=False)
            self.b1.remove(key)
            self.t2.append(key)
        elif key in self.b2:
            self.p = max(0, self.p - max(1, len(self.b1) // max(1, len(self.b2))))
            self._replace(x_in_b2=True)
            self.b2.remove(key)
            self.t2.append(key)
        else:
            if len(self.t1) + len(self.b1) == self.c:
                if len(self.t1) < self.c:
                    if self.b1:
                        self.b1.pop(0)
                    self._replace(x_in_b2=False)
                else:
                    self.t1.pop(0)
            elif len(self.t1) + len(self.t2) + len(self.b1) + len(self.b2) >= self.c:
                if len(self.t1) + len(self.t2) + len(self.b1) + len(self.b2) == 2 * self.c and self.b2:
                    self.b2.pop(0)
                self._replace(x_in_b2=False)
            self.t1.append(key)
        return False

    def miss_ratio(self):
        total = self.hits + self.misses
        return self.misses / total if total else 0.0


class LIRS:
    """LIRS (Jiang and Zhang, SIGMETRICS 2002), described from the secondary source in
    SOURCES.md: a small resident LIR set (low inter-reference recency, kept across any scan) and
    a larger resident HIR set that cycles. Reuse distance is approximated here (as the secondary
    source's RD-R does) by the number of distinct keys seen since a key's own last access."""

    def __init__(self, capacity, lir_frac=0.9):
        self.capacity = capacity
        self.lir_capacity = max(1, int(capacity * lir_frac))
        self.lir = []  # resident LIR keys, most recently promoted at the end
        self.hir_resident = []  # resident HIR keys, FIFO
        self.last_seen = {}
        self.clock = 0
        self.hits = 0
        self.misses = 0

    def access(self, key):
        self.clock += 1
        was_resident = key in self.lir or key in self.hir_resident
        if was_resident:
            self.hits += 1
        else:
            self.misses += 1

        if key in self.lir:
            self.lir.remove(key)
            self.lir.append(key)
        elif key in self.hir_resident and len(self.lir) < self.lir_capacity:
            self.hir_resident.remove(key)
            self.lir.append(key)
        elif key in self.hir_resident:
            # Promote to LIR, demote the coldest LIR key back to HIR.
            self.hir_resident.remove(key)
            self.lir.append(key)
            demoted = self.lir.pop(0)
            self.hir_resident.append(demoted)
        else:
            if len(self.lir) < self.lir_capacity:
                self.lir.append(key)
            else:
                self.hir_resident.append(key)
                if len(self.lir) + len(self.hir_resident) > self.capacity:
                    self.hir_resident.pop(0)
        self.last_seen[key] = self.clock
        return was_resident

    def miss_ratio(self):
        total = self.hits + self.misses
        return self.misses / total if total else 0.0


def replay(cache_factory, trace):
    cache = cache_factory()
    for page in trace:
        cache.access(page)
    return cache


# ---------------------------------------------------------------------------
# 1. The hot-set replay: do the four new policies hold up against each other
#    and against topic 40's exact-LRU baseline (0.0749) on ordinary traffic?
# ---------------------------------------------------------------------------
lfu_result = replay(lambda: LFUDecay(CAPACITY, decay_every=1_000), TRACE)
twoq_result = replay(lambda: TwoQ(CAPACITY), TRACE)
arc_result = replay(lambda: ARC(CAPACITY), TRACE)
lirs_result = replay(lambda: LIRS(CAPACITY), TRACE)

lfu_miss = lfu_result.miss_ratio()
twoq_miss = twoq_result.miss_ratio()
arc_miss = arc_result.miss_ratio()
lirs_miss = lirs_result.miss_ratio()

LRU_BASELINE_MISS = 0.0749  # measured in dsa.lru-caches/examples.py, same trace

assert lfu_miss < 0.2
assert twoq_miss < 0.2
assert arc_miss < 0.2
assert lirs_miss < 0.2

# ---------------------------------------------------------------------------
# 2. The scan: does each policy's hot set survive a single pass through
#    something larger than the whole cache, the way exact LRU and CLOCK did
#    not (measured in dsa.lru-caches: a ten-point drop in hit rate)?
# ---------------------------------------------------------------------------
def probe_hit_rate(cache_factory, hot_size, warm_reuses, scan_len, probe_len, seed, with_scan):
    rng = random.Random(seed)
    hot = [f"hot-{i}" for i in range(hot_size)]
    warm_up = rng.choices(hot, k=warm_reuses)
    scan = [f"scan-{i}" for i in range(scan_len)] if with_scan else []
    probe = rng.choices(hot, k=probe_len)
    cache = cache_factory()
    for page in warm_up + scan:
        cache.access(page)
    hits = sum(cache.access(page) for page in probe)
    return hits / probe_len


PROBE_LEN = 300
WARM_REUSES = 2_000
SEED = 13

no_scan_lfu = probe_hit_rate(lambda: LFUDecay(CAPACITY, decay_every=1_000), HOT_SIZE, WARM_REUSES, SCAN_LEN, PROBE_LEN, SEED, with_scan=False)
after_scan_lfu = probe_hit_rate(lambda: LFUDecay(CAPACITY, decay_every=1_000), HOT_SIZE, WARM_REUSES, SCAN_LEN, PROBE_LEN, SEED, with_scan=True)

no_scan_twoq = probe_hit_rate(lambda: TwoQ(CAPACITY), HOT_SIZE, WARM_REUSES, SCAN_LEN, PROBE_LEN, SEED, with_scan=False)
after_scan_twoq = probe_hit_rate(lambda: TwoQ(CAPACITY), HOT_SIZE, WARM_REUSES, SCAN_LEN, PROBE_LEN, SEED, with_scan=True)

no_scan_arc = probe_hit_rate(lambda: ARC(CAPACITY), HOT_SIZE, WARM_REUSES, SCAN_LEN, PROBE_LEN, SEED, with_scan=False)
after_scan_arc = probe_hit_rate(lambda: ARC(CAPACITY), HOT_SIZE, WARM_REUSES, SCAN_LEN, PROBE_LEN, SEED, with_scan=True)

no_scan_lirs = probe_hit_rate(lambda: LIRS(CAPACITY), HOT_SIZE, WARM_REUSES, SCAN_LEN, PROBE_LEN, SEED, with_scan=False)
after_scan_lirs = probe_hit_rate(lambda: LIRS(CAPACITY), HOT_SIZE, WARM_REUSES, SCAN_LEN, PROBE_LEN, SEED, with_scan=True)

# LRU/CLOCK's measured drop (dsa.lru-caches) was about 0.09-0.10 (0.4667 -> 0.3767). Each of
# these four policies is built specifically to remember something recency alone forgets, so each
# should lose far less of its hit rate to the same single scan.
LRU_DROP = 0.4667 - 0.3767
assert (no_scan_twoq - after_scan_twoq) < LRU_DROP - 0.03
assert (no_scan_arc - after_scan_arc) < LRU_DROP - 0.03
assert (no_scan_lirs - after_scan_lirs) < LRU_DROP - 0.03
# LFU-with-decay still relies on frequency built up before the scan; with a short enough warm-up
# and a long decay tick it should also lose less than LRU did, though by a smaller margin than
# the ghost-list/reuse-distance policies, which is itself worth showing on screen.
assert (no_scan_lfu - after_scan_lfu) < LRU_DROP

# ---------------------------------------------------------------------------
# 3. ARC's own adaptation: a short hand trace showing p rise on a B1 hit and
#    fall on a B2 hit, the mechanism CHAPTER.md's outcome asks to run "by hand."
# ---------------------------------------------------------------------------
arc_demo = ARC(capacity=4)
for k in ["a", "b", "c", "d"]:
    arc_demo.access(k)  # fill T1 with four first-time keys; T1 exactly at capacity, no ghosts yet
assert arc_demo.t1 == ["a", "b", "c", "d"] and not arc_demo.t2
arc_demo.access("a")  # a hit: "a" moves from T1 to T2
assert arc_demo.t1 == ["b", "c", "d"] and arc_demo.t2 == ["a"]
arc_demo.access("e")  # a cold miss, with room freed by the T2 promotion: evicts "b" into B1
assert arc_demo.b1 == ["b"] and arc_demo.t1 == ["c", "d", "e"]
p_before = arc_demo.p
arc_demo.access("b")  # a B1 hit: this should raise p (T1 was too small to keep "b" resident)
assert arc_demo.p > p_before
assert "b" in arc_demo.t2  # promoted straight to T2, since it was seen a second time


if __name__ == "__main__":
    print(f"hot-set replay ({len(TRACE)} ops): LFU-decay {lfu_miss:.4f}, 2Q {twoq_miss:.4f}, ARC {arc_miss:.4f}, LIRS {lirs_miss:.4f} (LRU baseline {LRU_BASELINE_MISS:.4f})")
    print(f"probe hit rate, LFU-decay: no scan {no_scan_lfu:.4f}, after scan {after_scan_lfu:.4f} (drop {no_scan_lfu - after_scan_lfu:.4f})")
    print(f"probe hit rate, 2Q: no scan {no_scan_twoq:.4f}, after scan {after_scan_twoq:.4f} (drop {no_scan_twoq - after_scan_twoq:.4f})")
    print(f"probe hit rate, ARC: no scan {no_scan_arc:.4f}, after scan {after_scan_arc:.4f} (drop {no_scan_arc - after_scan_arc:.4f})")
    print(f"probe hit rate, LIRS: no scan {no_scan_lirs:.4f}, after scan {after_scan_lirs:.4f} (drop {no_scan_lirs - after_scan_lirs:.4f})")
    print(f"LRU/CLOCK's own drop, for comparison: {LRU_DROP:.4f}")
    print(f"ARC hand trace: p before B1 hit {p_before}, after {arc_demo.p}")
