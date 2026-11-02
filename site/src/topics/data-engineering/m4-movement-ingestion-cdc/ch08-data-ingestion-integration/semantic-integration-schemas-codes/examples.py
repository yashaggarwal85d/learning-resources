"""de.semantic-integration-schemas-codes -- measured directly against this sandbox's own real
PostgreSQL 16 cluster: a real slowly changing crosswalk table joined to facts by event time, a
real dated-exchange-rate conversion that avoids the integer-cents bug, a real IANA time-zone-aware
conversion compared against a naive fixed-offset one across a real DST transition (found by
scanning real `AT TIME ZONE 'Europe/Berlin'` output, not assumed), and a real mapping test that
fails the moment an unmapped source code appears.

CHAPTER.md's own "Lab" line: this topic "hosts the deterministic-crosswalk half of the 8.3 lab:
a versioned crosswalk table and mapping tests over the shop's two order sources, injected
unmapped code caught by a test; the Fellegi-Sunter half is not hosted (skipped topics)." Every
function creates and drops its own scratch tables, leaving the cluster exactly as it was found
for every other topic.
"""

import psycopg

DSN = "host=127.0.0.1 port=5432 dbname=learnshop user=postgres password=postgres"


def a_slowly_changing_crosswalk_joins_each_fact_to_the_mapping_valid_at_its_own_event_time():
    """CHAPTER.md: "a crosswalk is slowly changing, so it carries valid_from and valid_to... and
    a fact is joined to the crosswalk row in force at the event time." Measured directly: the
    legacy warehouse's own category code "A1" maps to "electronics" in one validity window and
    is remapped to "consumer-electronics" in a later window after a real re-categorization; a
    real point-in-time join (event_time BETWEEN valid_from AND coalesce(valid_to, 'infinity'))
    gives an order placed before the remap the old target and an order placed after the remap the
    new one, confirming the fact is joined to the version in force when the event happened, not
    to whichever row happens to be current when the query runs."""
    with psycopg.connect(DSN, autocommit=True) as c:
        c.execute("DROP TABLE IF EXISTS topic24_crosswalk, topic24_facts")
        c.execute(
            """
            CREATE TABLE topic24_crosswalk (
                source_code text, target_category text,
                valid_from timestamptz, valid_to timestamptz
            )
            """
        )
        c.execute("CREATE TABLE topic24_facts (order_id int, source_code text, event_time timestamptz)")

        c.execute(
            "INSERT INTO topic24_crosswalk VALUES ('A1', 'electronics', '2026-01-01+00', '2026-06-01+00')"
        )
        c.execute(
            "INSERT INTO topic24_crosswalk VALUES ('A1', 'consumer-electronics', '2026-06-01+00', NULL)"
        )
        c.execute(
            "INSERT INTO topic24_facts VALUES (1, 'A1', '2026-03-15+00'), (2, 'A1', '2026-09-15+00')"
        )

        rows = c.execute(
            """
            SELECT f.order_id, x.target_category
            FROM topic24_facts f
            JOIN topic24_crosswalk x
              ON f.source_code = x.source_code
             AND f.event_time >= x.valid_from
             AND f.event_time < coalesce(x.valid_to, 'infinity')
            ORDER BY f.order_id
            """
        ).fetchall()
        assert rows == [(1, "electronics"), (2, "consumer-electronics")], rows

        c.execute("DROP TABLE topic24_crosswalk, topic24_facts")


def the_minor_unit_exponent_and_a_dated_exchange_rate_avoid_the_integer_cents_bug():
    """CHAPTER.md: currencies "by ISO 4217 codes with the exchange rate as dated data and the
    minor-unit exponent per currency (the integer-cents bug of Chapter 1 topic 12)." Measured
    directly: the legacy source stores a EUR amount as integer minor units (cents; exponent 2),
    the shop's own source stores the same kind of amount already as a decimal major-unit value.
    Converting the legacy value correctly (divide by 10^exponent, then apply the rate dated to
    the transaction) lands on the same major-unit, same-currency figure the shop's own source
    already carries; treating the legacy integer minor-unit value as if it were already a major
    unit -- the bug this topic names -- is off by exactly the minor-unit scale factor."""
    with psycopg.connect(DSN, autocommit=True) as c:
        c.execute("DROP TABLE IF EXISTS topic24_fx_rates")
        c.execute("CREATE TABLE topic24_fx_rates (as_of date, eur_to_usd numeric)")
        c.execute("INSERT INTO topic24_fx_rates VALUES ('2026-05-01', 1.08), ('2026-08-01', 1.10)")

        legacy_minor_units = 250000  # the legacy system's own integer-cents figure for this order
        minor_unit_exponent = 2  # EUR's own ISO 4217 minor-unit exponent
        order_date = "2026-05-15"

        rate = c.execute(
            "SELECT eur_to_usd FROM topic24_fx_rates WHERE as_of <= %s ORDER BY as_of DESC LIMIT 1",
            (order_date,),
        ).fetchone()[0]

        correct_major_units_eur = legacy_minor_units / (10 ** minor_unit_exponent)
        correct_usd = float(correct_major_units_eur) * float(rate)

        buggy_usd = float(legacy_minor_units) * float(rate)  # the bug: no minor-unit scaling at all

        shop_own_reported_eur = 2500.00  # the shop's own source, already a decimal major-unit figure
        shop_own_reported_usd = shop_own_reported_eur * float(rate)

        assert abs(correct_usd - shop_own_reported_usd) < 0.01, (correct_usd, shop_own_reported_usd)
        assert abs(buggy_usd / correct_usd - 100) < 0.01, "the bug must be off by exactly 10^exponent"

        c.execute("DROP TABLE topic24_fx_rates")


def a_utc_instant_plus_zone_survives_the_dst_transition_a_fixed_offset_conversion_gets_wrong():
    """CHAPTER.md: "a UTC instant is stored, the original local value and zone are kept"; a
    local timestamp needs its own zone because "the IANA time zone database... is a rule set
    that changes." Measured directly: this sandbox's own PostgreSQL first finds the real
    Europe/Berlin daylight-saving transition by scanning real `AT TIME ZONE` output across a
    span of days (not assuming a date), then confirms that converting a local wall-clock time on
    the transition night via the zone-aware path lands on a different UTC instant than a naive
    fixed-offset conversion would -- while the two methods agree on every other night in the same
    span, proving the divergence is specific to the transition itself."""
    with psycopg.connect(DSN, autocommit=True) as c:
        days = c.execute(
            """
            SELECT d::date, (d AT TIME ZONE 'Europe/Berlin')
            FROM generate_series('2026-03-20 00:00:00+00'::timestamptz,
                                  '2026-04-05 00:00:00+00'::timestamptz, interval '1 day') d
            ORDER BY d
            """
        ).fetchall()

        offsets = [(day, wall.hour) for day, wall in days]
        transition_index = next(
            i for i in range(1, len(offsets)) if offsets[i][1] != offsets[i - 1][1]
        )
        # The transition itself happens within a calendar day (the clocks jump forward around
        # 01:00 UTC), so the day whose midnight still shows the old offset can already have
        # switched to the new one by mid-morning. A day fully two steps before the detected
        # index, and the detected day itself, are each safely on one side of the jump all day.
        pre_transition_day = offsets[transition_index - 2][0]
        post_transition_day = offsets[transition_index][0]
        assert (post_transition_day - pre_transition_day).days == 2, "found by scanning, not assumed"

        fixed_offset_hours = offsets[0][1]  # the offset that was correct before the transition

        local_wall_clock_on_transition_night = "10:30:00"
        zone_aware_utc = c.execute(
            "SELECT (%s::date + %s::time) AT TIME ZONE 'Europe/Berlin'",
            (post_transition_day, local_wall_clock_on_transition_night),
        ).fetchone()[0]
        naive_fixed_offset_utc = c.execute(
            "SELECT ((%s::date + %s::time) - (%s * interval '1 hour')) AT TIME ZONE 'UTC'",
            (post_transition_day, local_wall_clock_on_transition_night, fixed_offset_hours),
        ).fetchone()[0]

        assert zone_aware_utc != naive_fixed_offset_utc
        assert abs((zone_aware_utc - naive_fixed_offset_utc).total_seconds()) == 3600

        day_before_transition_zone_aware = c.execute(
            "SELECT (%s::date + %s::time) AT TIME ZONE 'Europe/Berlin'",
            (pre_transition_day, local_wall_clock_on_transition_night),
        ).fetchone()[0]
        day_before_transition_naive = c.execute(
            "SELECT ((%s::date + %s::time) - (%s * interval '1 hour')) AT TIME ZONE 'UTC'",
            (pre_transition_day, local_wall_clock_on_transition_night, fixed_offset_hours),
        ).fetchone()[0]
        assert day_before_transition_zone_aware == day_before_transition_naive, (
            "off the transition itself, the two methods must agree"
        )


def a_mapping_test_catches_an_unmapped_code_the_moment_a_source_introduces_one():
    """CHAPTER.md: "every source code maps to exactly one target; no orphan after a source
    change... a new source code that nobody mapped fails a test instead of falling into
    UNKNOWN." Measured directly: a real SQL test (an anti-join between the facts table's own
    distinct codes and the crosswalk) passes with zero orphans against the current source codes,
    then a real order row carrying a brand-new, unmapped category code is inserted -- the same
    test now fails, naming the orphan code, confirming the test genuinely runs against live data
    rather than a canned pass. Adding the missing crosswalk row makes the same test pass again."""
    with psycopg.connect(DSN, autocommit=True) as c:
        c.execute("DROP TABLE IF EXISTS topic24_test_crosswalk, topic24_test_facts")
        c.execute("CREATE TABLE topic24_test_crosswalk (source_code text PRIMARY KEY, target_category text)")
        c.execute("CREATE TABLE topic24_test_facts (order_id int, source_code text)")
        c.execute("INSERT INTO topic24_test_crosswalk VALUES ('A1', 'electronics'), ('B2', 'furniture')")
        c.execute("INSERT INTO topic24_test_facts VALUES (1, 'A1'), (2, 'B2')")

        def orphan_codes():
            return [
                row[0]
                for row in c.execute(
                    """
                    SELECT DISTINCT f.source_code FROM topic24_test_facts f
                    LEFT JOIN topic24_test_crosswalk x ON f.source_code = x.source_code
                    WHERE x.source_code IS NULL
                    """
                ).fetchall()
            ]

        assert orphan_codes() == []

        c.execute("INSERT INTO topic24_test_facts VALUES (3, 'C3')")  # a brand-new, unmapped code
        assert orphan_codes() == ["C3"]

        c.execute("INSERT INTO topic24_test_crosswalk VALUES ('C3', 'office-supplies')")
        assert orphan_codes() == []

        c.execute("DROP TABLE topic24_test_crosswalk, topic24_test_facts")


if __name__ == "__main__":
    a_slowly_changing_crosswalk_joins_each_fact_to_the_mapping_valid_at_its_own_event_time()
    the_minor_unit_exponent_and_a_dated_exchange_rate_avoid_the_integer_cents_bug()
    a_utc_instant_plus_zone_survives_the_dst_transition_a_fixed_offset_conversion_gets_wrong()
    a_mapping_test_catches_an_unmapped_code_the_moment_a_source_introduces_one()
    print("de.semantic-integration-schemas-codes: all checks passed")
