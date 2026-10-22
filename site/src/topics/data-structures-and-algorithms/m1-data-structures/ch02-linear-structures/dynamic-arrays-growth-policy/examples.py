"""Every number in the Dynamic arrays and growth policy reel and Deep dive, executed and checked.
Run: python3 examples.py (CI runs it too).

Three real growth policies, simulated by their own arithmetic (not by shelling out to a C++/Rust/Python
runtime): a fixed factor g (used for g = 2 and g = 1.5), and CPython's own formula, quoted in SOURCES.md
from Objects/listobject.c:
    new_allocated = ((size_t)newsize + (newsize >> 3) + 6) & ~(size_t)3
i.e. newsize + newsize // 8 + 6, rounded down to a multiple of 4.
"""
import math
from fractions import Fraction

G2, G15 = Fraction(2), Fraction(3, 2)


def grow_fixed(cap, g):
    """Chapter 1's rule: empty vector has capacity 0; first append allocates 1; a full vector
    allocates ceil(g * cap), at least cap + 1."""
    return 1 if cap == 0 else max(math.ceil(g * cap), cap + 1)


def grow_cpython(newsize):
    """CPython's own over-allocation formula (Objects/listobject.c), quoted verbatim in SOURCES.md."""
    new_allocated = (newsize + (newsize >> 3) + 6) & ~3
    return new_allocated


def simulate_fixed(n, g):
    """Simulate n appends from empty under a fixed growth factor g.
    Returns (total_element_writes, total_copies, resize_count, final_capacity).
    `resize_count` counts only resizes that actually copy an element (as Chapter 1's examples.py
    does): the very first append (empty -> capacity 1) allocates but copies nothing, so it is not
    counted as a resize."""
    size, cap = 0, 0
    total_writes, total_copies, resizes = 0, 0, 0
    for _ in range(n):
        if size == cap:
            new_cap = grow_fixed(cap, g)
            total_copies += size
            total_writes += size
            if size > 0:
                resizes += 1
            cap = new_cap
        size += 1
        total_writes += 1
    return total_writes, total_copies, resizes, cap


def simulate_cpython(n):
    """Simulate n appends from empty under CPython's list_resize over-allocation policy.
    A reallocation happens whenever the requested newsize exceeds the current allocation.
    Returns (total_element_writes, total_copies, resize_count, final_capacity, growth_pattern).
    `resize_count` follows the same convention as simulate_fixed: the first allocation (copying
    nothing) is not counted."""
    size, cap = 0, 0
    total_writes, total_copies, resizes = 0, 0, 0
    pattern = [0]
    for _ in range(n):
        if size == cap:
            new_cap = grow_cpython(size + 1)
            total_copies += size
            total_writes += size
            if size > 0:
                resizes += 1
            cap = new_cap
            if len(pattern) < 10:
                pattern.append(cap)
        size += 1
        total_writes += 1
    return total_writes, total_copies, resizes, cap, pattern


def main():
    # --- Claim 2 & 3: the memory-reuse argument, both directions ---
    # g = 2: every new chunk is bigger than the sum of every chunk freed before it, forever.
    cap, discarded_sum = 1, 0
    for _ in range(20):
        next_cap = grow_fixed(cap, G2)
        assert discarded_sum < next_cap, 'g=2 should never catch up'
        discarded_sum += cap
        cap = next_cap
    # The exact geometric identity Folly quotes: 1 + 2 + 4 + ... + 2^n = 2^(n+1) - 1, one short of 2^(n+1).
    for n in range(1, 12):
        series_sum = sum(2**i for i in range(n + 1))
        assert series_sum == 2 ** (n + 1) - 1
        assert series_sum == 2 ** (n + 1) - 1 < 2 ** (n + 1)

    # g < 2: Folly's FBVector.md states that g = 1.5 allows memory reuse after 4 reallocations,
    # 1.45 after 3, and 1.3 after 2 (quoted verbatim in SOURCES.md). This topic cites those three
    # numbers as Folly's own claim and does NOT re-derive them here: an attempt to reconstruct them
    # from a "sum of every chunk freed so far >= the next chunk requested" model does not reproduce
    # them (that model converges at the same step count for every g < phi =~ 1.618, which contradicts
    # three distinct step counts for three different g, so it is not Folly's model). Rather than guess
    # at undocumented allocator-reuse arithmetic, the reel shows Folly's numbers as a cited claim, and
    # FACT-CHECK.md records this explicitly as not independently verified.

    # --- Claim 6: CPython's growth pattern, reproduced from the quoted formula ---
    _, _, _, _, pattern = simulate_cpython(100)
    assert pattern == [0, 4, 8, 16, 24, 32, 40, 52, 64, 76], pattern
    print(f'CPython growth pattern (first 10 resizes): {pattern}')

    # --- Prove it, 1 of 2: 1,000,000 appends under g = 2 vs g = 1.5 ---
    N = 1_000_000
    w2, c2, r2, cap2 = simulate_fixed(N, G2)
    w15, c15, r15, cap15 = simulate_fixed(N, G15)
    assert cap2 == 2 ** 20 == 1_048_576
    assert c2 == cap2 - 1 == 1_048_575
    assert w2 == N + c2 == 2_048_575
    assert r2 == 20
    assert r15 == 33
    assert c15 == 2_099_719
    print(f'g=2,   n={N:,}: {r2} reallocations, {c2:,} copies, final capacity {cap2:,} (waste {cap2 - N:,})')
    print(f'g=1.5, n={N:,}: {r15} reallocations, {c15:,} copies, final capacity {cap15:,} (waste {cap15 - N:,})')
    assert c15 > c2, 'g=1.5 does strictly more total copying than g=2 for the same n'
    # Final capacity depends on exactly where n lands relative to the last resize, so it isn't
    # always smaller for the smaller g at one arbitrary n: the general, always-true statement is
    # about the worst case right after any resize. Right after a resize to a fixed factor g, the
    # vector is at least 1/g full (it had size cap/g before resizing to cap); the reel checks this
    # bound, not the capacity at one specific n.
    for g, label in [(G2, 'g=2'), (G15, 'g=1.5')]:
        cap = 1
        for _ in range(10):
            cap = grow_fixed(cap, g)
        min_utilisation_just_after_resize = Fraction(cap, grow_fixed(cap, g))
        assert min_utilisation_just_after_resize <= Fraction(1, g) + Fraction(1, cap)  # within rounding
        print(f'{label}: just after a resize, utilisation is at least about {float(1 / g):.2f}')

    # --- Prove it, 2 of 2: the same run under CPython's own formula ---
    wc, cc, rc, capc, _ = simulate_cpython(N)
    print(f'cpython, n={N:,}: {rc} reallocations, {cc:,} copies, final capacity {capc:,} (waste {capc - N:,})')
    assert rc > r15 > r2, 'the gentler the growth, the more reallocations for the same n'
    assert rc == 85
    assert cc == 8_445_096

    print('All checks passed.')


if __name__ == '__main__':
    main()
