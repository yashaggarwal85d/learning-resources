"""Three clocks on one reading, a backwards NTP step, UTC storage with local
presentation, and a shift calendar generated from the tz database rather than
hard-coded, so it gets the spring-forward and fall-back days right.

Every fleet size, offset, and clock-change scenario below is this topic's own
invented illustration of a fictional two-plant manufacturer (CHAPTER.md), not a
measurement of any real device.
"""

from dataclasses import dataclass
from datetime import date as _date
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo


# ---------------------------------------------------------------------------
# 1. Three clocks on one reading: device, gateway, ingest.
# ---------------------------------------------------------------------------


@dataclass
class Reading:
    t_device: datetime
    t_gateway: datetime
    t_ingest: datetime


def transit_delays(readings: list[Reading]) -> list[timedelta]:
    return [r.t_ingest - r.t_device for r in readings]


base = datetime(2026, 10, 31, 12, 0, 0, tzinfo=timezone.utc)
FICTIONAL_FLEET = [
    Reading(
        t_device=base + timedelta(seconds=i),
        t_gateway=base + timedelta(seconds=i, milliseconds=180),
        t_ingest=base + timedelta(seconds=i, milliseconds=420),
    )
    for i in range(20)
]
delays = transit_delays(FICTIONAL_FLEET)
assert all(d == timedelta(milliseconds=420) for d in delays)
# Ingest is always later than device, by construction of a real pipeline:
# nothing can be stored before it happens.
assert all(r.t_ingest > r.t_device for r in FICTIONAL_FLEET)
assert all(r.t_gateway > r.t_device for r in FICTIONAL_FLEET)


# ---------------------------------------------------------------------------
# 2. A device clock that steps backwards (an NTP correction) creates an
#    out-of-order reading: two readings taken seconds apart on the wall clock
#    land with device timestamps that go backwards.
# ---------------------------------------------------------------------------


def is_out_of_order(prev: Reading, curr: Reading) -> bool:
    return curr.t_device < prev.t_device


fleet_before_step = FICTIONAL_FLEET[9]
# A sensor's free-running clock is found to be fast and is corrected backwards
# by an NTP step between one reading and the next.
ntp_step_correction = timedelta(seconds=2, milliseconds=500)
fleet_after_step = Reading(
    t_device=fleet_before_step.t_device + timedelta(seconds=1) - ntp_step_correction,
    t_gateway=fleet_before_step.t_gateway + timedelta(seconds=1),
    t_ingest=fleet_before_step.t_ingest + timedelta(seconds=1),
)
assert is_out_of_order(fleet_before_step, fleet_after_step) is True
# The gateway and ingest clocks, never stepped, stay monotonically ordered
# even while the device clock the reading carries goes backwards.
assert fleet_after_step.t_gateway > fleet_before_step.t_gateway
assert fleet_after_step.t_ingest > fleet_before_step.t_ingest


# ---------------------------------------------------------------------------
# 3. UTC storage with local presentation, never local time stored bare.
# ---------------------------------------------------------------------------


@dataclass
class StoredInstant:
    utc: datetime
    source_zone: str

    def local(self) -> datetime:
        return self.utc.astimezone(ZoneInfo(self.source_zone))


munich_reading = StoredInstant(
    utc=datetime(2026, 3, 29, 21, 30, 0, tzinfo=timezone.utc),
    source_zone="Europe/Berlin",
)
assert munich_reading.utc.tzinfo is not None
local = munich_reading.local()
assert local.utcoffset() == timedelta(hours=2)
assert local.hour == 23


# ---------------------------------------------------------------------------
# 4. A shift calendar generated from the tz database, not hard-coded, so the
#    spring-forward and fall-back days come out the right length.
# ---------------------------------------------------------------------------


def shift_length_hours(date, start_local_hour: int, end_local_hour_next_day: int, zone: str) -> float:
    tz = ZoneInfo(zone)
    start = datetime(date.year, date.month, date.day, start_local_hour, tzinfo=tz)
    end_date = date + timedelta(days=1)
    end = datetime(end_date.year, end_date.month, end_date.day, end_local_hour_next_day, tzinfo=tz)
    return (end.astimezone(timezone.utc) - start.astimezone(timezone.utc)).total_seconds() / 3600


# Europe/Berlin springs forward at 02:00 local on 2026-03-29; a night shift
# starting the evening before (2026-03-28, 22:00) runs straight through that
# missing hour.
spring_forward_shift_start = _date(2026, 3, 28)
night_shift_spring = shift_length_hours(spring_forward_shift_start, 22, 6, "Europe/Berlin")
assert night_shift_spring == 7.0

# Europe/Berlin falls back at 03:00 local on 2026-10-25; a night shift
# starting the evening before (2026-10-24, 22:00) runs through the repeated
# hour.
fall_back_shift_start = _date(2026, 10, 24)
night_shift_fall = shift_length_hours(fall_back_shift_start, 22, 6, "Europe/Berlin")
assert night_shift_fall == 9.0

# An ordinary day's shift is the plain 8 hours neither clock-change day gives.
ordinary_day = _date(2026, 6, 15)
night_shift_ordinary = shift_length_hours(ordinary_day, 22, 6, "Europe/Berlin")
assert night_shift_ordinary == 8.0

# A hard-coded "shift is always 8 hours" table would have reported this as a
# 114 percent-OEE-producing bug on the spring day: the same output figure
# divided by a denominator that is wrong by one hour.
hard_coded_hours = 8.0
naive_oee_pct = round(100 * hard_coded_hours / night_shift_spring, 2)
assert naive_oee_pct > 100.0
correct_oee_pct = round(100 * night_shift_spring / night_shift_spring, 2)
assert correct_oee_pct == 100.0


# ---------------------------------------------------------------------------
# 5. Choosing event time: a per-signal decision with a stated fallback, and
#    the choice recorded as data, not implied by which column happens to be
#    populated.
# ---------------------------------------------------------------------------


OFFSET_TOLERANCE = timedelta(milliseconds=500)


def choose_event_time(reading: Reading, device_gateway_offset: timedelta) -> tuple[datetime, str]:
    if abs(device_gateway_offset) <= OFFSET_TOLERANCE:
        return reading.t_device, "t_device"
    return reading.t_gateway, "t_gateway"


disciplined = FICTIONAL_FLEET[0]
disciplined_offset = disciplined.t_gateway - disciplined.t_device
chosen_time, chosen_source = choose_event_time(disciplined, disciplined_offset)
assert chosen_source == "t_device"
assert chosen_time == disciplined.t_device

drifted_offset = timedelta(seconds=4)
drifted_reading = Reading(
    t_device=base + timedelta(seconds=100),
    t_gateway=base + timedelta(seconds=104),
    t_ingest=base + timedelta(seconds=104, milliseconds=300),
)
chosen_time2, chosen_source2 = choose_event_time(drifted_reading, drifted_offset)
assert chosen_source2 == "t_gateway"
assert chosen_time2 == drifted_reading.t_gateway


if __name__ == "__main__":
    print("transit delays all equal:", set(delays))
    print("out of order after NTP step:", is_out_of_order(fleet_before_step, fleet_after_step))
    print("Munich local hour for the UTC reading:", local.hour)
    print("spring shift hours:", night_shift_spring, "fall shift hours:", night_shift_fall, "ordinary:", night_shift_ordinary)
    print("naive OEE pct:", naive_oee_pct, "correct OEE pct:", correct_oee_pct)
    print("event-time choices:", chosen_source, chosen_source2)
    print("all examples.py assertions passed")
