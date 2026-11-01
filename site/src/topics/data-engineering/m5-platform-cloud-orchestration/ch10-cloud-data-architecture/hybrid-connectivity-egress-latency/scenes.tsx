import type { StepCtx } from '../../../../../reels/types';
import { clamp, seg } from '../../../../../reels/anim';
import { C, Stack, Svg, T } from '../../../../../reels/kit';

// Every claim traces to AWS Direct Connect's own documentation/pricing pages, Apache Kafka's
// own MirrorMaker 2 documentation, and Wikipedia's bandwidth-delay-product article as the
// standard networking reference CHAPTER.md allows (SOURCES.md). The latency-shaped-link and
// WAN-failure-drill scenes picture the examples.py simulations disclosed in OUTLINE.md and
// FACT-CHECK.md. The map-with-a-line figure is this chapter's own connectivity figure,
// introduced here per CHAPTER.md's "One visual language for the chapter's reels."

// 1 · Hook: the link is cut for four hours, then reconnects.
export function LinkCutHook({ t }: StepCtx) {
  const restored = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A WAN link between a plant and its cloud region, cut, then restored" h={280}>
        <T x={300} y={24} s={14} a="middle" f={C.taupe} serif>Plant — cloud region, a line between two dots</T>
        <circle cx={140} cy={80} r={14} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={140} y={110} s={11} a="middle" f={C.latte}>plant</T>
        <circle cx={460} cy={80} r={14} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={460} y={110} s={11} a="middle" f={C.latte}>cloud region</T>
        <line x1={154} y1={80} x2={446} y2={80}
          stroke={restored > 0.5 ? C.mocha : C.bad}
          strokeWidth={3}
          strokeDasharray={restored > 0.5 ? undefined : '2 8'} />
        <rect x={100} y={150} width={400} height={44} rx={8} fill="none" stroke={restored > 0.5 ? C.second : C.bad} strokeWidth={2} />
        <T x={300} y={176} s={12} a="middle" f={restored > 0.5 ? C.second : C.bad} w={400}>
          {restored > 0.5 ? 'reconnected — the question: can anyone prove nothing was lost?' : 'cut for four hours, planned maintenance, nobody told the data team'}
        </T>
      </Svg>
    </Stack>
  );
}

// 2 · Predict: what happens to records during the outage.
export function PredictWhatHappensDuringOutage({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="While the link is down, what happens to the records the producer keeps writing?" h={260}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>The producer keeps running the whole time</T>
        <rect x={100} y={60} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={88} s={13} a="middle" f={C.latte}>records keep arriving at the producer, link or no link</T>
        <rect x={100} y={128} width={400} height={48} rx={8} fill="none" stroke={revealed ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={156} s={12} a="middle" f={revealed ? C.second : C.latte} w={revealed ? 700 : 400}>
          {revealed ? 'buffered locally, in order, until the link returns' : 'what does a good mechanism do with them?'}
        </T>
      </Svg>
    </Stack>
  );
}

// 3 · Interconnect vs VPN.
export function InterconnectVsVpn({ t }: StepCtx) {
  const vpn = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A dedicated circuit, reserved for one customer, vs a VPN sharing the public internet" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Two ways to connect a plant to a cloud region</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={12} a="middle" f={C.latte} w={400}>dedicated interconnect: a reserved circuit, steady latency</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={vpn > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={12} a="middle" f={vpn > 0.5 ? C.second : C.latte} w={400}>
          {vpn > 0.5 ? 'VPN: the public internet, cheaper, latency shared with everyone else' : 'VPN: pending'}
        </T>
      </Svg>
    </Stack>
  );
}

// 4 · Bandwidth-delay product, one stream vs several.
export function BandwidthDelayProduct({ t }: StepCtx) {
  const parallel = clamp(seg(t, 0.4, 0.85));
  return (
    <Stack>
      <Svg label="A link's capacity times its round-trip delay is how much data can be in flight at once" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Capacity x round-trip delay = data in flight</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={12} a="middle" f={C.latte} w={400}>one stream: leaves most of the link's capacity unused</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={parallel > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={12} a="middle" f={parallel > 0.5 ? C.second : C.latte} w={400}>
          {parallel > 0.5 ? 'several streams at once: fill the gap one stream leaves behind' : 'several streams: pending'}
        </T>
      </Svg>
    </Stack>
  );
}

// 5 · The WAN-failure drill: cut, buffer, restore, count.
export function WanFailureDrill({ t }: StepCtx) {
  const stages = ['sending: every record delivered immediately', 'link cut: records held locally, in order', 'link restored: the backlog drains first', 'counted: same records in, same records out, same order'];
  return (
    <Stack>
      <Svg label="A local queue stands in for the WAN link: cut, buffered, restored, counted" h={280} fill>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Cut the link, buffer, restore, then count</T>
        {stages.map((label, i) => {
          const show = clamp(seg(t, 0.1 * i, 0.1 * i + 0.3));
          const bad = i === 1;
          return (
            <T key={label} x={300} y={70 + i * 46} s={12} a="middle" f={bad ? C.bad : C.latte} o={show} w={460} serif>{label}</T>
          );
        })}
      </Svg>
    </Stack>
  );
}

// 6 · Latency budget allocation.
export function LatencyBudget({ t }: StepCtx) {
  const remaining = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="An end-to-end deadline, minus the WAN hop, minus fixed overhead, leaves the processing budget" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>The deadline, minus what's already spent</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={12} a="middle" f={C.latte} w={400}>end-to-end budget, minus the WAN hop, minus fixed overhead</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={remaining > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={12} a="middle" f={remaining > 0.5 ? C.second : C.latte} w={400}>
          {remaining > 0.5 ? "what's left over is the honest processing budget" : 'processing budget: pending'}
        </T>
      </Svg>
    </Stack>
  );
}

// 7 · The ADR: four decisions plus this topic's own wire.
export function AdrSynthesis({ t }: StepCtx) {
  const items = ['SAP extraction: a trigger- or log-based delta path', 'OT ingestion: an edge buffer at the plant DMZ', 'hybrid split: steady load on-prem, bursty load to the cloud', 'residency: a rule that keeps some data from crossing the border', "this topic: a sized wire, proven to survive going down"];
  return (
    <Stack>
      <Svg label="One design, pulling four earlier decisions plus this topic's own connection together" h={300} fill>
        <T x={300} y={24} s={14} a="middle" f={C.taupe} serif>One design, five decisions</T>
        {items.map((label, i) => {
          const show = clamp(seg(t, 0.08 * i, 0.08 * i + 0.3));
          return (
            <T key={label} x={300} y={64 + i * 44} s={12} a="middle" f={i === 4 ? C.second : C.latte} o={show} w={470} serif>{label}</T>
          );
        })}
      </Svg>
    </Stack>
  );
}

// 8 · Recap.
export function Recap({ t }: StepCtx) {
  const items = ['dedicated interconnect vs VPN: steadier latency, its own price', "bandwidth-delay product decides whether one stream suffices", 'a latency budget is the deadline minus the WAN hop and overhead', 'buffered, in-order catch-up — proven by counting, not assumed'];
  return (
    <Stack>
      <Svg label="The four-part recap of this topic's point" h={280} fill>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Four points, kept separate</T>
        {items.map((label, i) => {
          const show = clamp(seg(t, 0.1 * i, 0.1 * i + 0.25));
          return (
            <T key={label} x={300} y={70 + i * 46} s={12} a="middle" f={C.latte} o={show} w={460} serif>{label}</T>
          );
        })}
      </Svg>
    </Stack>
  );
}

// 9 · Prove it.
export function ProveIt({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="A matching row count after a second outage — does that alone prove order survived too?" h={280}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Two producers this time, same link, same outage</T>
        <rect x={100} y={56} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={84} s={12} a="middle" f={C.latte}>the row count matches, before and after</T>
        <rect x={100} y={120} width={400} height={48} rx={8} fill="none" stroke={revealed ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={148} s={12} a="middle" f={revealed ? C.second : C.latte} w={revealed ? 700 : 400}>
          {revealed ? 'no — a matching count says nothing about order on its own' : 'does that alone prove order survived?'}
        </T>
      </Svg>
    </Stack>
  );
}
