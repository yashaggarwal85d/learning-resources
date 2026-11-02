"""
de.data-layout-sorting-z -- real demonstrations of why data layout, not just
file size, decides whether a predicate's statistics actually prune anything.

A real 256-row, two-column dataset (every (a, b) pair for a, b in 0..15) is
laid out three real ways -- arrival order, a linear sort by (a, b), and a
real Z-order (bit-interleaved Morton order) -- split into real row groups of
16 rows each, exactly as a columnar file's row groups carry real per-group
min/max statistics. The identical real two-column range predicate is then
evaluated against each layout's real group bounds, and the number of groups
that cannot be pruned is counted directly -- not asserted, computed.

Four real demonstrations:
  1. All three layouts hold the exact same 256 rows -- only their order
     changes, verified by real set equality.
  2. Each layout's real row-group bounds (min/max a, min/max b per group)
     are computed directly from the real row data.
  3. The identical two-column range predicate is evaluated for real against
     each layout: arrival order needs nearly every group; a linear sort by
     (a, b) prunes on the leading column only; a real Z-order prunes to a
     single group.
  4. Incremental versus full reclustering, reproduced for real: adding new
     rows to an already Z-ordered table and reclustering incrementally only
     rewrites the one group they land in; a full reclustering rewrites
     every row in the table.
"""

DOMAIN = 16  # a, b each range over 0..15 (4 bits)
GROUP_SIZE = 16
PRED_A = (4, 7)
PRED_B = (4, 7)


def all_rows():
    return [(a, b) for a in range(DOMAIN) for b in range(DOMAIN)]


def unsorted_order(rows):
    """A fixed, deterministic scramble standing in for arrival order: no
    relationship between a row's position and its (a, b) values."""
    def key(row):
        a, b = row
        idx = a * DOMAIN + b
        return (idx * 131) % (DOMAIN * DOMAIN)  # 131 is coprime with 256: a real permutation
    return sorted(rows, key=key)


def linear_sort_order(rows):
    return sorted(rows, key=lambda row: (row[0], row[1]))


def interleave_bits(a, b, bits=4):
    """A real Morton (Z-order) code: interleave a's and b's bits, a's bit
    first at each position, most-significant pair first."""
    z = 0
    for i in range(bits - 1, -1, -1):
        z = (z << 1) | ((a >> i) & 1)
        z = (z << 1) | ((b >> i) & 1)
    return z


def z_order(rows):
    return sorted(rows, key=lambda row: interleave_bits(row[0], row[1]))


def row_groups(ordered_rows, group_size=GROUP_SIZE):
    groups = []
    for i in range(0, len(ordered_rows), group_size):
        chunk = ordered_rows[i : i + group_size]
        a_vals = [r[0] for r in chunk]
        b_vals = [r[1] for r in chunk]
        groups.append({"rows": chunk, "min_a": min(a_vals), "max_a": max(a_vals), "min_b": min(b_vals), "max_b": max(b_vals)})
    return groups


def group_overlaps_predicate(group, a_range=PRED_A, b_range=PRED_B):
    a_lo, a_hi = a_range
    b_lo, b_hi = b_range
    if group["max_a"] < a_lo or group["min_a"] > a_hi:
        return False
    if group["max_b"] < b_lo or group["min_b"] > b_hi:
        return False
    return True


def groups_needing_scan(groups):
    return [g for g in groups if group_overlaps_predicate(g)]


# --- Demonstration 1: all three layouts hold the exact same rows ----------

def demo_same_rows_different_order():
    rows = all_rows()
    assert len(rows) == 256

    unsorted_rows = unsorted_order(rows)
    linear_rows = linear_sort_order(rows)
    z_rows = z_order(rows)

    assert set(unsorted_rows) == set(rows)
    assert set(linear_rows) == set(rows)
    assert set(z_rows) == set(rows)
    assert unsorted_rows != linear_rows  # genuinely different physical order
    assert linear_rows != z_rows

    return rows, unsorted_rows, linear_rows, z_rows


# --- Demonstration 2: real row-group bounds, computed directly ------------

def demo_row_group_bounds(unsorted_rows, linear_rows, z_rows):
    unsorted_groups = row_groups(unsorted_rows)
    linear_groups = row_groups(linear_rows)
    z_groups = row_groups(z_rows)

    assert len(unsorted_groups) == 16
    assert len(linear_groups) == 16
    assert len(z_groups) == 16

    # The linear sort's groups align exactly with single a-values: 16 rows
    # of the same a, every b from 0 to 15.
    for g in linear_groups:
        assert g["min_a"] == g["max_a"]
        assert g["min_b"] == 0
        assert g["max_b"] == 15

    return unsorted_groups, linear_groups, z_groups


# --- Demonstration 3: the identical two-column predicate, measured for
#     real against each layout's real group bounds -------------------------

def demo_predicate_pruning_measured(unsorted_groups, linear_groups, z_groups):
    unsorted_scan = groups_needing_scan(unsorted_groups)
    linear_scan = groups_needing_scan(linear_groups)
    z_scan = groups_needing_scan(z_groups)

    assert len(unsorted_scan) == 16
    assert len(linear_scan) == 4
    assert len(z_scan) == 1

    return len(unsorted_scan), len(linear_scan), len(z_scan)


# --- Demonstration 4: incremental versus full reclustering, measured for
#     real by rows actually rewritten --------------------------------------

def demo_incremental_vs_full_reclustering(z_groups):
    new_rows = [(a, b) for a in range(4, 8) for b in range(4, 8)]
    assert len(new_rows) == 16

    landing_groups = set()
    for row in new_rows:
        z = interleave_bits(row[0], row[1])
        for idx, g in enumerate(z_groups):
            g_vals = [interleave_bits(r[0], r[1]) for r in g["rows"]]
            if min(g_vals) <= z <= max(g_vals):
                landing_groups.add(idx)
                break

    assert len(landing_groups) == 1  # all 16 new rows land in the same single existing group

    touched_existing_rows = sum(len(z_groups[idx]["rows"]) for idx in landing_groups)
    incremental_rewritten = touched_existing_rows + len(new_rows)
    full_rewritten = sum(len(g["rows"]) for g in z_groups) + len(new_rows)

    assert incremental_rewritten == 32
    assert full_rewritten == 272
    assert incremental_rewritten < full_rewritten

    return incremental_rewritten, full_rewritten


if __name__ == "__main__":
    rows, unsorted_rows, linear_rows, z_rows = demo_same_rows_different_order()
    unsorted_groups, linear_groups, z_groups = demo_row_group_bounds(unsorted_rows, linear_rows, z_rows)
    unsorted_n, linear_n, z_n = demo_predicate_pruning_measured(unsorted_groups, linear_groups, z_groups)
    incremental_rewritten, full_rewritten = demo_incremental_vs_full_reclustering(z_groups)

    print("same 256 rows, three real physical orders:")
    print(f"  total rows: {len(rows)}")
    print()
    print("real row groups (16 rows each):")
    print(f"  groups per layout: {len(unsorted_groups)}")
    print()
    print("the identical two-column predicate (a in 4..7, b in 4..7), groups that must be scanned:")
    print(f"  arrival order: {unsorted_n} of 16 groups")
    print(f"  linear sort by (a, b): {linear_n} of 16 groups")
    print(f"  Z-order: {z_n} of 16 groups")
    print()
    print("incremental vs. full reclustering, rows actually rewritten:")
    print(f"  incremental: {incremental_rewritten}")
    print(f"  full: {full_rewritten}")
    print()
    print("All assertions passed.")
