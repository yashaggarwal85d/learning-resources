import random
from collections import Counter, defaultdict
from fractions import Fraction


# --- Word count: three map tasks, a Zipf-skewed vocabulary, R = 2 reduce tasks. ---

WORDS_ZIPF = (
    ["the"] * 40 + ["a"] * 20 + ["and"] * 14 + ["parallel"] * 6 + ["reduce"] * 4
    + ["shuffle"] * 3 + ["map"] * 3 + ["key"] * 2 + ["value"] * 2 + ["combiner"] * 1
)

rng = random.Random(7)
MAP_TASKS = [rng.sample(WORDS_ZIPF, k=30) for _ in range(3)]
R = 2


def partition_function(key, r):
    return hash(key) % r


def map_phase(tasks):
    """Each map task emits (word, 1) for every word it sees."""
    return [[(w, 1) for w in task] for task in tasks]


def shuffle_no_combiner(mapped):
    records_shuffled = 0
    buckets = defaultdict(list)
    for task_output in mapped:
        for key, value in task_output:
            buckets[partition_function(key, R)].append((key, value))
            records_shuffled += 1
    return buckets, records_shuffled


def shuffle_with_combiner(mapped):
    records_shuffled = 0
    buckets = defaultdict(list)
    for task_output in mapped:
        combined = Counter()
        for key, value in task_output:
            combined[key] += value
        for key, value in combined.items():
            buckets[partition_function(key, R)].append((key, value))
            records_shuffled += 1
    return buckets, records_shuffled


def reduce_phase(buckets):
    result = {}
    for bucket in buckets.values():
        counts = Counter()
        for key, value in bucket:
            counts[key] += value
        result.update(counts)
    return result


MAPPED = map_phase(MAP_TASKS)
TOTAL_WORDS = sum(len(task) for task in MAP_TASKS)
DISTINCT_WORDS = len(set(w for task in MAP_TASKS for w in task))

BUCKETS_NO_COMBINER, RECORDS_NO_COMBINER = shuffle_no_combiner(MAPPED)
BUCKETS_WITH_COMBINER, RECORDS_WITH_COMBINER = shuffle_with_combiner(MAPPED)

RESULT_NO_COMBINER = reduce_phase(BUCKETS_NO_COMBINER)
RESULT_WITH_COMBINER = reduce_phase(BUCKETS_WITH_COMBINER)

assert RESULT_NO_COMBINER == RESULT_WITH_COMBINER  # the combiner must not change the answer
assert RECORDS_NO_COMBINER == TOTAL_WORDS  # one record per word, with no combiner
assert RECORDS_WITH_COMBINER < RECORDS_NO_COMBINER  # the combiner shrinks the shuffle
assert RECORDS_WITH_COMBINER <= DISTINCT_WORDS * len(MAP_TASKS)  # at most one record per distinct word per map task


# --- The non-combinable reduce: the mean is not associative. ---

def mean(values):
    return sum(values) / len(values)


A, B, C = [2.0, 4.0], [10.0], [100.0, 0.0, 0.0, 0.0]
WRONG_COMBINED_MEAN = mean([mean(A), mean(B), mean(C)])
TRUE_MEAN = mean(A + B + C)
assert WRONG_COMBINED_MEAN != TRUE_MEAN  # mean(mean(a), mean(b), mean(c)) != mean(a + b + c)
assert abs(WRONG_COMBINED_MEAN - TRUE_MEAN) > 1.0  # not a rounding-error-sized gap


def combinable_sum_count(groups):
    """The fix: combine (sum, count) pairs, and divide only in the final reduce."""
    total_sum = sum(sum(g) for g in groups)
    total_count = sum(len(g) for g in groups)
    return total_sum / total_count


FIXED_MEAN = combinable_sum_count([A, B, C])
assert FIXED_MEAN == TRUE_MEAN


# --- Rounds in the MPC model: a tiny simulated cluster, p = 4 servers. ---

def chain_join_rounds_and_load(n_s1, n_s2, p):
    """L2 = S1(x,y), S2(y,z): a chain join computable in one round with no replication
    (space exponent 0) by partitioning on the shared join attribute y."""
    # Partition both relations by y across p servers: each server gets its share of each side.
    load_per_server = (n_s1 + n_s2) / p
    rounds = 1
    replication_factor = 1  # no replication needed for a chain join on the shared attribute
    return rounds, load_per_server, replication_factor


def triangle_query_rounds_and_load(n, p):
    """The triangle query R(x,y), S(y,z), T(z,x) needs replication: space exponent 1/3
    (Beame, Koutris and Suciu's own result), simulated here as p^(1/3)-way replication."""
    replication_factor = round(p ** (1 / 3))
    rounds = 1
    load_per_server = (3 * n * replication_factor) / p
    return rounds, load_per_server, replication_factor


N_RELATION = 10_000
P_SERVERS = 4

CHAIN_ROUNDS, CHAIN_LOAD, CHAIN_REPLICATION = chain_join_rounds_and_load(N_RELATION, N_RELATION, P_SERVERS)
TRIANGLE_ROUNDS, TRIANGLE_LOAD, TRIANGLE_REPLICATION = triangle_query_rounds_and_load(N_RELATION, P_SERVERS)

assert CHAIN_ROUNDS == 1
assert CHAIN_REPLICATION == 1  # space exponent 0: no replication
assert TRIANGLE_ROUNDS == 1
assert TRIANGLE_REPLICATION > CHAIN_REPLICATION  # the triangle needs real replication, the chain does not


# --- Transitive closure needs more than one round (stated, not simulated at scale). ---
# A chain of n dependent edges needs at least log2(n) rounds of "double the reachable prefix"
# even in an idealized doubling scheme, which is not O(1) as n grows - the structural reason
# BKS's result (quoted in SOURCES.md) gives for ruling out a constant round count.

def doubling_rounds_needed(chain_length):
    rounds = 0
    reached = 1
    while reached < chain_length:
        reached *= 2
        rounds += 1
    return rounds


CHAIN_LENGTHS = [2 ** k for k in range(4, 21)]
DOUBLING_ROUNDS = [doubling_rounds_needed(n) for n in CHAIN_LENGTHS]
assert DOUBLING_ROUNDS == list(range(4, 21))  # rounds grow with the chain length, not bounded
assert DOUBLING_ROUNDS[-1] > DOUBLING_ROUNDS[0]


if __name__ == "__main__":
    print("Total words:", TOTAL_WORDS, "distinct:", DISTINCT_WORDS)
    print("Records shuffled without combiner:", RECORDS_NO_COMBINER)
    print("Records shuffled with combiner:", RECORDS_WITH_COMBINER)
    print("Results agree:", RESULT_NO_COMBINER == RESULT_WITH_COMBINER)
    print("Wrong combined mean:", WRONG_COMBINED_MEAN, "true mean:", TRUE_MEAN, "fixed mean:", FIXED_MEAN)
    print("Chain join: rounds", CHAIN_ROUNDS, "load/server", CHAIN_LOAD, "replication", CHAIN_REPLICATION)
    print("Triangle query: rounds", TRIANGLE_ROUNDS, "load/server", TRIANGLE_LOAD, "replication", TRIANGLE_REPLICATION)
    print("Doubling rounds for growing chain lengths:", DOUBLING_ROUNDS)
