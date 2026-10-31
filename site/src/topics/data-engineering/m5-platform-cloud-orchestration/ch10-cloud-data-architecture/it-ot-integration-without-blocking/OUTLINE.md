# Outline: IT/OT integration without blocking production

**Syllabus line (syllabus/data-engineering.md):** "ISA-95 levels and Purdue-model segmentation, OT DMZs and data diodes, MES/SCADA/historian extraction via OPC UA, MQTT/Sparkplug B and historian APIs, edge buffering so a slow consumer can never backpressure a PLC or MES, unified-namespace pattern; the plant data model itself is §16.1, master-data consistency is §8.3."

## Claims to fact-check

1. The Purdue Reference Model is a five-level hierarchy: Level 0 the physical process, Level 1 field devices and controllers, Level 2 operator stations and supervisory systems, Level 3 plant-level manufacturing operations (MES, historians), Level 4 site business systems (ERP), and Level 5 corporate/enterprise systems (Process Control Guide).
2. An industrial DMZ (iDMZ) sits at Level 3.5, between Level 3 and Level 4; it is its own zone, not part of either network; its defining rule is that no traffic crosses the IT/OT boundary without terminating in the iDMZ first, and OT systems should never initiate connections toward the enterprise network (Software Toolbox).
3. A data diode is a hardware device that physically enforces one-way data flow using separate physical transmit and receive paths, giving a stronger guarantee against reverse traffic than a software firewall's configurable rules (Network Critical).
4. IEC 62443 defines security zones connected by conduits, and a conduit carrying data from a higher-trust OT zone to a lower-trust IT zone is a candidate for diode enforcement (Network Critical).
5. OPC UA is a platform-independent standard for secure, reliable information exchange between diverse industrial systems and devices, with its own security model covering authentication, encryption and integrity (OPC Foundation).
6. Sparkplug defines an MQTT topic namespace, payload, and session state management, purpose-built for real-time SCADA/control HMI requirements (Eclipse Foundation).
7. Sparkplug B's birth and death certificates (NBIRTH/NDEATH for an edge node, DBIRTH/DDEATH for a device behind it) solve the pub/sub problem that consumers otherwise have no inherent knowledge of what devices exist or whether they're connected; NDEATH is delivered via MQTT's own Last Will and Testament mechanism on an ungraceful disconnect (Software Toolbox).
8. A Unified Namespace is a middleware pattern where participants publish to a central repository instead of contacting each other directly, removing direct point-to-point coupling between control and IT systems; ISA-95 is a functional modeling standard, not a networking standard, and is complementary to a Unified Namespace architecture rather than competing with it (HiveMQ).

## Changes from the chapter plan

CHAPTER.md's own scope quote drops the trailing clause "the plant data model itself is §16.1, master-data consistency is §8.3." CHAPTER.md's own "Leaves out" bullet already names both forward references in prose; this topic additionally maps them formally in `coverage.json`: the plant data model to "ISA-95 hierarchy and the automation pyramid" (§16.1), and master-data consistency to "Master data management styles" (§8.3) — both confirmed as real, live (non-skipped) syllabus topics.

This topic cannot connect to a real PLC, SCADA system, MQTT broker running Sparkplug B, or OPC UA server in this sandbox. `examples.py` reproduces the edge-buffering mechanism itself — a local queue standing in for an MQTT/Sparkplug B broker between an OT source and a deliberately stalled downstream consumer — against synthetic data shaped like the documented behavior, proving the upstream side is unaffected by the stall while an unbuffered design is not.

## Engagement arc

Hook: an analytics team connects a new dashboard directly to a plant's SCADA system for simplicity; a query left running overnight slows SCADA's own response time enough to delay an alarm acknowledgement — a near-miss that an edge-buffered design makes structurally impossible rather than merely unlikely. Teaching: the Purdue model's five levels as the vocabulary everything else assumes; the iDMZ and data diodes as the segmentation pattern, with the diode's one-way guarantee coming from physics rather than policy; the three extraction mechanisms (OPC UA, MQTT/Sparkplug B with its birth/death certificates, historian APIs) and what each is actually for; edge buffering as the one rule this topic exists to protect, proven by stalling a downstream consumer against a buffered pipeline versus an unbuffered one; the unified namespace as the alternative to point-to-point integration. Recap + takeaways. Predict step: given a described integration scenario, which Purdue level or mechanism it actually implicates.

## Concept ledger

**Introduces:** `isa95-purdue-segmentation`, `ot-edge-buffer-backpressure-isolation`, `unified-namespace-pattern`.
**Uses:** `sap-extraction-mechanism-choice`, `cloud-cost-four-dimensions`.
**Declared:** none beyond topic 19.

## Bridge / handoff

**Bridge:** "SAP extraction is still reading from a database or an API, in the end. A factory floor is not a database at all, and this topic's one non-negotiable rule has no equivalent in anything else this chapter has taught: whatever an analytics consumer does downstream, it must be physically or architecturally impossible for that to ever push back on a production line."

**Handoff:** "SAP and the plant floor are two real-world systems with their own extraction rules. The platform all of this ultimately has to run on — fully in the cloud, fully on-prem, or split between the two — is the chapter's own closing question."
