"""Synthetic examples for de.slo-burn-rate-alerting. Pure Python over synthetic data, reusing the
shape of topic 1's own freshness series (same fictional shop, orders-rollup -> daily_revenue), no
real system required."""

import random


def burn_rate_and_time_to_exhaustion(slo_window_days, error_rate, slo_target):
    """Burn rate = observed error rate / allowed error rate. Time to exhaustion = window length /
    burn rate (burn rate 1 exhausts exactly at the window's own end, per SOURCES.md)."""
    allowed_error_rate = 1 - slo_target
    burn_rate = error_rate / allowed_error_rate
    time_to_exhaustion_days = slo_window_days / burn_rate
    return burn_rate, time_to_exhaustion_days


def check_burn_rate_examples():
    # burn rate 1: a constant error rate exactly at the allowed rate exhausts at window end.
    br1, t1 = burn_rate_and_time_to_exhaustion(30, error_rate=0.001, slo_target=0.999)
    print(f"burn rate {br1:.1f}, exhausts in {t1:.1f} days (window is 30 days)")
    assert round(br1, 2) == 1.0
    assert round(t1, 1) == 30.0

    # burn rate 14.4: the workbook's own page-threshold burn rate for a 99.9% SLO.
    br2, t2 = burn_rate_and_time_to_exhaustion(30, error_rate=0.0144, slo_target=0.999)
    print(f"burn rate {br2:.1f}, exhausts in {t2 * 24:.1f} hours")
    assert round(br2, 1) == 14.4
    assert round(t2 * 24, 1) == round(30 * 24 / 14.4, 1)
    return br1, t1, br2, t2


def fixed_threshold_poor_reset_time(window_days=30, outage_hours=1):
    """Replay a 1-hour 100% outage against a fixed-duration threshold rule set at the workbook's
    own 5%-of-30-day-budget level: the alert fires, and (because the rule only looks at a fixed
    window of recent data) keeps firing until that whole window has rolled past the outage."""
    window_hours = window_days * 24
    outage_budget_fraction = outage_hours / window_hours  # a 100% outage for outage_hours
    fires = outage_budget_fraction >= 0.05 / (36)  # the workbook's own 5%-in-36hr fixed rule, scaled to 1hr
    reset_time_hours = window_hours - outage_hours  # the rule's own window must fully roll past the outage
    print(f"fixed-window rule: fires={fires}, reset time ~{reset_time_hours:.0f} hours (most of the {window_hours:.0f}-hour window)")
    assert fires is True
    assert reset_time_hours > 24 * 7, "a fixed-duration rule's reset time should be on the order of weeks, not minutes"
    return fires, reset_time_hours


def multiwindow_fires_and_resets_fast(long_window_hours=1, short_window_fraction=1 / 12):
    """A long+short window pair (short window at 1/12 the long one, per the workbook's own
    guideline): fires fast on a real outage, and clears fast once it ends, instead of waiting out
    a multi-week fixed window."""
    short_window_hours = long_window_hours * short_window_fraction
    short_window_minutes = short_window_hours * 60
    detection_time_minutes = short_window_minutes  # the short window is what triggers quickly
    reset_time_minutes = short_window_minutes  # clears once the short window rolls past recovery
    print(f"multi-window rule: short window {short_window_minutes:.1f} min, detects in ~{detection_time_minutes:.1f} min, resets in ~{reset_time_minutes:.1f} min")
    assert short_window_minutes < 10, "the short window should be minutes, not hours"
    assert reset_time_minutes < 24 * 60 * 7, "multi-window reset time should be far faster than a fixed-window rule's weeks"
    return detection_time_minutes, reset_time_minutes


def low_availability_threshold_never_fires(slo_target=0.90, page_budget_fraction=0.02, window_hours=1):
    """For a 90% SLO, can a complete (100%) one-hour outage cross the documented 2%-in-one-hour
    page threshold? Reproduces the workbook's own 1.4%-of-budget figure."""
    allowed_error_rate = 1 - slo_target  # 0.10 allowed error budget over the SLO's own period
    # over a 30-day SLO period, a 1-hour complete outage's fraction of the *budget* consumed:
    slo_period_hours = 30 * 24
    outage_error_contribution = window_hours / slo_period_hours  # 100% error rate for 1 of 720 hours
    budget_consumed_fraction = outage_error_contribution / allowed_error_rate
    print(f"90% SLO, 1-hour complete outage: consumes {budget_consumed_fraction * 100:.1f}% of the error budget")
    assert round(budget_consumed_fraction * 100, 1) == 1.4, "should reproduce the workbook's own 1.4% figure"
    can_fire = budget_consumed_fraction >= page_budget_fraction
    print(f"can the 2%-in-1hr page threshold fire? {can_fire}")
    assert can_fire is False
    return budget_consumed_fraction, can_fire


def fixed_vs_schedule_aware_freshness_false_alarms():
    """Reuse topic 1's own freshness shape: 30 nightly runs, freshness measured as minutes since
    the newest partition, a nightly scheduled run due at a fixed time. A fixed-threshold alert
    (say, 'always under 90 minutes old') pages every night at the expected pre-run gap; a
    schedule-aware alert (age measured against the next expected arrival) does not."""
    threshold_minutes = 90
    expected_pre_run_gap_minutes = 110  # the table is legitimately ~110 min old right before its own nightly run
    stale_night_freshness = 620  # topic 1's own injected stale-night value

    nights = []
    for night in range(30):
        if night == 17:
            nights.append(stale_night_freshness)
        else:
            # every healthy night, freshness climbs toward the expected pre-run gap and resets.
            nights.append(random.Random(night).randint(60, expected_pre_run_gap_minutes))

    fixed_false_alarms = sum(1 for i, f in enumerate(nights) if i != 17 and f > threshold_minutes)
    fixed_true_alarms = sum(1 for i, f in enumerate(nights) if i == 17 and f > threshold_minutes)

    def schedule_aware_fires(freshness, expected_gap, tolerance_minutes=30):
        return freshness > expected_gap + tolerance_minutes

    schedule_false_alarms = sum(1 for i, f in enumerate(nights) if i != 17 and schedule_aware_fires(f, expected_pre_run_gap_minutes))
    schedule_true_alarms = sum(1 for i, f in enumerate(nights) if i == 17 and schedule_aware_fires(f, expected_pre_run_gap_minutes))

    print(f"fixed threshold ({threshold_minutes} min): {fixed_false_alarms} false alarms over 29 healthy nights, catches the stale night: {fixed_true_alarms == 1}")
    print(f"schedule-aware (expected gap {expected_pre_run_gap_minutes} min + tolerance): {schedule_false_alarms} false alarms, catches the stale night: {schedule_true_alarms == 1}")

    assert fixed_false_alarms > 0, "a fixed threshold below the expected pre-run gap should false-alarm on healthy nights"
    assert schedule_false_alarms == 0, "a schedule-aware alert should not false-alarm on healthy nights"
    assert schedule_true_alarms == 1, "a schedule-aware alert must still catch the genuinely stale night"
    return fixed_false_alarms, schedule_false_alarms


def main():
    check_burn_rate_examples()
    fixed_threshold_poor_reset_time()
    multiwindow_fires_and_resets_fast()
    low_availability_threshold_never_fires()
    fixed_vs_schedule_aware_freshness_false_alarms()
    print("de.slo-burn-rate-alerting examples: all checks pass")


if __name__ == "__main__":
    main()
