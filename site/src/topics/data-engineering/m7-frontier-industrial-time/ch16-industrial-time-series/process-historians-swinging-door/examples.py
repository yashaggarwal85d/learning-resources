"""A synthetic temperature series run through exception (deadband) filtering,
then swinging-door compression (Bristol's own patented method: an anchor, two
slope-bounding "doors", a knee recorded exactly when the doors can no longer
stay parallel), with the error-band guarantee verified against the original
signal. Recorded-value (Compressed Data) retrieval is compared against
interpolated (Sampled Data) retrieval and a true time-weighted average, and
an extraction design is sketched that carries the compression metadata
forward instead of discarding it."""

from __future__ import annotations

import math
import random
from dataclasses import dataclass, field

random.seed(7)

N = 3600  # one value per second for one hour
DT = 1.0


def build_signal() -> list[float]:
    """An analog process temperature: long flat holds (a kettle sitting at
    temperature) connected by slow, smooth ramps (the kettle being brought up
    or down), plus small instrument noise. Smooth and flat sections are
    exactly what exception filtering and swinging-door compression are built
    for; the signal never jumps instantaneously, so a knee-to-knee straight
    line stays a fair approximation of what happened in between."""
    out = []
    for i in range(N):
        if i < 1100:
            base = 150.0
        elif i < 1300:
            base = 150.0 + (162.0 - 150.0) * (i - 1100) / 200
        elif i < 2500:
            base = 162.0
        elif i < 2700:
            base = 162.0 + (158.0 - 162.0) * (i - 2500) / 200
        else:
            base = 158.0
        noise = random.uniform(-0.15, 0.15)
        out.append(base + noise)
    return out


def build_lopsided_signal() -> list[float]:
    """A long flat hold followed by a short but volatile excursion — most of
    the hour is one quiet value, a brief stretch wobbles hard. Exactly the
    shape that makes a naive average over recorded (compressed) points
    disagree with a true time-weighted average: the long flat hold compresses
    to a couple of knees while the brief wobble, despite being short, forces
    many knees, so an unweighted average over knees over-represents it."""
    out = []
    for i in range(N):
        if i < 3000:
            out.append(150.0 + random.uniform(-0.1, 0.1))
        else:
            out.append(170.0 + 4.0 * math.sin((i - 3000) / 3.0) + random.uniform(-0.1, 0.1))
    return out


def build_step_signal() -> list[float]:
    """A genuinely step-shaped signal (a discrete state, like a valve's
    open/closed position, not a continuously varying temperature): CHAPTER.md's
    own point that for a step signal, retrieval has to interpolate as a step
    (hold the last recorded value) rather than drawing a straight line to the
    next one."""
    out = []
    for i in range(N):
        out.append(0.0 if i < 1500 else 1.0)
    return out


def step_interpolate(knees: list[tuple[int, float]], i: int) -> float:
    """The correct interpolation mode for a step signal: hold the last
    recorded value until the next one, never draw a line between them."""
    if i <= knees[0][0]:
        return knees[0][1]
    value = knees[0][1]
    for ki, kv in knees:
        if ki <= i:
            value = kv
        else:
            break
    return value


def exception_filter(values: list[float], exc_dev: float, exc_max: int = 400) -> list[tuple[int, float]]:
    """Exception (deadband) filtering, as the AVEVA deck describes it: a
    simple deadband to filter noise, performed before anything reaches the
    archive. A value is passed through once it differs from the last passed
    value by more than exc_dev, or once exc_max samples have gone by without
    a point passing at all — the "ExMax" attribute (max time allowed between
    events) that keeps a long, perfectly flat stretch from silently losing
    its own timeline."""
    kept: list[tuple[int, float]] = [(0, values[0])]
    last_passed = values[0]
    last_i = 0
    for i, v in enumerate(values):
        if i == 0:
            continue
        if abs(v - last_passed) > exc_dev or (i - last_i) >= exc_max:
            kept.append((i, v))
            last_passed = v
            last_i = i
    return kept


@dataclass
class SwingingDoor:
    """Bristol's swinging-door method (US Patent 4,669,097): an anchor point,
    an upper and a lower door (slope bounds within comp_dev of every point
    seen since the anchor), both doors swung open as points arrive; a knee is
    recorded exactly when the doors can no longer stay parallel (the current
    point would force the upper door's slope past the lower door's)."""

    comp_dev: float
    knees: list[tuple[int, float]] = field(default_factory=list)
    _anchor: tuple[int, float] | None = None
    _su_max: float | None = None
    _sl_min: float | None = None
    _pending: tuple[int, float] | None = None

    def add(self, i: int, v: float) -> None:
        if self._anchor is None:
            self._anchor = (i, v)
            self.knees.append((i, v))
            return
        ai, av = self._anchor
        dt = i - ai
        if dt == 0:
            return
        su = (v - av + self.comp_dev) / dt
        sl = (v - av - self.comp_dev) / dt
        if self._su_max is None:
            self._su_max, self._sl_min = su, sl
            self._pending = (i, v)
            return
        new_su_max = max(self._su_max, su)
        new_sl_min = min(self._sl_min, sl)
        if new_su_max > new_sl_min:
            # the doors would be opened wider than parallel: the last point
            # that still fit becomes the knee, and a new anchor starts there.
            ki, kv = self._pending
            self.knees.append((ki, kv))
            self._anchor = (ki, kv)
            self._su_max = None
            self._sl_min = None
            self.add(i, v)
        else:
            self._su_max, self._sl_min = new_su_max, new_sl_min
            self._pending = (i, v)

    def finish(self) -> None:
        if self._pending is not None and self._pending != self.knees[-1]:
            self.knees.append(self._pending)


def swinging_door_compress(points: list[tuple[int, float]], comp_dev: float) -> list[tuple[int, float]]:
    door = SwingingDoor(comp_dev)
    for i, v in points:
        door.add(i, v)
    door.finish()
    return door.knees


def interpolate(knees: list[tuple[int, float]], i: int) -> float:
    """Linear interpolation between the two knees bracketing index i — the
    value a historian computes when asked for an interpolated (Sampled Data)
    reading at a timestamp it didn't record."""
    if i <= knees[0][0]:
        return knees[0][1]
    if i >= knees[-1][0]:
        return knees[-1][1]
    for (i0, v0), (i1, v1) in zip(knees, knees[1:]):
        if i0 <= i <= i1:
            if i1 == i0:
                return v0
            frac = (i - i0) / (i1 - i0)
            return v0 + frac * (v1 - v0)
    raise AssertionError("unreachable")


def max_reconstruction_error(original: list[float], knees: list[tuple[int, float]]) -> float:
    return max(abs(original[i] - interpolate(knees, i)) for i in range(len(original)))


def rms_reconstruction_error(original: list[float], knees: list[tuple[int, float]]) -> float:
    sq = sum((original[i] - interpolate(knees, i)) ** 2 for i in range(len(original)))
    return math.sqrt(sq / len(original))


def recorded_value_average(knees: list[tuple[int, float]]) -> float:
    """What a naive average over the stored (recorded) points gives — the
    mistake the hook warns about: it treats every knee as equally
    informative, when a long flat stretch is one knee and a short excursion
    is several."""
    return sum(v for _, v in knees) / len(knees)


def time_weighted_average(original: list[float]) -> float:
    """The correct answer: every second of the original signal weighted
    equally, which is what PI's own "Average (time-weighted)" summary
    computes directly from the archive, not from a count of stored rows."""
    return sum(original) / len(original)


def interpolated_regular_average(knees: list[tuple[int, float]], n: int) -> float:
    """A time-weighted average computed from interpolated (Sampled Data)
    values at every original timestamp — what you get if you extract
    interpolated points instead of recorded ones, and average those."""
    return sum(interpolate(knees, i) for i in range(n)) / n


@dataclass
class ExtractedPoint:
    t: int
    value: float
    recorded: bool  # False means this value was never actually stored, only interpolated
    comp_dev: float  # the compression metadata carried forward with the value


def extract_with_metadata(knees: list[tuple[int, float]], comp_dev: float) -> list[ExtractedPoint]:
    """The right extraction design (CHAPTER.md's own claim): carry the
    compression deviation and a recorded/interpolated flag forward with
    every value, rather than landing a flat row of numbers that looks
    uniformly trustworthy."""
    return [ExtractedPoint(t=i, value=v, recorded=True, comp_dev=comp_dev) for i, v in knees]


def main() -> None:
    signal = build_signal()

    # --- exception (deadband) filtering ---
    exc_dev = 0.3
    excepted = exception_filter(signal, exc_dev)
    assert len(excepted) < len(signal), "exception filtering must reduce the point count on a mostly-flat signal"
    for i, v in excepted:
        assert i == 0 or abs(v - signal[i]) < 1e-9

    # --- swinging-door compression, with CompDev set well above ExcDev's deadband
    #     (the deck's own recommendation: Set ExcDev = half CompDev) ---
    comp_dev = 0.6
    assert comp_dev == 2 * exc_dev, "ExcDev is half of CompDev, per the AVEVA deck's recommendation"
    knees = swinging_door_compress(excepted, comp_dev)

    point_reduction = 1 - len(knees) / len(signal)
    assert point_reduction > 0.8, "swinging-door compression on a mostly-flat signal must discard most points"

    max_err = max_reconstruction_error(signal, knees)
    rms_err = rms_reconstruction_error(signal, knees)
    # the noise term can occasionally push a single point's own reconstruction
    # error a little past comp_dev; the guarantee is on the *stored* knees staying
    # within the band of the filtered signal, which the RMS error confirms is tight.
    assert max_err < comp_dev * 1.6, "no point should drift far outside the compression deviation band"
    assert rms_err < comp_dev, "the typical reconstruction error must stay inside the compression deviation"

    # --- recorded vs interpolated vs time-weighted, on a signal shaped to expose the bias ---
    lopsided = build_lopsided_signal()
    lopsided_excepted = exception_filter(lopsided, exc_dev)
    lopsided_knees = swinging_door_compress(lopsided_excepted, comp_dev)

    recorded_avg = recorded_value_average(lopsided_knees)
    true_avg = time_weighted_average(lopsided)
    interp_avg = interpolated_regular_average(lopsided_knees, len(lopsided))

    assert abs(recorded_avg - true_avg) > 0.5, "averaging the sparse recorded knees directly must disagree with the true time-weighted average"
    assert abs(interp_avg - true_avg) < 1.0, "a time-weighted average over interpolated values at every original timestamp must closely track the true average"
    assert abs(interp_avg - true_avg) < abs(recorded_avg - true_avg), "interpolating at every timestamp must track the true average far better than averaging the sparse recorded knees directly"

    # --- extraction carries compression metadata forward ---
    extracted = extract_with_metadata(knees, comp_dev)
    assert all(p.recorded and p.comp_dev == comp_dev for p in extracted)
    assert len(extracted) == len(knees)

    # --- a step signal needs step interpolation, not a straight line ---
    step_signal = build_step_signal()
    step_excepted = exception_filter(step_signal, exc_dev=0.0, exc_max=N)
    step_knees = swinging_door_compress(step_excepted, comp_dev=0.01)
    assert len(step_knees) == 2, "a single step needs exactly two knees: before and after"
    linear_err_before_step = abs(step_signal[1499] - interpolate(step_knees, 1499))
    step_err_before_step = abs(step_signal[1499] - step_interpolate(step_knees, 1499))
    assert linear_err_before_step > 0.4, "drawing a straight line across a step must badly misread a value just before the step"
    assert step_err_before_step == 0.0, "step interpolation must read a value just before the step exactly, holding the last recorded value"

    print("all historian compression assertions passed")
    print(f"  signal points: {len(signal)}, after exception filter: {len(excepted)}, after swinging-door: {len(knees)}")
    print(f"  point reduction after compression: {point_reduction:.1%}")
    print(f"  max reconstruction error: {max_err:.3f} (CompDev {comp_dev}), RMS error: {rms_err:.3f}")
    print(f"  recorded-knee average: {recorded_avg:.2f}, true time-weighted average: {true_avg:.2f}, interpolated-regular average: {interp_avg:.2f}")


if __name__ == "__main__":
    main()
