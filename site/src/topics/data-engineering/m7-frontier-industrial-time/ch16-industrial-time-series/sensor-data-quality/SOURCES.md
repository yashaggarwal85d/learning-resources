# Sources

## OPC UA Part 4: StatusCode (7.38)

URL: https://reference.opcfoundation.org/Core/Part4/v105/docs/7.38
Version: OPC 10000-4, v1.05.07, retrieved 2026-10-31

> A StatusCode in OPC UA is numerical value that is used to report the outcome of an operation performed by an OPC UA Server.

> All OPC UA Clients shall always check the StatusCode associated with a result before using it. Results that have an uncertain/warning status associated with them shall be used with care since these results might not be valid in all situations. Results with a bad/failed status shall never be used.

Contents: the Good/Uncertain/Bad convention this topic's quality flag (good/suspect/bad) is modeled on directly.

## OPC UA Part 4: DataValue (7.11)

URL: https://reference.opcfoundation.org/Core/Part4/v105/docs/7.11
Version: OPC 10000-4, v1.05.07, retrieved 2026-10-31

> value BaseDataType The data value. If the StatusCode indicates an error then the value is to be ignored and the Server shall set it to null. statusCode StatusCode The StatusCode that defines the Server's ability to access/provide the value.

Contents: DataValue's own structure (a value paired with a StatusCode and a timestamp), the in-course precedent this topic's quarantine entry is modeled on — a flagged point keeps its value and gets a status attached, rather than being deleted.

## OPC UA Part 8: EURange (5.3)

URL: https://reference.opcfoundation.org/Core/Part8/v105/docs/5.3
Version: OPC 10000-8, v1.05.07, retrieved 2026-10-31

> EURange defines the value range likely to be obtained in normal operation. It is intended for such use as automatically scaling a bar graph display. Sensor or instrument failure or deactivation can result in a returned item value which is actually outside of this range.

> EXAMPLE 3: EURange::= {-200.0,1400.0}

Contents: the named, sourced instrument-span convention this topic's range check cites. CHAPTER.md asks for a real instrument datasheet, falling back to the OPC UA specification if a vendor page (AVEVA PI's data-quality documentation, checked and not found at a stable, fetchable URL at research time) isn't reachable; this topic uses that fallback, citing OPC UA's own EURange property and its own worked numeric example as the sourced span convention, consistent with the chapter's prior "named limit with its source" requirement.

## NIST: Kelvin (absolute zero)

URL: https://physics.nist.gov/cuu/Units/kelvin.html
Version: NIST, retrieved 2026-10-31

> (0 K = -273.15 degrees C = -459.67 degrees F. Room temperature is about 70 degrees F, 21 degrees C or 294 K.)

Contents: the physical limit this topic's "physically impossible reading" example (a temperature below absolute zero) is checked against.

## Chapter 13's dq-gates-vs-posthoc-scans and dq-check-cost-incremental-metrics-sampling ids (named only — not yet built)

URL: (none)
Version: n/a

CHAPTER.md's `uses` line names `dq-gates-vs-posthoc-scans` and `dq-check-cost-incremental-metrics-sampling` (Chapter 13 topic 12). Verified by grep at build time: neither id appears anywhere in `registry.ts` — Chapter 13's own data-quality topic that was meant to introduce them has not shipped under those ids. This topic does not claim either; see `OUTLINE.md` for the gap. Same handling as the chapter's prior Chapter 5/6/13/15 gaps (topics 6, 10, 11, 12, 14).
