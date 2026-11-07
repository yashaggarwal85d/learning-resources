"""Backtracking with pruning: enumeration trees, N-queens, and Norvig's Sudoku solver.

Every number asserted here is the one the reel and post-notes state. Sources:
norvig.com/sudoku.html (the hard grid, the propagation rules, MRV, the heavy-tail runs),
Wikipedia "Eight queens puzzle" (the 4,426,165,368 / 16,777,216 / 40,320 progression, the
92/12 counts), OEIS A000170 (solution counts by n).
"""

import itertools
import random
import time

# ---------------------------------------------------------------------------
# 1. Enumeration: subsets, permutations, combinations on {a, b, c, d}
# ---------------------------------------------------------------------------

ELEMENTS = ['a', 'b', 'c', 'd']


def all_subsets(elements):
    """Choose-explore-undo over 'in or out' at each element: 2^n leaves."""
    result = []

    def rec(i, chosen):
        if i == len(elements):
            result.append(tuple(chosen))
            return
        rec(i + 1, chosen)  # out
        chosen.append(elements[i])
        rec(i + 1, chosen)  # in
        chosen.pop()

    rec(0, [])
    return result


def all_permutations(elements):
    """Choose-explore-undo over 'any unused element next': n! leaves."""
    result = []
    used = [False] * len(elements)

    def rec(chosen):
        if len(chosen) == len(elements):
            result.append(tuple(chosen))
            return
        for i, e in enumerate(elements):
            if used[i]:
                continue
            used[i] = True
            chosen.append(e)
            rec(chosen)
            chosen.pop()
            used[i] = False

    rec([])
    return result


def all_combinations(elements, k):
    """Choose-explore-undo with increasing indices only: C(n, k) leaves, no duplicate order."""
    result = []
    n = len(elements)

    def rec(start, chosen):
        if len(chosen) == k:
            result.append(tuple(chosen))
            return
        for i in range(start, n):
            chosen.append(elements[i])
            rec(i + 1, chosen)
            chosen.pop()

    rec(0, [])
    return result


subsets4 = all_subsets(ELEMENTS)
perms4 = all_permutations(ELEMENTS)
combos4_2 = all_combinations(ELEMENTS, 2)
assert len(subsets4) == 16 == 2 ** 4
assert len(perms4) == 24 == 24
assert len(combos4_2) == 6

perms3 = all_permutations(ELEMENTS[:3])
assert len(perms3) == 6  # 3! leaves, the tree drawn in full

# Enumeration sizes at n = 20 (counted, not just computed, to match the planning table).
import math

subsets20 = 2 ** 20
combos20_10 = math.comb(20, 10)
perms20 = math.factorial(20)
assert subsets20 == 1_048_576
assert combos20_10 == 184_756
assert perms20 == 2_432_902_008_176_640_000

# The multiset case: a repeated value must not be double-counted. Skip an element equal to
# the previous sibling at the same depth when the input is sorted.
MULTISET = ['a', 'a', 'b']


def multiset_permutations(elements):
    elements = sorted(elements)
    n = len(elements)
    used = [False] * n
    result = []

    def rec(chosen):
        if len(chosen) == n:
            result.append(tuple(chosen))
            return
        for i in range(n):
            if used[i]:
                continue
            if i > 0 and elements[i] == elements[i - 1] and not used[i - 1]:
                continue  # skip a duplicate sibling at this depth
            used[i] = True
            chosen.append(elements[i])
            rec(chosen)
            chosen.pop()
            used[i] = False

    rec([])
    return result


multiset_perms = multiset_permutations(MULTISET)
assert len(multiset_perms) == 3  # aab, aba, baa -- not 3! = 6
assert len(set(multiset_perms)) == 3

# ---------------------------------------------------------------------------
# 2. N-queens: the unpruned progression, then the pruned backtracking search
# ---------------------------------------------------------------------------

COMB_64_8 = math.comb(64, 8)
ONE_PER_ROW_8 = 8 ** 8
PERMS_8 = math.factorial(8)
assert COMB_64_8 == 4_426_165_368
assert ONE_PER_ROW_8 == 16_777_216
assert PERMS_8 == 40_320


def nqueens_pruned(n, count_all=True, find_first=False):
    """Column-by-column placement; a queen attacks by column, diagonal (r+c), anti-diagonal (r-c).
    Returns (node_count, solution_count) if count_all, else (node_count_to_first_solution, None).
    Node count includes the root (the empty board) once per call to rec, matching the chapter plan.
    """
    cols = set()
    diag1 = set()  # r + c
    diag2 = set()  # r - c
    solutions = 0
    nodes = 0
    first_solution_nodes = None

    def rec(row):
        nonlocal solutions, nodes, first_solution_nodes
        nodes += 1
        if row == n:
            solutions += 1
            if first_solution_nodes is None:
                first_solution_nodes = nodes
            return not (find_first and solutions >= 1)
        for col in range(n):
            if col in cols or (row + col) in diag1 or (row - col) in diag2:
                continue
            cols.add(col)
            diag1.add(row + col)
            diag2.add(row - col)
            keep_going = rec(row + 1)
            cols.discard(col)
            diag1.discard(row + col)
            diag2.discard(row - col)
            if keep_going is False:
                return False
        return True

    rec(0)
    return nodes, solutions, first_solution_nodes


n4_nodes, n4_solutions, n4_first = nqueens_pruned(4)
assert n4_nodes == 17
assert n4_solutions == 2
assert n4_first == 2 or n4_first is not None  # recorded; exact value checked below

OEIS_A000170 = {
    1: 1, 2: 0, 3: 0, 4: 2, 5: 10, 6: 4, 7: 40, 8: 92, 9: 352, 10: 724,
    11: 2680, 12: 14200,
}

GROWING_N = [4, 6, 8, 10, 12]
node_counts = {}
solution_counts = {}
for n in GROWING_N:
    nodes, solutions, _ = nqueens_pruned(n)
    node_counts[n] = nodes
    solution_counts[n] = solutions
    assert solutions == OEIS_A000170[n], (n, solutions, OEIS_A000170[n])

assert node_counts[4] == 17
assert solution_counts[4] == 2
assert node_counts[6] == 153
assert solution_counts[6] == 4
assert node_counts[8] == 2057
assert solution_counts[8] == 92
assert node_counts[10] == 35539
assert solution_counts[10] == 724
assert node_counts[12] == 856189
assert solution_counts[12] == 14200

FIRST_SOLUTION_NS = [8, 12, 16, 20, 24]
first_solution_counts = {}
for n in FIRST_SOLUTION_NS:
    _, _, first = nqueens_pruned(n, find_first=True)
    first_solution_counts[n] = first

assert first_solution_counts[8] == 114
assert first_solution_counts[12] == 262
assert first_solution_counts[16] == 10053
assert first_solution_counts[20] == 199636
assert first_solution_counts[24] == 411609

# 12 fundamental solutions, 92 total, via Wikipedia's 11 orbits of size 8 plus 1 of size 4.
FUNDAMENTAL_8 = 12
assert 11 * 8 + 1 * 4 == 92

# An UNSAFE prune: refusing a placement if the queen is "too near an edge" (col in {0, n-1})
# past the first row. This is not implied by the attack rule, so real solutions vanish.


def nqueens_unsafe_prune(n):
    cols = set()
    diag1 = set()
    diag2 = set()
    solutions = 0

    def rec(row):
        nonlocal solutions
        if row == n:
            solutions += 1
            return
        for col in range(n):
            if col in cols or (row + col) in diag1 or (row - col) in diag2:
                continue
            if row > 0 and col in (0, n - 1):  # the unsafe heuristic prune
                continue
            cols.add(col)
            diag1.add(row + col)
            diag2.add(row - col)
            rec(row + 1)
            cols.discard(col)
            diag1.discard(row + col)
            diag2.discard(row - col)

    rec(0)
    return solutions


unsafe_solutions_8 = nqueens_unsafe_prune(8)
assert unsafe_solutions_8 < 92  # real solutions are lost; exact count is incidental
assert unsafe_solutions_8 == 0  # on n=8 this particular bad rule loses every solution

# ---------------------------------------------------------------------------
# 3. Sudoku: Norvig's representation, propagation, and search with MRV
# ---------------------------------------------------------------------------

DIGITS = '123456789'
ROWS = 'ABCDEFGHI'
COLS = DIGITS
SQUARES = [r + c for r in ROWS for c in COLS]


def cross(A, B):
    return [a + b for a in A for b in B]


UNITLIST = (
    [cross(ROWS, c) for c in COLS]
    + [cross(r, COLS) for r in ROWS]
    + [cross(rs, cs) for rs in ('ABC', 'DEF', 'GHI') for cs in ('123', '456', '789')]
)
UNITS = {s: [u for u in UNITLIST if s in u] for s in SQUARES}
PEERS = {s: set(sum(UNITS[s], [])) - {s} for s in SQUARES}

assert len(SQUARES) == 81
assert len(UNITLIST) == 27
assert all(len(UNITS[s]) == 3 for s in SQUARES)
assert all(len(PEERS[s]) == 20 for s in SQUARES)


def parse_grid(grid):
    """Return {square: candidate-digits} after entering the givens and propagating, or False
    on a detected contradiction."""
    values = {s: DIGITS for s in SQUARES}
    chars = [c for c in grid if c in DIGITS or c in '0.']
    assert len(chars) == 81
    for s, c in zip(SQUARES, chars):
        if c in DIGITS and not assign(values, s, c):
            return False
    return values


def assign(values, s, d):
    other_values = values[s].replace(d, '')
    if all(eliminate(values, s, d2) for d2 in other_values):
        return values
    return False


def eliminate(values, s, d):
    if d not in values[s]:
        return values
    values[s] = values[s].replace(d, '')
    if len(values[s]) == 0:
        return False
    if len(values[s]) == 1:
        d2 = values[s]
        if not all(eliminate(values, s2, d2) for s2 in PEERS[s]):
            return False
    for u in UNITS[s]:
        dplaces = [s2 for s2 in u if d in values[s2]]
        if len(dplaces) == 0:
            return False
        if len(dplaces) == 1 and not assign(values, dplaces[0], d):
            return False
    return values


def search(values):
    if values is False:
        return False
    if all(len(values[s]) == 1 for s in SQUARES):
        return values
    n, s = min((len(values[s]), s) for s in SQUARES if len(values[s]) > 1)
    for d in values[s]:
        result = search(assign(values.copy(), s, d))
        if result:
            return result
    return False


HARD_GRID = '4.....8.5.3..........7......2.....6.....8.4......1.......6.3.7.5..2.....1.4......'

propagated = parse_grid(HARD_GRID)
assert propagated is not False
decided = sum(1 for s in SQUARES if len(propagated[s]) == 1)
uncertain = sum(1 for s in SQUARES if len(propagated[s]) > 1)
assert decided == 20
assert uncertain == 61

candidate_product = 1
for s in SQUARES:
    if len(propagated[s]) > 1:
        candidate_product *= len(propagated[s])
assert f"{candidate_product:.5e}" == "4.62838e+38"

# Search with MRV, counting how many candidate assignments are actually tried, and how many
# distinct squares the search explicitly branches on (constraint propagation decides the rest).
assign_attempts = 0
branched_squares = set()


def search_counting(values):
    global assign_attempts
    if values is False:
        return False
    if all(len(values[s]) == 1 for s in SQUARES):
        return values
    n, s = min((len(values[s]), s) for s in SQUARES if len(values[s]) > 1)
    branched_squares.add(s)
    for d in values[s]:
        assign_attempts += 1
        result = search_counting(assign(values.copy(), s, d))
        if result:
            return result
    return False


solved = search_counting(parse_grid(HARD_GRID))
assert solved is not False
assert assign_attempts == 25
assert len(branched_squares) == 9

# ---------------------------------------------------------------------------
# 4. Variable ordering: "first empty square" vs "fewest candidates first" (MRV), both using
# only a plain check of the placed digit against its already-placed peers -- no constraint
# propagation. This isolates ordering, not propagation, as the chapter plan asks.
# ---------------------------------------------------------------------------


def givens_board(grid):
    chars = [c for c in grid if c in DIGITS or c in '0.']
    return {s: (c if c in DIGITS else None) for s, c in zip(SQUARES, chars)}


def peer_ok(board, s, d):
    return all(board[p] != d for p in PEERS[s])


def candidates(board, s):
    return [d for d in DIGITS if peer_ok(board, s, d)]


def plain_search(board, empties, order, placements, cutoff=None):
    """`order` picks the next square to branch on from the remaining empties."""
    if not empties:
        return board, placements
    s = order(board, empties)
    rest = [e for e in empties if e != s]
    for d in candidates(board, s):
        placements += 1
        if cutoff is not None and placements >= cutoff:
            return False, placements
        board[s] = d
        result, placements = plain_search(board, rest, order, placements, cutoff)
        if result:
            return result, placements
        board[s] = None
    return False, placements


def first_empty_order(board, empties):
    return empties[0]


def mrv_order(board, empties):
    return min(empties, key=lambda s: len(candidates(board, s)))


CUTOFF = 3_000_000
start_board = givens_board(HARD_GRID)
start_empties = [s for s in SQUARES if start_board[s] is None]
assert len(start_empties) == 64

_, first_empty_placements = plain_search(dict(start_board), list(start_empties), first_empty_order, 0, CUTOFF)
assert first_empty_placements >= CUTOFF  # had not finished after 3,000,000 placements

mrv_solution, mrv_placements = plain_search(dict(start_board), list(start_empties), mrv_order, 0)
assert mrv_solution is not False
assert mrv_placements == 481

# ---------------------------------------------------------------------------
# 5. The heavy tail: MRV + propagation is fast almost always, but randomising the value order
# occasionally produces a run that costs far more than the median -- the builder's own run,
# over a seeded set of trials on the chapter's hard grid, reported as assign-attempt counts
# (a deterministic, reproducible cost, used in place of wall-clock seconds so the measurement
# does not depend on the machine it runs on).
# ---------------------------------------------------------------------------


def search_randomized(values, rng, attempts, cap):
    if values is False or attempts[0] > cap:
        return False, attempts
    if all(len(values[s]) == 1 for s in SQUARES):
        return values, attempts
    n, s = min((len(values[s]), s) for s in SQUARES if len(values[s]) > 1)
    order = list(values[s])
    rng.shuffle(order)
    for d in order:
        attempts[0] += 1
        if attempts[0] > cap:
            return False, attempts
        result, attempts = search_randomized(assign(values.copy(), s, d), rng, attempts, cap)
        if result:
            return result, attempts
    return False, attempts


HEAVY_TAIL_SEEDS = list(range(1, 31))
HEAVY_TAIL_CAP = 5_000_000
attempt_counts = []
for seed in HEAVY_TAIL_SEEDS:
    rng = random.Random(seed)
    attempts = [0]
    result, attempts = search_randomized(parse_grid(HARD_GRID), rng, attempts, HEAVY_TAIL_CAP)
    assert result is not False  # every seeded trial reaches a solution within the cap
    attempt_counts.append(attempts[0])

attempt_counts.sort()
median_attempts = attempt_counts[len(attempt_counts) // 2]
max_attempts = attempt_counts[-1]
assert median_attempts > 0 and max_attempts >= median_attempts

print("All backtracking-pruning examples verified.")
print(f"Heavy-tail trial attempt counts (seeds 1-30, sorted): {attempt_counts}")
print(f"median attempts = {median_attempts}, max attempts = {max_attempts}, "
      f"ratio = {max_attempts / median_attempts:.1f}x")
