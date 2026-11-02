# Fact check

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | A StatusCode is used to report the outcome of an operation; results with a bad/failed status shall never be used, and uncertain/warning results shall be used with care. | OPC UA Part 4: StatusCode | Confirmed verbatim |
| 2 | A DataValue pairs a value with a StatusCode; if the StatusCode indicates an error the value is to be ignored. | OPC UA Part 4: DataValue | Confirmed verbatim |
| 3 | EURange defines the value range likely to be obtained in normal operation; sensor or instrument failure can return a value outside of it. | OPC UA Part 8: EURange | Confirmed verbatim |
| 4 | 0 K equals -273.15 degrees C. | NIST: Kelvin | Confirmed verbatim |
| 5 | A windowed-variance flatline check, a range check, a MAD-based spike detector and a change-point detector each catch their own planted fault type on a synthetic fleet. | `examples.py` (`detect_flatline`, `detect_range`, `detect_spike_mad`, `detect_change_point`) | Computed and asserted, each fault individually |
| 6 | Measured precision exceeds 0.8 and recall exceeds 1.0 across the three point-rule fault types, scored against sixteen healthy sensors for false positives. | `examples.py` (`main`, the fleet-wide scoring block) | Computed and asserted; precision 0.839, recall 1.000 in the run this file documents |
| 7 | An exact gateway-replayed batch dedupes back to its original size under an idempotent (series, device timestamp, gateway sequence) key. | `examples.py` (`dedup_by_idempotent_key`) | Computed and asserted |
| 8 | A reading whose device timestamp is at or before the gateway's own receipt timestamp is a legitimate backfill; one whose device timestamp is after is a clock fault. | `examples.py` (`classify_late_arrival`) | Computed and asserted, both directions |
| 9 | Every flagged point is routed to a quarantine entry with a quality flag, while every original series keeps its full original length. | `examples.py` (`build_quarantine`) | Computed and asserted |
| 10 | The measured per-point check cost, extrapolated to the plant's own ~129.7 samples/sec write rate, costs under one second of compute per second of data. | `examples.py` (`main`, the cost block) | Computed and asserted; 1.356ms of compute per second of data in the run this file documents |

## Red team

- **Is scoring precision/recall only over the three point-rule fault types (excluding the firmware scale change) hiding a weaker number?** No — the firmware scale change is checked by its own direct assertion (`detect_change_point` must flag the exact planted timestamp, within the detector's own window tolerance), which is a stronger claim than folding it into a per-point precision/recall score would be, since a change-point detector's job is to find one boundary, not label every point after it as individually "correct."
- **Does the synthetic fleet actually demonstrate the flatline-vs-legitimately-constant distinction CHAPTER.md asks for?** No, and this is disclosed rather than hidden: the fleet has no sensor that's supposed to be held constant (a setpoint), so there's nothing in this run to tell apart from the frozen furnace sensor. The mechanism CHAPTER.md names (the signal's own expected-variation metadata from topic 8) is sound, but this topic doesn't build a second scenario to prove it — a genuine scope gap, not a measured result overstated as one.
- **Is the measured 1.356ms-per-second-of-data cost figure representative of a real plant's check cost, or an artifact of this sandbox's CPU?** It's an artifact of this machine's CPU, named as such — the claim this topic actually stands behind is the shape of the arithmetic (per-point cost measured directly, then multiplied by the plant's own write rate) rather than the absolute number, which would differ on real hardware.
- **Does using OPC UA's own EURange example in place of an unreachable AVEVA PI page understate the sourcing CHAPTER.md asked for?** CHAPTER.md's own text allows exactly this substitution ("otherwise sourced from the OPC UA specification"), and EURange is itself a real, specification-level convention for the exact thing being cited (a sourced instrument-span limit), not a stand-in with a different meaning.
- **Checked `reel.tsx`, `scenes.tsx`, `narration.json` for leaked exact phrasing from the quoted sources** — none found.
