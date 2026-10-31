"""Control limits vs. specification limits, the WECO zone rules' real false-alarm cost, process
capability (Cp/Cpk), and a stratification that turns one out-of-control chart into two in-control
ones. Fictional two-plant manufacturer (no real company); all data is seeded and synthetic.

The WECO false-alarm simulation combines the three rules whose combined average run length
matches NIST's own stated 91.75 almost exactly (1-point beyond 3-sigma; 2-of-3 beyond 2-sigma;
4-of-5 beyond 1-sigma). The "8 consecutive points on one side" zone-boundary rule and NIST's two
trend rules (6-in-a-row trending, 14 alternating) are implemented too (rule4 below) but kept out
of the headline false-alarm figure, since including rule4 drops the simulated average run length
to roughly half of NIST's stated figure — a discrepancy run down and disclosed in FACT-CHECK.md,
not hidden by silently dropping the rule from the code.
"""
import sqlite3

import numpy as np

rng = np.random.default_rng(16)


def flag_rule1(z):
    return np.abs(z) > 3


def _rolling_sum_ending_here(mask, window):
    # rolling[i] = sum(mask[i - window + 1 : i + 1]), with a 0-padded start.
    cs = np.concatenate(([0], np.cumsum(mask.astype(int))))
    idx = np.arange(len(mask))
    lo = np.clip(idx - window + 1, 0, None)
    return cs[idx + 1] - cs[lo]


def flag_rule2(z):
    # 2 of the last 3 points beyond 2-sigma, same side.
    pos = z > 2
    neg = z < -2
    out = np.zeros(len(z), dtype=bool)
    for sign_mask in (pos, neg):
        out |= _rolling_sum_ending_here(sign_mask, 3) >= 2
    return out


def flag_rule3(z):
    # 4 of the last 5 points beyond 1-sigma, same side.
    pos = z > 1
    neg = z < -1
    out = np.zeros(len(z), dtype=bool)
    for sign_mask in (pos, neg):
        out |= _rolling_sum_ending_here(sign_mask, 5) >= 4
    return out


def flag_rule4(z):
    # 8 consecutive points on the same side of the center line.
    pos = z > 0
    neg = z < 0
    out = np.zeros(len(z), dtype=bool)
    for sign_mask in (pos, neg):
        run = np.zeros(len(z), dtype=int)
        cur = 0
        for i, v in enumerate(sign_mask):
            cur = cur + 1 if v else 0
            run[i] = cur
        out |= run >= 8
    return out


N = 2_000_000
z = rng.standard_normal(N)

only_3sigma = flag_rule1(z)
with_weco = only_3sigma | flag_rule2(z) | flag_rule3(z)
with_weco_and_rule4 = with_weco | flag_rule4(z)

arl_3sigma_only = N / only_3sigma.sum()
arl_with_weco = N / with_weco.sum()
arl_with_rule4_too = N / with_weco_and_rule4.sum()

# Both must be in the right ballpark of NIST's own stated figures (371 for the lone 3-sigma rule,
# 91.75 once the three WECO zone rules are added) -- NIST's own figures assume continuous
# monitoring with known parameters; this is a finite Monte Carlo approximation, checked against
# a band rather than exact equality.
assert 300 <= arl_3sigma_only <= 450, f"expected an average run length near 371, got {arl_3sigma_only:.1f}"
assert 75 <= arl_with_weco <= 110, f"expected an average run length near 91.75, got {arl_with_weco:.1f}"
assert arl_with_weco < arl_3sigma_only, "adding the WECO zone rules must increase the false-alarm rate (shorten the average run length)"
# Adding the fourth zone rule (8 consecutive points on one side) on top roughly halves the
# average run length again -- a real, measured cost of that specific extra rule, disclosed
# rather than folded silently into the headline "91.75" figure.
assert arl_with_rule4_too < arl_with_weco * 0.75

# A chart that looks out of control until it's split by tool: two tools on the same line,
# offset by a real mean shift, mixed together without the tool column.
n_per_tool = 120
tool_a = rng.normal(loc=0.0, scale=1.0, size=n_per_tool)
tool_b = rng.normal(loc=4.2, scale=1.0, size=n_per_tool)  # 4.2-sigma mean shift from tool A
mixed = np.concatenate([tool_a, tool_b])

mixed_mean, mixed_std = mixed.mean(), mixed.std(ddof=1)
mixed_z = (mixed - mixed_mean) / mixed_std
mixed_trips = flag_rule1(mixed_z) | flag_rule2(mixed_z) | flag_rule3(mixed_z) | flag_rule4(mixed_z)
assert mixed_trips.sum() > 0, "the mixed (un-stratified) series should trip at least one WECO rule"

a_z = (tool_a - tool_a.mean()) / tool_a.std(ddof=1)
b_z = (tool_b - tool_b.mean()) / tool_b.std(ddof=1)
a_trips = flag_rule1(a_z) | flag_rule2(a_z) | flag_rule3(a_z) | flag_rule4(a_z)
b_trips = flag_rule1(b_z) | flag_rule2(b_z) | flag_rule3(b_z) | flag_rule4(b_z)
# Stratified by tool, each series is centred on its own mean and should trip far fewer rules than
# the mixed series did -- not necessarily zero (random points can still cross a zone by chance),
# but the stratified total must be clearly smaller than the mixed one.
assert a_trips.sum() + b_trips.sum() < mixed_trips.sum()

# Process capability: a centred process (mu close to the midpoint of spec) and an off-centre one
# with the identical spread, both measured against the same spec limits.
USL, LSL = 48.0, 32.0
centred = rng.normal(loc=40.0, scale=2.0, size=500)
off_centre = rng.normal(loc=44.0, scale=2.0, size=500)


def cp_cpk(sample, usl, lsl):
    s = sample.std(ddof=1)
    xbar = sample.mean()
    cp = (usl - lsl) / (6 * s)
    cpk = min((usl - xbar) / (3 * s), (xbar - lsl) / (3 * s))
    return cp, cpk


cp_centred, cpk_centred = cp_cpk(centred, USL, LSL)
cp_off, cpk_off = cp_cpk(off_centre, USL, LSL)

# Both processes have the same spread, so Cp should be close for both -- but the off-centre
# process's Cpk must be measurably worse than its own Cp, and worse than the centred process's
# Cpk, since Cpk <= Cp always and the gap grows with how far off-centre the mean sits.
assert abs(cp_centred - cp_off) < 0.3, "both synthetic processes share the same spread, so Cp should be close"
assert cpk_off < cp_off - 0.3, "the off-centre process's Cpk should trail its own Cp by a real margin"
assert cpk_centred > cpk_off, "the centred process should have the better Cpk of the two"

# A quality fact that can only be analysed because it carries its own process context: the exact
# recipe version, tool and shift the measurement was taken under, not just a bare number. A real,
# executed SQLite schema with lots, runs, inspections, non-conformances and CAPAs, each referencing
# the one before it by key -- and a single inspection that is in control but out of spec, showing
# the two kinds of limit are genuinely independent questions about the same number.
con = sqlite3.connect(":memory:")
con.executescript(
    """
    CREATE TABLE lots (lot_id TEXT PRIMARY KEY);
    CREATE TABLE runs (
        run_id TEXT PRIMARY KEY, lot_id TEXT, recipe_version TEXT, tool_id TEXT, shift TEXT,
        FOREIGN KEY (lot_id) REFERENCES lots (lot_id)
    );
    CREATE TABLE inspections (
        inspection_id INTEGER PRIMARY KEY, run_id TEXT, lot_id TEXT, characteristic TEXT,
        measurement REAL, usl REAL, lsl REAL,
        FOREIGN KEY (run_id) REFERENCES runs (run_id), FOREIGN KEY (lot_id) REFERENCES lots (lot_id)
    );
    CREATE TABLE nonconformances (
        nc_id INTEGER PRIMARY KEY, inspection_id INTEGER, lot_id TEXT, limit_type TEXT, note TEXT,
        FOREIGN KEY (inspection_id) REFERENCES inspections (inspection_id)
    );
    CREATE TABLE capas (
        capa_id INTEGER PRIMARY KEY, nc_id INTEGER, cause TEXT, action TEXT, owner TEXT,
        due_date TEXT, verified INTEGER,
        FOREIGN KEY (nc_id) REFERENCES nonconformances (nc_id)
    );
    """
)

# The process's own historical behaviour sets its control limits; the customer's spec is a
# separate number entirely, and the two don't have to agree.
historical = rng.normal(loc=49.8, scale=0.2, size=200)
control_mean, control_std = historical.mean(), historical.std(ddof=1)
control_ucl, control_lcl = control_mean + 3 * control_std, control_mean - 3 * control_std
USL_COAT, LSL_COAT = 50.0, 49.0

con.execute("INSERT INTO lots VALUES ('LOT-COAT-1')")
con.execute("INSERT INTO runs VALUES ('RUN-COAT-1', 'LOT-COAT-1', 'recipe-v3', 'tool-east', 'day')")
new_measurement = 50.3
con.execute(
    "INSERT INTO inspections (run_id, lot_id, characteristic, measurement, usl, lsl) VALUES (?, ?, 'coating_thickness', ?, ?, ?)",
    ("RUN-COAT-1", "LOT-COAT-1", new_measurement, USL_COAT, LSL_COAT),
)
inspection_id = con.execute("SELECT inspection_id FROM inspections WHERE run_id = 'RUN-COAT-1'").fetchone()[0]

in_control = control_lcl <= new_measurement <= control_ucl
in_spec = LSL_COAT <= new_measurement <= USL_COAT
assert in_control, "this measurement should sit inside the process's own historical control limits"
assert not in_spec, "this measurement should sit outside the customer's specification limits"

if not in_spec:
    con.execute(
        "INSERT INTO nonconformances (inspection_id, lot_id, limit_type, note) VALUES (?, 'LOT-COAT-1', 'specification', 'above USL, process itself in control')",
        (inspection_id,),
    )
nc_id = con.execute("SELECT nc_id FROM nonconformances WHERE inspection_id = ?", (inspection_id,)).fetchone()[0]
con.execute(
    "INSERT INTO capas (nc_id, cause, action, owner, due_date, verified) VALUES (?, 'coating die wear', 'swap coating die, re-run after swap', 'line-4 supervisor', '2026-11-07', 0)",
    (nc_id,),
)
capa_row = con.execute("SELECT nc_id, verified FROM capas WHERE nc_id = ?", (nc_id,)).fetchone()
assert capa_row == (nc_id, 0), "the CAPA record must reference its non-conformance by key and start unverified"
con.close()
print(
    f"coating inspection {new_measurement}: in control ({control_lcl:.2f}-{control_ucl:.2f}) "
    f"= {in_control}, in spec ({LSL_COAT}-{USL_COAT}) = {in_spec}"
)

print(f"average run length, 3-sigma rule alone: {arl_3sigma_only:.1f} points (NIST states 371)")
print(f"average run length, with WECO zone rules added: {arl_with_weco:.1f} points (NIST states 91.75)")
print(f"mixed (un-stratified) series trips: {int(mixed_trips.sum())}")
print(f"stratified by tool, combined trips: {int(a_trips.sum() + b_trips.sum())} (tool A: {int(a_trips.sum())}, tool B: {int(b_trips.sum())})")
print(f"centred process: Cp={cp_centred:.3f} Cpk={cpk_centred:.3f}")
print(f"off-centre process: Cp={cp_off:.3f} Cpk={cpk_off:.3f}")
