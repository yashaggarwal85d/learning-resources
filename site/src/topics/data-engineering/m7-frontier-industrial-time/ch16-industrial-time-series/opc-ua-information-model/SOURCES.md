# Sources

## OPC UA Part 3: References (4.4.4)

URL: https://reference.opcfoundation.org/Core/Part3/v105/docs/4.4
Version: OPC 10000-3, v1.05.06, retrieved 2026-10-31

> References are used to relate Nodes to each other. They can be accessed using the browsing and querying Services defined in OPC 10000-4.

> The Node that contains the Reference is referred to as the SourceNode and the Node that is referenced is referred to as the TargetNode.

Contents: the typed-reference model this topic's address space is built from directly.

## OPC UA Part 4: MessageSecurityMode (7.20)

URL: https://reference.opcfoundation.org/Core/Part4/v105/docs/7.20
Version: OPC 10000-4, v1.05.07, retrieved 2026-10-31

> The MessageSecurityMode is an enumeration that specifies what security should be applied to messages exchanges during a Session.

> INVALID 0 The MessageSecurityMode is invalid. This value is the default value to avoid an accidental choice of no security is applied. This choice will always be rejected. NONE 1 No security is applied. SIGN 2 All messages are signed but not encrypted. SIGNANDENCRYPT 3 All messages are signed and encrypted.

Contents: the security-mode enumeration this topic's `is_security_finding` checks directly, including the specification's own stated reason the default is invalid rather than None.

## OPC UA Part 4: DataChangeFilter / Deadband (7.22.2)

URL: https://reference.opcfoundation.org/Core/Part4/v105/docs/7.22
Version: OPC 10000-4, v1.05.07, retrieved 2026-10-31

> The DataChangeFilter defines the conditions under which a DataChange Notification should be reported and, optionally, a range or band for value changes where no DataChange Notification is generated. This range is called Deadband.

> Generate a Notification if (absolute value of (last cached value - current value) > AbsoluteDeadband)

Contents: the exact AbsoluteDeadband rule this topic's `absolute_deadband_fires` implements verbatim.

## OPC UA Part 4: TimestampsToReturn (7.39)

URL: https://reference.opcfoundation.org/Core/Part4/v105/docs/7.39
Version: OPC 10000-4, v1.05.07, retrieved 2026-10-31

> SOURCE 0 Return the source timestamp. SERVER 1 Return the Server timestamp. BOTH 2 Return both the source and Server timestamps. NEITHER 3 Return neither timestamp.

Contents: the two-timestamp convention (named only here; the dual source/server timestamp itself is already run in this topic's `DataValue`).

## OPC UA Part 14: PubSub, General (5.1)

URL: https://reference.opcfoundation.org/Core/Part14/v105/docs/5.1
Version: OPC 10000-14, v1.05.06, retrieved 2026-10-31

> Publishers and Subscribers are loosely coupled. They often will not even know each other. Their primary relation is the shared understanding of specific types of data (DataSets), the publish characteristics of messages that include these data, and the Message Oriented Middleware.

Contents: the decoupling this topic's PubSub-vs-client/server fan-out comparison is built on directly.

## OPC UA for Machine Tools, Part 1 (companion specification example)

URL: https://reference.opcfoundation.org/MachineTool/v200/docs/
Version: Document OPC 40501-1, Release Version 1.02.0, Publication Date 2024-11-01, retrieved 2026-10-31

> Document OPC 40501-1

> Release Version 1.02.0

> Publication Date 2024-11-01

Contents: the companion specification named in CHAPTER.md's example, with its own version and publication date rather than an undated claim.

## The "150+" companion specification count (not independently verified)

URL: (none)
Version: n/a

CHAPTER.md's text attributes a "150+" companion specification count to "the OPC Foundation's landing page." At research time, the OPC Foundation's companion specifications page did not yield that figure at a stable, fetchable URL. This topic does not repeat that specific number; it states only that OPC UA has multiple companion specifications, named by the one example (OPC 40501-1) actually fetched and dated above.

## Chapter 5's queues-vs-logs id (named only — not yet built)

URL: (none)
Version: n/a

CHAPTER.md's `uses` line names `queues-vs-logs` (Chapter 5). Verified by grep before writing this
file: the id does not exist in any topic's `introduces` array in `registry.ts` — Chapter 5's own
queues-vs-logs topic hasn't shipped. This topic omits it from its own `uses` list rather than
claiming a topic that hasn't shipped — the same pattern as topics 6, 10, 11, 12, 14 and 15's prior
gaps. Every other id this topic's `uses` line names (`equipment-hierarchy-dimension`,
`isa95-levels-data-ownership`, `read-only-extraction-load-budget`, `ot-change-management-tag-contract`,
`device-gateway-ingest-timestamps`, `event-time-source-decision`, `quality-flag-and-quarantine-not-delete`,
`aggregate-by-signal-type`, `signal-type-tag-metadata`) was verified by grep to already exist.
