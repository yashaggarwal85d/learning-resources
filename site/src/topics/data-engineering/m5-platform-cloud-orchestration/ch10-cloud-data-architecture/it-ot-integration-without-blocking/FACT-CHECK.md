# Fact-check: IT/OT integration without blocking production

| # | Claim | Source | Verdict |
|---|---|---|---|
| 1 | The Purdue Reference Model is a five-level hierarchy from the physical process (Level 0) through controllers (Level 1), operator stations (Level 2), plant operations (Level 3), to enterprise systems (Level 4), with Level 5 (corporate) added later as multi-site enterprises became common | Process Control Guide | Confirmed, verbatim quotes |
| 2 | The iDMZ sits at Level 3.5, between Level 3 and Level 4; it is its own zone, not part of either network; no traffic crosses the IT/OT boundary without terminating in the iDMZ first, and OT systems should never initiate connections toward the enterprise network | Software Toolbox | Confirmed, verbatim quotes |
| 3 | A data diode is a hardware device using separate physical transmit and receive paths that physically enforces one-way data flow; reverse traffic is not possible regardless of configuration, unlike a software firewall's rules | Network Critical | Confirmed, verbatim quotes |
| 4 | IEC 62443 defines security zones connected by conduits; a conduit carrying data from a higher-trust OT zone to a lower-trust IT zone is a candidate for diode enforcement | Network Critical | Confirmed, verbatim quote |
| 5 | OPC UA is a platform-independent standard for secure information exchange between diverse industrial systems, with its own security model (authentication, encryption, integrity) rather than relying on network-level controls alone | OPC Foundation | Confirmed, verbatim quotes |
| 6 | Sparkplug defines an MQTT topic namespace, payload, and session state management, purpose-built to meet real-time SCADA/control HMI requirements | Eclipse Foundation | Confirmed, verbatim quote |
| 7 | Sparkplug B's birth/death certificates (NBIRTH/NDEATH, DBIRTH/DDEATH) solve the problem that pub/sub consumers otherwise have no inherent knowledge of what devices exist or are connected; NDEATH is delivered via MQTT's own Last Will and Testament on an ungraceful disconnect | Software Toolbox | Confirmed, verbatim quotes |
| 8 | A Unified Namespace is a middleware pattern where participants publish to a central repository instead of contacting each other directly; ISA-95 is a functional modeling standard, not a networking standard, and is complementary to a Unified Namespace architecture | HiveMQ | Confirmed, verbatim quotes |
| 9 | The edge-buffering isolation guarantee (a stalled downstream consumer cannot propagate backpressure into the OT source when a buffer sits between them) behaves as documented when reproduced against synthetic data | Derived in `examples.py`, run and verified locally | Confirmed by running the code |

## Red-team

- **Does this topic overstate what a data diode guarantees versus a firewall?** No — Network Critical's own language is used precisely: a diode's one-way guarantee is physical ("separate physical transmit and receive paths," "regardless of configuration"), while a firewall's is a software policy that "can be misconfigured or bypassed." The topic states this as the real difference, not a claim that firewalls are useless.
- **Is ISA-95 itself a networking or security standard, which would contradict naming it alongside the Purdue model's security zones?** No — HiveMQ's own source is explicit that ISA-95 "does not impose a pyramidal network-and-system architectural approach" and is "purely a functional modeling standard, not an inter-networking one." The topic is careful to attribute the levels-as-security-zones framing to the Purdue model and IEC 62443 practice, not to ISA-95 itself, and to name the Unified Namespace as complementary to ISA-95 rather than a replacement for it.
- **Is the edge-buffering mechanism invented, or a reproduction of a documented pattern?** It is a reproduction of the documented pattern (an MQTT broker in the iDMZ receiving OT-side publications and exposing them to IT-side consumers, per Software Toolbox's own description), simplified to a local queue and a stalled consumer — not a claim to have run a real MQTT broker or Sparkplug B stack.
- **Can this topic demonstrate any of this against a real PLC, SCADA system or MQTT broker?** No — disclosed in OUTLINE.md: no real industrial control system or message broker runs in this sandbox. `examples.py` reproduces the backpressure-isolation guarantee itself as a disclosed structural simulation against synthetic events, not a live deployment.

## Outcome

27 quotes across 7 sources (Process Control Guide, Software Toolbox ×2, Network Critical, OPC Foundation, Eclipse Foundation, HiveMQ), 0 problems (`node scripts/sources.mjs check`). `examples.py` runs clean, reproducing Purdue-level classification and the buffered-vs-unbuffered backpressure-isolation comparison.
