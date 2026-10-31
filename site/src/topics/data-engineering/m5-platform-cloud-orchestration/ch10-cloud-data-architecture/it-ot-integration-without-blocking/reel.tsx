import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Process Control Guide's own Purdue-level definitions, Software Toolbox's own iDMZ and
// Sparkplug B pages, Network Critical's own data-diode guide, the OPC Foundation's and
// Eclipse Foundation's own specifications, and HiveMQ's own unified-namespace article
// (SOURCES.md). No real PLC, SCADA system or MQTT broker runs in this sandbox; examples.py
// reproduces Purdue-level classification and the buffered-vs-unbuffered backpressure test.
const reel: Reel = {
  steps: [
    {
      title: "A dashboard connects straight to SCADA, for simplicity",
      body: (
        <>
          An analytics team wires a new dashboard directly into the plant's SCADA system —
          no extra moving parts, just a query against the live system. One query left running
          overnight slows SCADA's own response time enough to delay an operator acknowledging
          an alarm. Nothing technical failed. The connection itself was the risk.
        </>
      ),
      duration: 5.0,
      Visual: S.DirectDashboardHook,
    },
    {
      title: 'Before the levels: what actually has to change here?',
      body: (
        <>
          Rewriting the query faster wouldn't have prevented this — a slower query, or a
          busier dashboard, would cause the same near-miss again. What has to change is the
          architecture itself. Which single change makes this near-miss structurally
          impossible rather than merely less likely?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: "Give the dashboard a faster, better-optimized query" },
          { label: 'Put a local buffer between the OT source and the analytics consumer, so the consumer never talks to SCADA directly', correct: true },
          { label: "Run the dashboard's query less often" },
          { label: 'Move the dashboard onto the same network as SCADA for lower latency' },
        ],
        explain: (
          <>
            A buffer between the two. A faster or less frequent query only lowers the odds of
            the same failure — it doesn't remove the direct connection that made the failure
            possible in the first place.
          </>
        ),
      },
      Visual: S.PredictWhatChanges,
    },
    {
      title: 'Five levels, one vocabulary for everything that follows',
      body: (
        <>
          The physical process sits at the bottom. Field devices and controllers sit above it.
          Operator stations and supervisory systems sit above that. Manufacturing operations —
          MES, historians — sit above those. Site business systems, and then the corporate
          layer, sit at the top. Every other clause in this topic assumes this ladder.
        </>
      ),
      duration: 5.0,
      Visual: S.PurdueLevels,
    },
    {
      title: 'A zone of its own, and a guarantee that is physical, not configured',
      body: (
        <>
          The industrial DMZ sits between the plant-operations layer and the business layer —
          its own zone, not part of either network, where every exchange is brokered rather
          than direct. A data diode, where one is used, uses separate physical paths for each
          direction — reverse traffic isn't a misconfiguration away, it's a wire that doesn't
          exist.
        </>
      ),
      duration: 5.2,
      Visual: S.DmzAndDiode,
      takeaway: "A firewall's one-way rule is policy, which can be misconfigured. A diode's one-way rule is physics, which can't.",
    },
    {
      title: 'Three ways to read from the plant floor, each for something different',
      body: (
        <>
          OPC UA reads directly from a PLC or SCADA system, with its own built-in security
          model. MQTT with Sparkplug B publishes telemetry, and its birth and death messages
          solve a problem OPC UA doesn't: a subscriber that just joined instantly knows what
          exists and whether it's still connected. A historian API reads stored process
          history back out after the fact.
        </>
      ),
      duration: 5.4,
      Visual: S.ThreeMechanisms,
    },
    {
      title: 'Stall the consumer, then watch what the OT source actually feels',
      body: (
        <>
          Freeze the downstream consumer with nothing between it and the OT source, and the
          very next publish blocks — the stall reaches backward into the control system. Put a
          buffer in between, freeze the same consumer, and the OT source keeps publishing
          without ever noticing. The buffer absorbs every one of the stalled messages.
        </>
      ),
      duration: 5.4,
      Visual: S.BufferIsolationProof,
      takeaway: "No buffer: a stall blocks the call into the OT source. Behind a buffer, the same stall never reaches it.",
    },
    {
      title: 'One namespace every system publishes to, instead of wiring each pair by hand',
      body: (
        <>
          A unified namespace replaces a tangle of point-to-point integrations with one
          structured place every plant system publishes to and every consumer reads from.
          Nobody has to know who else is listening. ISA-95 doesn't impose this architecture —
          it's a modeling standard, not a networking one — but the two fit together cleanly.
        </>
      ),
      duration: 5.0,
      Visual: S.UnifiedNamespace,
      takeaway: "A unified namespace and ISA-95 solve different problems: how systems talk, and what the data means.",
    },
    {
      title: 'In one breath',
      body: (
        <>
          Five Purdue levels give everything else its vocabulary. An iDMZ is its own zone, and
          a diode's one-way guarantee is physical. OPC UA, Sparkplug B and historian APIs each
          read the plant floor differently. A buffer is what actually stops a slow consumer
          from reaching back into a production line. And a unified namespace replaces
          point-to-point wiring with one shared place to publish and subscribe.
        </>
      ),
      duration: 5.2,
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A plant's MES polls a PLC's live tag values directly, with no buffer, no historian
          and no broker in between. During a long MES maintenance window, the PLC's own
          control-loop timing starts drifting. Which of this topic's lessons does that match?
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "MES and the PLC are on the wrong Purdue levels for this to be allowed at all" },
          { label: 'A missing edge buffer let a stalled downstream consumer reach back into the control system', correct: true },
          { label: 'The connection should have used a data diode instead of a direct read' },
          { label: 'OPC UA would have prevented this, since MQTT would not' },
        ],
        explain: (
          <>
            A missing buffer. MES reading a PLC directly is architecturally normal — the
            failure here is the same one the hook opened with: nothing sits between the slow
            or stalled consumer and the control system, so the consumer's own trouble reaches
            backward into it.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
