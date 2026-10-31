"""A cumulative meter register turned into interval consumption, with a rollover, a reset and a
meter swap each handled, and the reset's own loss shown to be boundable but not recoverable; a
power series integrated into energy, against the classic error of averaging uneven intervals; a
shared-utility allocation under two rules, with the spread between them reported as a real
uncertainty; and energy per good unit. Fictional single plant (no real company); all data is
seeded and synthetic except the Prometheus/SI Brochure definitions, which are this topic's own
real, fetched quotes, not reused numerically here.
"""

# 1. A cumulative register, wrapping at a fixed width, with a rollover, a reset and a meter swap.
REGISTER_WIDTH = 100_000  # kWh, a fixed-width register that wraps back to 0 at this value.
PLAUSIBLE_INTERVAL_RANGE = (1_000, 1_800)  # kWh per interval, this line's known normal range.


def classify_and_correct(prev_reading, next_reading, register_width, plausible_range):
    diff = next_reading - prev_reading
    if diff >= 0:
        return "normal", diff
    rollover_corrected = next_reading + (register_width - prev_reading)
    lo, hi = plausible_range
    if lo <= rollover_corrected <= hi:
        return "rollover", rollover_corrected
    return "reset", None  # the true consumption during an unobserved reset cannot be recovered.


# A rollover: 99,200 wraps past the register's width to 650.
kind, corrected = classify_and_correct(99_200, 650, REGISTER_WIDTH, PLAUSIBLE_INTERVAL_RANGE)
assert kind == "rollover", f"expected a rollover classification, got {kind}"
assert corrected == 1_450, f"expected the corrected rollover consumption to be 1450, got {corrected}"

# A reset: the device restarts and the register falls back near zero, far outside the plausible
# rollover-corrected band, so it cannot be mistaken for a rollover.
kind, corrected = classify_and_correct(5_000, 12, REGISTER_WIDTH, PLAUSIBLE_INTERVAL_RANGE)
assert kind == "reset", f"expected a reset classification, got {kind}"
assert corrected is None, "a reset's true lost consumption must not be reported as a number at all"

# The true consumption lost in an unobserved reset cannot be recovered -- only bounded, given the
# elapsed time and this line's own known maximum plausible rate.
elapsed_hours = 1.0
max_plausible_rate_kwh_per_hour = PLAUSIBLE_INTERVAL_RANGE[1]
loss_upper_bound = max_plausible_rate_kwh_per_hour * elapsed_hours
assert loss_upper_bound == 1_800, f"expected an upper bound of 1800 kWh, got {loss_upper_bound}"

# The previous "fix" (silently dropping negative differences, i.e. treating them as zero
# consumption) hides the reset entirely rather than bounding it -- it doesn't just lose precision,
# it reports a confident, wrong number (zero lost) instead of an honest, bounded range.
naive_dropped_consumption = 0  # the old "fix": a negative diff becomes 0, not a flagged reset.
assert naive_dropped_consumption < loss_upper_bound, (
    "the naive drop-negative-diffs fix reports a confident zero, strictly less than the honest upper bound -- it hides the loss rather than bounding it"
)

# A meter swap: the same equipment keeps its id, but a new meter starts its own register from a
# fresh baseline recorded at install time (topic 1's install history). The series must be split
# at the swap, never diffed across it.
old_meter_last_reading = 42_300
new_meter_install_baseline = 0
new_meter_first_reading = 1_100
# Diffing across the swap would be nonsensical (a huge negative number); splitting it gives the
# real consumption on each side.
naive_cross_swap_diff = new_meter_first_reading - old_meter_last_reading
assert naive_cross_swap_diff < 0, "diffing straight across a meter swap must look like an enormous, nonsensical drop"
consumption_after_swap = new_meter_first_reading - new_meter_install_baseline
assert consumption_after_swap == 1_100, f"expected 1100 kWh since the new meter's own baseline, got {consumption_after_swap}"


# 2. Power (a rate) integrated into energy, against the classic error of mixing the two.
power_samples = [  # (hours_since_start, power_kW), irregularly spaced
    (0.0, 40.0),
    (0.25, 55.0),
    (1.0, 50.0),
    (1.5, 20.0),
    (2.0, 20.0),
]


def trapezoidal_energy_kwh(samples):
    total = 0.0
    for (t0, p0), (t1, p1) in zip(samples, samples[1:]):
        total += 0.5 * (p0 + p1) * (t1 - t0)
    return total


true_energy_kwh = trapezoidal_energy_kwh(power_samples)

# The classic error: averaging the power readings as a plain arithmetic mean (ignoring that the
# intervals between them are different lengths) and multiplying by the total elapsed time.
naive_mean_power = sum(p for _, p in power_samples) / len(power_samples)
total_hours = power_samples[-1][0] - power_samples[0][0]
naive_energy_kwh = naive_mean_power * total_hours

assert round(true_energy_kwh, 4) == 78.75, f"expected the true integrated energy to be 78.75 kWh, got {true_energy_kwh:.4f}"
assert round(naive_energy_kwh, 4) == 74.0, f"expected the naive (unweighted) energy to be 74.0 kWh, got {naive_energy_kwh:.4f}"
assert true_energy_kwh != naive_energy_kwh, "a plain average of unevenly-spaced power readings must not equal the properly integrated energy"

# A second, cruder error: summing the kW readings directly as though they were already kWh.
wrong_units_total = sum(p for _, p in power_samples)
assert wrong_units_total == 185.0
assert abs(wrong_units_total - true_energy_kwh) > 50, "summing power readings as though they were energy must give a wildly different number"


# 3. Allocating a shared header meter's consumption to lines, under two different rules, with the
# spread between them reported as a real modelling uncertainty.
header_total_kwh = 3_000.0
lines = {
    "L4": {"running_hours": 18.0, "good_count": 4_000},
    "L6": {"running_hours": 6.0, "good_count": 2_000},
}
total_running_hours = sum(line["running_hours"] for line in lines.values())
total_good_count = sum(line["good_count"] for line in lines.values())

allocated_by_hours = {name: header_total_kwh * (line["running_hours"] / total_running_hours) for name, line in lines.items()}
allocated_by_count = {name: header_total_kwh * (line["good_count"] / total_good_count) for name, line in lines.items()}

assert round(allocated_by_hours["L4"], 2) == 2_250.0, f"expected 2250.0 kWh by running hours, got {allocated_by_hours['L4']:.2f}"
assert round(allocated_by_count["L4"], 2) == 2_000.0, f"expected 2000.0 kWh by good count, got {allocated_by_count['L4']:.2f}"

spread_l4 = abs(allocated_by_hours["L4"] - allocated_by_count["L4"])
assert spread_l4 == 250.0, f"expected a 250.0 kWh spread between the two allocation rules for L4, got {spread_l4}"

unit_cost_per_kwh = 0.18
allocation_uncertainty_cost = spread_l4 * unit_cost_per_kwh
assert round(allocation_uncertainty_cost, 2) == 45.0, f"expected a 45.0 cost spread, got {allocation_uncertainty_cost:.2f}"


# 4. Energy per good unit, from the allocated energy and topic 4's own good-count vocabulary.
energy_per_good_unit_by_hours = allocated_by_hours["L4"] / lines["L4"]["good_count"]
energy_per_good_unit_by_count = allocated_by_count["L4"] / lines["L4"]["good_count"]
assert round(energy_per_good_unit_by_hours, 4) == 0.5625, f"got {energy_per_good_unit_by_hours:.4f}"
assert energy_per_good_unit_by_count == 0.5, f"got {energy_per_good_unit_by_count}"
assert energy_per_good_unit_by_hours != energy_per_good_unit_by_count, "the energy-per-good-unit KPI inherits the allocation rule's own uncertainty"

print(f"rollover corrected: {corrected if kind == 'rollover' else 1_450} kWh; reset loss bound: {loss_upper_bound} kWh (not recoverable exactly)")
print(f"meter swap: {consumption_after_swap} kWh since the new meter's own baseline")
print(f"true integrated energy: {true_energy_kwh:.1f} kWh vs naive unweighted-average energy: {naive_energy_kwh:.1f} kWh")
print(f"allocation spread for L4: {spread_l4:.1f} kWh (~{allocation_uncertainty_cost:.2f} currency units)")
print(f"energy per good unit (L4): {energy_per_good_unit_by_hours:.4f} by hours, {energy_per_good_unit_by_count:.4f} by count")
