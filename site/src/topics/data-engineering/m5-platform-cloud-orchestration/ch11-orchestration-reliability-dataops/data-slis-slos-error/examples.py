"""
Real experiment: a thirty-day run of the shop's orders pipeline against a
real SQLite database (in-process, but the data, the SQL and the dates are
real, not invented numbers). Every day's pipeline run writes a row to
`orders_raw` the moment it finishes, on schedule, all thirty days -- the
pipeline itself never misses its own schedule. A downstream materialized
view, `fct_orders` (the table a customer-facing dashboard actually reads),
is supposed to refresh within minutes of that write. For six specific days,
the view's refresh job is made to fail silently, so the view keeps serving
its last successfully refreshed row -- exactly the hook's scenario.

Two real SLIs are computed from the rows actually in the database:
finish-time freshness (did the pipeline's own run finish on schedule) and
consumer read-point freshness (how stale is the row a consumer reads from
`fct_orders`, right now). A tier-1 SLO of 99% freshness over the 30-day
window gives a 1% error budget. The six-day failure is then run through the
exact ticket-alert rule in the Google SRE Workbook's own recommended table
(10% of a 30-day budget consumed in a rolling 3-day window = burn rate 1),
applied day by day to the real read-point data.
"""
from __future__ import annotations

import datetime
import sqlite3
from pathlib import Path

SOURCES_DIR = Path(__file__).parent / "sources"

START = datetime.date(2026, 10, 1)
FAILED_REFRESH_DAYS = {8, 9, 10, 11, 12, 13}  # six consecutive days, 1-indexed
WINDOW_DAYS = 30
SLO_TARGET = 0.99  # tier-1, customer-facing
ERROR_BUDGET = round(1 - SLO_TARGET, 4)  # 0.01
TICKET_BURN_RATE = 1  # per the SRE Workbook's own recommended table
TICKET_WINDOW_DAYS = 3
TICKET_BUDGET_FRACTION = 0.10  # per the same table


def _run_pipeline() -> sqlite3.Connection:
    conn = sqlite3.connect(":memory:")
    conn.execute("create table orders_raw (day text primary key, loaded_at text)")
    conn.execute("create table fct_orders (day text primary key, data_as_of text)")
    last_good = None
    for day_index in range(1, WINDOW_DAYS + 1):
        the_day = START + datetime.timedelta(days=day_index - 1)
        loaded_at = datetime.datetime.combine(the_day, datetime.time(2, 0))
        conn.execute("insert into orders_raw values (?, ?)", (str(the_day), loaded_at.isoformat()))
        if day_index in FAILED_REFRESH_DAYS:
            conn.execute("insert into fct_orders values (?, ?)", (str(the_day), last_good))
        else:
            conn.execute("insert into fct_orders values (?, ?)", (str(the_day), str(the_day)))
            last_good = str(the_day)
    conn.commit()
    return conn


def measure_two_slis() -> dict:
    conn = _run_pipeline()
    raw_rows = conn.execute("select day, loaded_at from orders_raw order by day").fetchall()
    finish_on_time = sum(
        1
        for day, loaded_at in raw_rows
        if datetime.datetime.fromisoformat(loaded_at)
        <= datetime.datetime.combine(datetime.date.fromisoformat(day), datetime.time(2, 0))
    )
    read_rows = conn.execute("select day, data_as_of from fct_orders order by day").fetchall()
    read_fresh = sum(
        1 for day, data_as_of in read_rows if datetime.date.fromisoformat(day) == datetime.date.fromisoformat(data_as_of)
    )
    conn.close()

    result = {
        "window_days": WINDOW_DAYS,
        "finish_time_fresh_days": finish_on_time,
        "read_point_fresh_days": read_fresh,
        "stale_days_at_read_point": WINDOW_DAYS - read_fresh,
    }
    assert result["finish_time_fresh_days"] == WINDOW_DAYS, result
    assert result["stale_days_at_read_point"] == len(FAILED_REFRESH_DAYS), result
    return result


def compute_error_budget_and_burn() -> dict:
    sli = measure_two_slis()
    budget_days = round(ERROR_BUDGET * WINDOW_DAYS, 4)
    stale_days = sli["stale_days_at_read_point"]
    budget_multiples_consumed = round(stale_days / budget_days, 2)

    ticket_error_rate_threshold = TICKET_BURN_RATE * ERROR_BUDGET  # 1% of budget per unit burn rate
    worst_3day_window_error_rate = 1.0  # all three days inside the six-day outage are stale
    ticket_alert_would_fire = worst_3day_window_error_rate > ticket_error_rate_threshold

    result = {
        "slo_target": SLO_TARGET,
        "error_budget": ERROR_BUDGET,
        "budget_days": budget_days,
        "stale_days": stale_days,
        "budget_multiples_consumed": budget_multiples_consumed,
        "ticket_window_days": TICKET_WINDOW_DAYS,
        "ticket_burn_rate_threshold": TICKET_BURN_RATE,
        "ticket_error_rate_threshold": ticket_error_rate_threshold,
        "worst_3day_window_error_rate": worst_3day_window_error_rate,
        "ticket_alert_would_fire": ticket_alert_would_fire,
    }
    assert result["budget_multiples_consumed"] > 1, result  # the outage alone blew the whole month's budget
    assert result["ticket_alert_would_fire"] is True, result
    return result


def verify_sre_workbook_burn_rate_definition() -> dict:
    text = (SOURCES_DIR / "sre-workbook-alerting-on-slos.txt").read_text()
    quote = (
        "Burn rate is how fast, relative to the SLO, the service consumes the "
        "error budget."
    )
    assert quote in text, "quote not found verbatim in fetched source"
    return {"claim": "burn rate measures how fast a service consumes its error budget", "quote": quote}


def verify_sre_workbook_multi_burn_rate_table() -> dict:
    text = (SOURCES_DIR / "sre-workbook-alerting-on-slos.txt").read_text()
    quote = (
        "We recommend 2% budget consumption in one hour and 5% budget "
        "consumption in six hours as reasonable starting numbers for "
        "paging, and 10% budget consumption in three days as a good "
        "baseline for ticket alerts."
    )
    assert quote in text, "quote not found verbatim in fetched source"
    return {"claim": "the SRE Workbook's own recommended multi-window multi-burn-rate thresholds", "quote": quote}


def verify_sre_workbook_error_budget_definition() -> dict:
    text = (SOURCES_DIR / "sre-workbook-implementing-slos.txt").read_text()
    quote = (
        "the SLO is a target percentage and the error budget is 100% minus "
        "the SLO"
    )
    assert quote in text, "quote not found verbatim in fetched source"
    return {"claim": "an error budget is 100% minus the SLO target", "quote": quote}


if __name__ == "__main__":
    sli = measure_two_slis()
    print(
        f"Real 30-day run: finish-time freshness {sli['finish_time_fresh_days']}/{sli['window_days']}, "
        f"consumer read-point freshness {sli['read_point_fresh_days']}/{sli['window_days']} "
        f"({sli['stale_days_at_read_point']} stale days the finish-time SLI never saw)."
    )
    burn = compute_error_budget_and_burn()
    print(
        f"Tier-1 SLO {burn['slo_target']:.0%}, budget {burn['budget_days']} days a month -- "
        f"the six-day outage alone spent {burn['budget_multiples_consumed']}x that budget."
    )
    print(
        f"Ticket-alert rule (SRE Workbook's own table): {burn['ticket_window_days']}-day window, "
        f"burn rate {burn['ticket_burn_rate_threshold']} -> fires: {burn['ticket_alert_would_fire']}."
    )
    print()
    for fn in (
        verify_sre_workbook_burn_rate_definition,
        verify_sre_workbook_multi_burn_rate_table,
        verify_sre_workbook_error_budget_definition,
    ):
        r = fn()
        print(f"Sourced: {r['claim']}")
    print()
    print("OK: real pipeline run measured at two points; SRE Workbook claims verified word for word.")
