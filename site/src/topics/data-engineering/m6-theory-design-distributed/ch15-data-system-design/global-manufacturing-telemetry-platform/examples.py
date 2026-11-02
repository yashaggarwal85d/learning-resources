"""Lab for de.global-manufacturing-telemetry-platform.

The capacity and cardinality estimate, the buffer-sizing arithmetic, and
the catch-up simulation (a buffered outage replayed with and without a
throttle) are this topic's executable evidence.
"""


def plant_event_rate(sensors_per_plant, hz, peak_multiplier):
    """One plant's own event rate, and its peak during a shift change or
    a line restart.
    """
    base = sensors_per_plant * hz
    return base, base * peak_multiplier


def fleet_event_rate(plant_count, sensors_per_plant, hz, peak_multiplier):
    """The whole fleet's own base and peak rate, summed across plants."""
    base, peak = plant_event_rate(sensors_per_plant, hz, peak_multiplier)
    return base * plant_count, peak * plant_count


def storage_bytes_per_year(rate_per_second, bytes_per_event, replication, compression_ratio):
    """A year of storage at this rate, with replication and a stated
    compression reference point applied.
    """
    seconds_per_year = 365 * 24 * 60 * 60
    raw = rate_per_second * bytes_per_event * seconds_per_year * replication
    return raw / compression_ratio


def buffer_size_bytes(outage_seconds, rate_per_second, bytes_per_event):
    """The edge gateway's own buffer: an outage's length times the rate
    it has to hold, in bytes.
    """
    return outage_seconds * rate_per_second * bytes_per_event


def series_cardinality(plant_count, lines_per_plant, machines_per_line, sensors_per_machine):
    """The hot store's own series count: every unique combination of
    plant, line, machine and sensor label is its own series.
    """
    return plant_count * lines_per_plant * machines_per_line * sensors_per_machine


def catch_up_peak_rate(backlog_events, drain_seconds, normal_rate, throttle_rate):
    """The rate the platform actually sees on reconnect: throttled
    catch-up adds a capped extra rate on top of normal traffic; an
    unthrottled catch-up dumps the whole backlog as fast as it can send.
    """
    if throttle_rate is None:
        instantaneous = backlog_events / 1.0  # the whole backlog arrives essentially at once
        return normal_rate + instantaneous
    return normal_rate + min(throttle_rate, backlog_events / drain_seconds)


def check():
    plant_count = 3
    sensors_per_plant = 4000
    hz = 10
    peak_multiplier = 2.5

    base_rate, peak_rate = fleet_event_rate(plant_count, sensors_per_plant, hz, peak_multiplier)
    assert base_rate == plant_count * sensors_per_plant * hz
    assert peak_rate > base_rate  # a shift change or a line restart pushes the fleet above its steady rate

    bytes_per_event = 24
    replication = 3
    gorilla_ratio = 16 / 1.37  # the published reference point: sixteen uncompressed bytes down to 1.37
    yearly_bytes = storage_bytes_per_year(base_rate, bytes_per_event, replication, gorilla_ratio)
    yearly_bytes_uncompressed = storage_bytes_per_year(base_rate, bytes_per_event, replication, 1.0)
    assert yearly_bytes < yearly_bytes_uncompressed  # the stated compression reference meaningfully shrinks the estimate, as a reference point, not a guarantee

    outage_seconds = 4 * 60 * 60
    buffer_for_outage = buffer_size_bytes(outage_seconds, base_rate, bytes_per_event)
    double_outage_buffer = buffer_size_bytes(outage_seconds * 2, base_rate, bytes_per_event)
    assert double_outage_buffer == buffer_for_outage * 2  # the buffer size scales linearly with the outage's own length

    cardinality = series_cardinality(plant_count=plant_count, lines_per_plant=6, machines_per_line=8, sensors_per_machine=20)
    ten_x_cardinality = series_cardinality(plant_count=plant_count, lines_per_plant=6, machines_per_line=8, sensors_per_machine=200)
    assert ten_x_cardinality == cardinality * 10  # ten times the sensor count means ten times the series count, against the same label-driven limit

    backlog = base_rate * outage_seconds
    throttled_peak = catch_up_peak_rate(backlog, drain_seconds=outage_seconds * 4, normal_rate=base_rate, throttle_rate=base_rate)
    unthrottled_peak = catch_up_peak_rate(backlog, drain_seconds=outage_seconds * 4, normal_rate=base_rate, throttle_rate=None)
    assert throttled_peak < unthrottled_peak  # a throttle caps the catch-up's own extra load; without one, the whole backlog arrives essentially at once


if __name__ == "__main__":
    check()
    print("de.global-manufacturing-telemetry-platform: all checks passed")
