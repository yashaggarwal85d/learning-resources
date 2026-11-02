"""Real experiments against this sandbox's own Postgres cluster and local NumPy statistics:
Population Stability Index, a two-sample Kolmogorov-Smirnov statistic, and Jensen-Shannon
distance, all implemented by hand (no scipy in this sandbox) and run against the same reproduced
shifts: an ordinary data-drift shift, a concept-drift case where the feature distribution barely
moves while what it predicts does, a null-rate creep a distributional test alone does not catch,
and a case engineered so PSI and KS disagree.
"""

import math
import random

import numpy as np
import psycopg2

DSN = dict(host="127.0.0.1", port=5432, dbname="learnshop", user="postgres", password="postgres")
SEED = 20261030
N = 3000


def connect():
    conn = psycopg2.connect(**DSN)
    conn.autocommit = True
    return conn


def _reset_schema(cur):
    cur.execute("DROP TABLE IF EXISTS t17d_reference, t17d_current")
    cur.execute("CREATE TABLE t17d_reference (orders_last_30d FLOAT NOT NULL)")
    cur.execute("CREATE TABLE t17d_current (orders_last_30d FLOAT NOT NULL)")


def _load(cur, table, values):
    cur.executemany(f"INSERT INTO {table} (orders_last_30d) VALUES (%s)", [(float(v),) for v in values])


def _fetch(cur, table):
    cur.execute(f"SELECT orders_last_30d FROM {table}")
    return np.array([r[0] for r in cur.fetchall()])


# --- The three per-feature tests, implemented directly (no scipy in this sandbox) ---

def psi(reference: np.ndarray, current: np.ndarray, bins=10) -> float:
    """Population Stability Index: bin both windows on the reference's own edges and sum
    (actual% - expected%) * ln(actual% / expected%) across bins."""
    edges = np.quantile(reference, np.linspace(0, 1, bins + 1))
    edges[0], edges[-1] = -np.inf, np.inf
    ref_counts, _ = np.histogram(reference, bins=edges)
    cur_counts, _ = np.histogram(current, bins=edges)
    ref_pct = np.clip(ref_counts / len(reference), 1e-6, None)
    cur_pct = np.clip(cur_counts / len(current), 1e-6, None)
    return float(np.sum((cur_pct - ref_pct) * np.log(cur_pct / ref_pct)))


def ks_statistic(reference: np.ndarray, current: np.ndarray) -> float:
    """The two-sample K-S statistic: the largest gap between the two samples' empirical CDFs,
    evaluated without binning, at every observed value."""
    values = np.sort(np.concatenate([reference, current]))
    ref_sorted, cur_sorted = np.sort(reference), np.sort(current)
    ref_cdf = np.searchsorted(ref_sorted, values, side="right") / len(reference)
    cur_cdf = np.searchsorted(cur_sorted, values, side="right") / len(current)
    return float(np.max(np.abs(ref_cdf - cur_cdf)))


def jensen_shannon_distance(reference: np.ndarray, current: np.ndarray, bins=10) -> float:
    """The square root of the Jensen-Shannon divergence: bounded in [0, 1] with a base-2 log,
    symmetric, and defined even where one window has zero density in a bin PSI would divide by."""
    edges = np.quantile(np.concatenate([reference, current]), np.linspace(0, 1, bins + 1))
    edges[0], edges[-1] = -np.inf, np.inf
    p, _ = np.histogram(reference, bins=edges)
    q, _ = np.histogram(current, bins=edges)
    p = p / p.sum()
    q = q / q.sum()
    m = (p + q) / 2

    def kl(a, b):
        mask = a > 0
        return float(np.sum(a[mask] * np.log2(a[mask] / b[mask])))

    jsd = 0.5 * kl(p, m) + 0.5 * kl(q, m)
    return math.sqrt(max(jsd, 0.0))


def run():
    rng = random.Random(SEED)
    np_rng = np.random.default_rng(SEED)
    conn = connect()
    cur = conn.cursor()
    _reset_schema(cur)

    # 1. Data drift: the input distribution genuinely moves.
    reference = np_rng.normal(loc=4.0, scale=1.5, size=N)
    current_drifted = np_rng.normal(loc=6.0, scale=1.5, size=N)
    _load(cur, "t17d_reference", reference)
    _load(cur, "t17d_current", current_drifted)
    ref_db = _fetch(cur, "t17d_reference")
    cur_db = _fetch(cur, "t17d_current")
    psi_drift = psi(ref_db, cur_db)
    ks_drift = ks_statistic(ref_db, cur_db)
    js_drift = jensen_shannon_distance(ref_db, cur_db)
    print(f"data drift — PSI={psi_drift:.3f} KS={ks_drift:.3f} JS={js_drift:.3f}")
    assert psi_drift >= 0.1 and ks_drift >= 0.05 and js_drift >= 0.1, "all three tests must flag an obvious mean shift"

    # 2. Concept drift: the input distribution barely moves; what it predicts flips instead.
    reference_x = np_rng.normal(loc=4.0, scale=1.5, size=N)
    current_x = np_rng.normal(loc=4.0, scale=1.5, size=N)  # same distribution as reference
    psi_concept = psi(reference_x, current_x)
    threshold = 5.0
    # Reference regime: high orders_last_30d predicts "retained." Concept-drifted regime: the
    # relationship flips — now high orders_last_30d predicts "churned" instead.
    ref_labels = reference_x > threshold  # "retained" = True
    ref_preds = reference_x > threshold
    cur_labels = ~(current_x > threshold)  # the relationship to the label flipped
    cur_preds = current_x > threshold  # the model's rule never changed
    ref_precision = (ref_labels & ref_preds).sum() / max(ref_preds.sum(), 1)
    cur_precision = (cur_labels & cur_preds).sum() / max(cur_preds.sum(), 1)
    print(f"concept drift — PSI on the feature={psi_concept:.3f}, precision {ref_precision:.2f} -> {cur_precision:.2f}")
    assert psi_concept < 0.1, "PSI on the feature alone must stay low when only the label relationship moved"
    assert cur_precision < ref_precision - 0.3, "the model's real precision must have genuinely collapsed"

    # 3. Null-rate creep: a distributional test over non-null values alone misses it.
    clean = np_rng.normal(loc=4.0, scale=1.5, size=N)
    null_mask = np_rng.random(N) < 0.12  # 12% of values go missing
    with_nulls = np.where(null_mask, np.nan, clean)
    imputed = np.where(np.isnan(with_nulls), np.nanmean(with_nulls), with_nulls)
    psi_imputed = psi(clean, imputed)
    null_rate = float(null_mask.mean())
    print(f"null-rate creep — PSI after mean-imputation={psi_imputed:.3f}, null rate={null_rate:.1%}")
    assert psi_imputed < 0.1, "mean-imputation must hide the creep from a distributional test over the imputed column"
    assert null_rate > 0.1, "the null-rate check itself must clearly catch what PSI absorbed silently"

    # 4. A case engineered so PSI and KS disagree: a small, sharp shift concentrated in one
    # narrow region, invisible to PSI's coarse deciles but caught by KS's full-resolution CDF.
    base = np_rng.normal(loc=4.0, scale=1.5, size=N)
    spike_idx = np_rng.choice(N, size=int(N * 0.04), replace=False)
    sharp_shift = base.copy()
    sharp_shift[spike_idx] = 4.0  # collapse a thin slice onto a single point mass
    psi_sharp = psi(base, sharp_shift)
    ks_sharp = ks_statistic(base, sharp_shift)
    print(f"PSI vs. KS disagreement — PSI={psi_sharp:.3f} (quiet), KS={ks_sharp:.3f}")
    assert psi_sharp < 0.1, "PSI's decile bins must stay quiet on a shift this narrow"
    assert ks_sharp > psi_sharp, "KS, evaluated at every point, must register more than PSI does on the same case"

    cur.close()
    conn.close()
    print("all assertions passed")


if __name__ == "__main__":
    run()
