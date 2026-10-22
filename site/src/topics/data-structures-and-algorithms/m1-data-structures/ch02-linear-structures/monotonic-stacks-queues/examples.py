"""
Monotonic stacks and queues: next-greater-element and sliding-window maximum,
checked against brute-force equivalents, with push/pop counts proving the
amortized O(n) bound empirically.
"""
import random
from collections import deque


def next_greater_brute(a):
    n = len(a)
    out = [-1] * n
    comparisons = 0
    for i in range(n):
        for j in range(i + 1, n):
            comparisons += 1
            if a[j] > a[i]:
                out[i] = a[j]
                break
    return out, comparisons


def next_greater_monotonic(a):
    n = len(a)
    out = [-1] * n
    stack = []  # indices, values strictly decreasing bottom to top
    pushes = 0
    pops = 0
    max_size = 0
    for i, x in enumerate(a):
        while stack and a[stack[-1]] < x:
            out[stack.pop()] = x
            pops += 1
        stack.append(i)
        pushes += 1
        max_size = max(max_size, len(stack))
    return out, pushes, pops, max_size


def window_max_brute(a, k):
    n = len(a)
    out = []
    comparisons = 0
    for i in range(n - k + 1):
        best = a[i]
        for j in range(i + 1, i + k):
            comparisons += 1
            if a[j] > best:
                best = a[j]
        out.append(best)
    return out, comparisons


def window_max_monotonic(a, k):
    n = len(a)
    out = []
    dq = deque()  # indices, values strictly decreasing front to back
    pushes = 0
    pops = 0
    max_size = 0
    for i, x in enumerate(a):
        while dq and a[dq[-1]] < x:
            dq.pop()
            pops += 1
        dq.append(i)
        pushes += 1
        while dq[0] <= i - k:
            dq.popleft()
            pops += 1
        max_size = max(max_size, len(dq))
        if i >= k - 1:
            out.append(a[dq[0]])
    return out, pushes, pops, max_size


def check(label, cond):
    status = "OK" if cond else "FAIL"
    print(f"[{status}] {label}")
    assert cond, label


# 1. The source's own worked example, exactly: A = [1, 3, -1, -3, 5, 3, 6, 7], k = 3
source_a = [1, 3, -1, -3, 5, 3, 6, 7]
source_out, _, _, _ = window_max_monotonic(source_a, 3)
check("sliding-window max matches the source's worked example exactly",
      source_out == [3, 3, 5, 5, 6, 7])

# 2. Naive next-greater-element is quadratic on a strictly decreasing input
for n in (10, 100, 1000):
    decreasing = list(range(n, 0, -1))
    _, comparisons = next_greater_brute(decreasing)
    check(f"strictly decreasing n={n}: brute force makes n*(n-1)/2 comparisons",
          comparisons == n * (n - 1) // 2)

# 3. Monotonic-stack next-greater-element agrees with brute force, random + edge cases
random.seed(1234)
test_arrays = [
    [],
    [5],
    [1, 2, 3, 4, 5],
    [5, 4, 3, 2, 1],
    [3, 3, 3, 3],
    [random.randint(-50, 50) for _ in range(200)],
]
for arr in test_arrays:
    brute, _ = next_greater_brute(arr)
    mono, pushes, pops, max_size = next_greater_monotonic(arr)
    check(f"next-greater-element matches brute force, n={len(arr)}", brute == mono)
    check(f"next-greater-element: pushes == n, n={len(arr)}", pushes == len(arr))
    check(f"next-greater-element: pops <= pushes, n={len(arr)}", pops <= pushes)
    check(f"next-greater-element: stack never exceeds n elements, n={len(arr)}",
          max_size <= max(len(arr), 1))

# 4. Monotonic-deque sliding-window max agrees with brute force
for arr, k in [
    ([1, 3, -1, -3, 5, 3, 6, 7], 3),
    (list(range(50)), 5),
    (list(range(50, 0, -1)), 7),
    ([random.randint(-50, 50) for _ in range(300)], 10),
]:
    brute, _ = window_max_brute(arr, k)
    mono, pushes, pops, max_size = window_max_monotonic(arr, k)
    check(f"sliding-window max matches brute force, n={len(arr)} k={k}", brute == mono)
    check(f"sliding-window max: pushes == n, n={len(arr)} k={k}", pushes == len(arr))
    check(f"sliding-window max: pops <= pushes, n={len(arr)} k={k}", pops <= pushes)
    check(f"sliding-window max: deque never exceeds k elements, n={len(arr)} k={k}",
          max_size <= k)

# 5. Total push+pop work stays linear (<= 2n) as n grows -- the "enters and leaves once" bound
print()
print("n       pushes+pops   2n")
for n in (100, 1000, 10000, 100000):
    arr = [random.randint(-n, n) for _ in range(n)]
    _, pushes, pops, _ = next_greater_monotonic(arr)
    total = pushes + pops
    print(f"{n:<8}{total:<14}{2 * n}")
    check(f"next-greater-element total push+pop work <= 2n, n={n}", total <= 2 * n)

# 6. Naive O(N*k) vs monotonic O(N) comparison counts, same inputs
print()
print("n       k    brute comparisons   monotonic pushes+pops")
for n, k in [(1000, 10), (1000, 100), (5000, 50)]:
    arr = [random.randint(-n, n) for _ in range(n)]
    _, brute_comparisons = window_max_brute(arr, k)
    _, pushes, pops, _ = window_max_monotonic(arr, k)
    print(f"{n:<8}{k:<5}{brute_comparisons:<20}{pushes + pops}")
    check(f"monotonic deque does far fewer operations than brute force, n={n} k={k}",
          pushes + pops < brute_comparisons)

print()
print("monotonic-stacks-queues examples: all checks passed")
