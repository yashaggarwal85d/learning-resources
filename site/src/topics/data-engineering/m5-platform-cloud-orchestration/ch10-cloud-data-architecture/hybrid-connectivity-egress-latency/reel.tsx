import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// AWS Direct Connect's own documentation and pricing pages, Apache Kafka's own
// MirrorMaker 2 documentation, and Wikipedia's bandwidth-delay-product article as the
// standard networking reference CHAPTER.md allows (SOURCES.md). The bandwidth-delay-product
// and single-vs-parallel-stream demo use an artificially latency-shaped local link, not real
// tc/netem traffic shaping (disclosed in OUTLINE.md and FACT-CHECK.md). The WAN-failure drill
// uses a local queue standing in for the WAN link, exactly as CHAPTER.md's own Lab description
// specifies — this is the chapter's closing lab.
const reel: Reel = {
  steps: [
    {
      title: 'The link comes back up. Did anything get lost?',
      body: (
        <>
          A cross-WAN replication link between a plant and its cloud region goes down for four
          hours during planned maintenance nobody told the data team about. When it reconnects,
          the question that matters isn't whether anything was lost — it's whether anyone can
          prove, with numbers, that nothing was.
        </>
      ),
      duration: 5.4,
      Visual: S.LinkCutHook,
    },
    {
      title: 'Before the mechanism: what actually happens during those four hours?',
      body: (
        <>
          The replication producer on the plant side keeps running the whole time the link is
          down. Before the rest of this topic: what does a well-built replication mechanism do
          with the records it can't send yet?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'It buffers them locally and sends them, in order, once the link returns', correct: true },
          { label: 'It drops them, since the destination is unreachable' },
          { label: 'It blocks the source system until the link returns' },
          { label: 'It sends them out of order, fastest-first, once the link returns' },
        ],
        explain: (
          <>
            A well-built cross-WAN replication mechanism buffers locally and never blocks the
            source — the same "never block the source" lesson this chapter already taught for
            the plant floor, now applied to a WAN link instead of a database connection.
          </>
        ),
      },
      Visual: S.PredictWhatHappensDuringOutage,
    },
    {
      title: 'A dedicated circuit, or a path over the public internet',
      body: (
        <>
          A dedicated interconnect is a physical or virtual circuit reserved for one customer:
          steadier latency, a known bandwidth tier, billed for the circuit itself. A VPN instead
          routes over the public internet: cheaper to start, but its latency and throughput
          share whatever the internet happens to be doing that hour.
        </>
      ),
      duration: 5.2,
      Visual: S.InterconnectVsVpn,
    },
    {
      title: 'Why one stream can leave a fast link half-idle',
      body: (
        <>
          A link's bandwidth-delay product is its capacity times its round-trip delay — the
          most data that can be in flight, sent but not yet acknowledged, at any instant. A
          single stream that doesn't keep that much data moving at once leaves the rest of the
          link's capacity sitting unused. Several streams running at once can fill the gap one
          stream leaves behind.
        </>
      ),
      duration: 6.0,
      Visual: S.BandwidthDelayProduct,
      takeaway: 'A single stream can leave a high-bandwidth, high-latency link mostly idle — parallel streams fill it.',
    },
    {
      title: 'The drill: cut the link, prove the count',
      body: (
        <>
          A local queue stands in for the WAN link. While it's marked down, every outgoing
          record is held in order instead of being sent or dropped. Once it's marked back up,
          the whole backlog drains before anything new. Counting what went in against what came
          out, in the same order, is the actual proof — not a guess about what probably
          happened.
        </>
      ),
      duration: 5.8,
      Visual: S.WanFailureDrill,
      takeaway: 'Counting records in against records out, in order, is what actually proves no loss and no duplication.',
    },
    {
      title: 'Working backward from the deadline',
      body: (
        <>
          A near-real-time dashboard's end-to-end latency budget has to cover the WAN hop and
          everything else together. Subtract the WAN hop's own latency, and whatever fixed
          overhead the pipeline already carries, and what's left over is the honest budget
          processing is allowed to spend.
        </>
      ),
      duration: 4.8,
      Visual: S.LatencyBudget,
      takeaway: "Processing only gets whatever's left after the WAN hop and fixed overhead are subtracted from the deadline.",
    },
    {
      title: 'One design, four decisions already made',
      body: (
        <>
          The German manufacturer's design pulls four earlier decisions together: a trigger- or
          log-based SAP extraction path, an OT edge buffer at the plant's DMZ, a steady workload
          kept on-prem with a bursty one let out to the cloud, and the residency rule that keeps
          certain data from ever crossing a border. This topic adds the wire between them, sized
          by its own bandwidth-delay product, and the proof that it survives going down.
        </>
      ),
      duration: 6.2,
      Visual: S.AdrSynthesis,
    },
    {
      title: 'In one breath',
      body: (
        <>
          A dedicated interconnect buys steadier latency than a VPN, at its own price. A link's
          bandwidth-delay product decides whether one stream can use it, or whether the work
          needs to run in parallel. A latency budget is the deadline minus the WAN hop minus
          fixed overhead. And buffered, in-order catch-up — proven by counting, not assumed —
          is what a cross-WAN pipeline owes you when the link comes back.
        </>
      ),
      duration: 6.0,
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          The same plant's link now goes down for four hours a second time, but this time two
          producers are writing to the same queue concurrently instead of one. The row count
          still matches afterward. Does that alone prove the records are also still in the
          right order?
        </>
      ),
      duration: 3.0,
      predict: {
        options: [
          { label: "No — a matching count alone says nothing about order, only that nothing's missing", correct: true },
          { label: "Yes — if the count matches, the order must be preserved too" },
          { label: "No — a matching count proves duplication happened, not that it didn't" },
          { label: 'Yes, as long as both producers use the same clock' },
        ],
        explain: (
          <>
            Row count and ordering are two separate checks. The drill in this topic asserts
            both for exactly this reason — a matching count rules out loss and duplication, but
            only comparing the actual sequence of ids rules out a silently reordered backlog.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
