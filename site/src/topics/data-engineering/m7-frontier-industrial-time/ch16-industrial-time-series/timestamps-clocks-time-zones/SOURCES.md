## OPC UA Part 4: Services — 7.11 DataValue

URL: https://reference.opcfoundation.org/Core/Part4/v105/docs/7.11
Version: OPC 10000-4, v1.05 (current reference release)

The source timestamp field.

> The source timestamp for the value.

The server timestamp field.

> The Server timestamp for the value.

The source timestamp's own guarantee: it never changes once assigned.

> The sourceTimestamp is used to reflect the timestamp that was applied to a Variable value by the data source. Once a value has been assigned a source timestamp, the source timestamp for that value instance never changes. In this context, "value instance" refers to the value received, independent of its actual value.

What happens when no source timestamp is available.

> If the OPC UA Server receives the Variable value from another OPC UA Server, then the OPC UA Server shall always pass the source timestamp without changes. If the source that applies the timestamp is not available, the source timestamp is set to null. For example, if a value could not be read because of some error during processing like invalid arguments passed in the request then the sourceTimestamp shall be null.

Contents: §7.11's full DataValue structure (value, status, source/server timestamps and picoseconds fields); used here only for the source-vs-server timestamp distinction this topic's three-clock notation builds on.

## OPC UA Part 4: Services — 7.39 TimestampsToReturn

URL: https://reference.opcfoundation.org/Core/Part4/v105/docs/7.39
Version: OPC 10000-4, v1.05 (current reference release)

The enumeration's four values, letting a client ask for either timestamp, both, or neither.

> SOURCE 0 Return the source timestamp.

> SERVER 1 Return the Server timestamp.

> BOTH 2 Return both the source and Server timestamps.

Contents: Table 180's full `TimestampsToReturn` enumeration (SOURCE, SERVER, BOTH, NEITHER, INVALID); used to show that OPC UA treats which timestamp to return as an explicit per-request choice, not a fixed default.

## RFC 5905: Network Time Protocol Version 4

URL: https://www.rfc-editor.org/rfc/rfc5905
Version: IETF RFC 5905, June 2010

NTP's own on-wire design depends only on measured clock offsets, not reliable delivery.

> The on-wire protocol described in Section 8 is based on a returnable-time design that depends only on measured clock offsets, but does not require reliable message delivery.

Contents: §3's architecture overview; used here only for the "measured clock offsets" framing this topic's device-to-gateway offset measurement reuses, alongside Chapter 14's own `clock-drift-ntp-error` (not re-derived here).

## RFC 3339: Date and Time on the Internet: Timestamps

URL: https://www.rfc-editor.org/rfc/rfc3339
Version: IETF RFC 3339, July 2002

The Unknown Local Offset Convention: a way to admit the offset to local time isn't known, while still being honest that the instant in UTC is.

> If the time in UTC is known, but the offset to local time is unknown, this can be represented with an offset of "-00:00". This differs semantically from an offset of "Z" or "+00:00", which imply that UTC is the preferred reference point for the specified time.

Contents: §4.3's Unknown Local Offset Convention; used for the "never store local time without its zone" rule's one documented exception (an admitted-unknown offset, not a silently-dropped one).

## Theory and pragmatics of the tz code and data (IANA tz database)

URL: https://data.iana.org/time-zones/tzdb/theory.html
Version: tz database documentation, retrieved 2026-10-31

Time zone abbreviations are ambiguous across regions and should not be relied on.

> Application writers should note that these abbreviations are ambiguous in practice: e.g., CST means one thing in China and something else in North America, and IST can refer to time in India, Ireland or Israel. To avoid ambiguity, use numeric UT offsets like -0600 instead of time zone abbreviations like CST.

Contents: the tz database's own naming and abbreviation-ambiguity guidance; used for the warning this topic repeats about shift-calendar presentation never relying on an abbreviation to disambiguate a zone.

## IEEE 1588-2019: Standard for a Precision Clock Synchronization Protocol for Networked Measurement and Control Systems

URL: https://standards.ieee.org/standard/1588-2019.html
Version: IEEE SA standard page, PAR approval 2016-09-22, superseding 1588-2008

The standard's own abstract.

> In this standard, a protocol is defined that provides precise synchronization of clocks in packet-based networked systems. Synchronization of clocks can be achieved in heterogeneous systems that include clocks of different inherent precision, resolution, and stability. The protocol supports synchronization accuracy and precision in the sub-microsecond range with minimal network and local computing resources.

Contents: the standard's abstract only (CHAPTER.md asks for the abstract, not the full specification text, which is commercial); used to name PTP as the sub-millisecond alternative to NTP this topic points to without teaching its deployment.
