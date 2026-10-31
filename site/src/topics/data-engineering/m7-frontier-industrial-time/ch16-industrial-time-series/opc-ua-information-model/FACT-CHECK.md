# Fact check

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | References relate Nodes to each other; the containing Node is the SourceNode and the referenced Node is the TargetNode. | OPC UA Part 3: References | Confirmed verbatim |
| 2 | MessageSecurityMode's values are INVALID (0, the default, to avoid an accidental choice of no security), NONE (1), SIGN (2), SIGNANDENCRYPT (3). | OPC UA Part 4: MessageSecurityMode | Confirmed verbatim |
| 3 | A DataChangeFilter's Deadband generates a Notification if the absolute value of (last cached value - current value) exceeds the AbsoluteDeadband. | OPC UA Part 4: DataChangeFilter | Confirmed verbatim |
| 4 | TimestampsToReturn's values are SOURCE, SERVER, BOTH, NEITHER. | OPC UA Part 4: TimestampsToReturn | Confirmed verbatim |
| 5 | Publishers and Subscribers are loosely coupled and often don't know each other. | OPC UA Part 14: PubSub | Confirmed verbatim |
| 6 | OPC 40501-1 (Machine Tools) is at release version 1.02.0, published 2024-11-01. | OPC Foundation: MachineTool reference page | Confirmed verbatim |
| 7 | A path browsed from an Object node down through References reaches a Variable node with its own data type and engineering unit. | `examples.py` (`browse_path`, `build_address_space`) | Computed and asserted |
| 8 | An absolute-deadband monitored item reports fewer notifications than polling would see over the same signal, and a jump larger than the deadband still fires. | `examples.py` (`simulate_subscription`, `absolute_deadband_fires`) | Computed and asserted, both directions |
| 9 | PubSub's own published message count doesn't depend on the number of subscribers, while client/server's per-subscriber notification cost does. | `examples.py` (`pubsub_message_cost`, `client_server_session_cost`) | Computed and asserted at 1, 10 and 1000 subscribers |
| 10 | Security mode None is correctly flagged as a finding; Invalid, Sign and SignAndEncrypt are not. | `examples.py` (`is_security_finding`) | Computed and asserted, all four modes |

## Red team

- **Is the small, hand-built address space in `examples.py` a real OPC UA server, or does it overstate what was actually run?** It's a from-scratch structure matching the specification's own node/reference model, not a running OPC UA stack — no OPC UA server library was installed or reachable in this sandbox, so `OUTLINE.md` and this file state that directly rather than implying a live server was used.
- **Does dropping the unverified "150+" companion specification count understate the chapter's own claim?** No — CHAPTER.md's own text already instructs the builder not to assert any individual companion specification's contents beyond its own page, and the count is a side detail, not a load-bearing claim; the one example this topic does cite (OPC 40501-1) is independently dated and versioned.
- **Does the client/server-vs-PubSub comparison fairly represent client/server, or stack the deck?** The comparison only counts notification/message volume, which is exactly what CHAPTER.md's own scope asks to state as "the trade-off (sessions and per-client state against fan-out and a broker)" — it does not claim client/server is worse overall, since CHAPTER.md's own text also notes PubSub trades a broker's own operational cost for that fan-out.
- **Is treating security mode None as always a "finding" too strong a claim?** No — this is CHAPTER.md's own explicit instruction ("security mode None is common in plants and is a finding, not a default"), and the specification's own default value is designed specifically so that no security is never chosen by accident, which this topic's assertion checks directly.
- **Checked `reel.tsx`, `scenes.tsx`, `narration.json` for leaked exact phrasing from the quoted sources** — none found.
