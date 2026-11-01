---
id: de.it-ot-integration-without-blocking
title: 'IT/OT integration without blocking production'
---

<section data-section="outcomes">

## Outcomes

- Place a named system on its correct ISA-95/Purdue level.
- Explain what a data diode guarantees that a firewall rule alone does not.
- Choose between OPC UA, MQTT/Sparkplug B and a historian API for a given extraction need.
- Design an edge-buffered pipeline and prove a stalled downstream consumer cannot backpressure the OT source.
- Explain what a unified namespace buys over point-to-point integration.

</section>

<section data-section="internals">

## Internals

- **The Purdue levels are a vocabulary, not a security feature by themselves.** A level only becomes a security boundary once a zone and conduit — an iDMZ, a firewall, a diode — is actually placed at it; naming the level a system sits on is step one, not the whole answer.
- **A data diode's guarantee is physical, a firewall's is a policy.** The same sentence that makes a diode harder to deploy (it needs its own hardware, in its own direction) is the sentence that makes its one-way guarantee survive a misconfiguration that would defeat a firewall rule.
- **Each extraction mechanism answers a question the others don't.** OPC UA is the direct, secured read. Sparkplug B's birth and death certificates answer "what exists and is it still connected" without polling. A historian API answers "what happened," after the fact, not "what is happening now."
- **Backpressure isolation is provable, not just assumed.** The hook's near-miss and the buffer's fix are the same mechanism from two sides: stall a consumer with nothing between it and the source, and the stall reaches backward; put a buffer there, and it provably doesn't — this topic's own `examples.py` reproduces both halves of that proof.
- **A unified namespace and ISA-95 are not competing standards.** One is how systems move data without knowing about each other; the other is how that data is modeled once it arrives. Conflating them as the same kind of thing is a common framing error this topic avoids on purpose.

</section>

<section data-section="production">

## Production

An analytics team wires a new dashboard directly into a plant's SCADA system because it's the simplest path to a demo. Months later, an analyst leaves a heavier query running overnight. SCADA's own response time degrades just enough that an operator's alarm acknowledgement is delayed — not because anything broke, but because nothing was ever between the dashboard and the control system to absorb it.

</section>

<section data-section="frontier">

## Frontier

Which extraction mechanism or buffering pattern a given plant actually runs is this topic's own text describing documented capability, not a claim about what any specific real plant has deployed — no real PLC, SCADA system or MQTT broker runs in this sandbox. The underlying questions — what level a system sits on, whether its connection to IT is brokered or direct, and whether a slow consumer can ever reach backward into it — stay the right questions regardless of which specific protocol stack any given plant eventually runs.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

SAP and the plant floor are two real-world systems with their own extraction rules. The platform all of this ultimately has to run on — fully in the cloud, fully on-prem, or split between the two — is the chapter's own closing question.

</section>
