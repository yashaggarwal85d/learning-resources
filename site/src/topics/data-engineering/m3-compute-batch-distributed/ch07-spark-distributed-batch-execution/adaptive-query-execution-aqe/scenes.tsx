import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

function Row({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={17} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a big table joins a 30-row result of grouping another big table. What strategy, before anything runs?" h={200}>
      <Row y={70} label="join plan, before execution" value="which strategy?" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="the static planner's choice" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealInitialPlan({ t }: StepCtx) {
  return (
    <Svg label="measured: the Initial Plan is a sort-merge join. The grouped side's real size doesn't exist yet." h={200}>
      <Row y={70} label="static plan" value="sort-merge join" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="sort steps in that plan" value="2, confirmed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictDemotion({ t }: StepCtx) {
  return (
    <Svg label="the grouping's own shuffle finishes: only 30 rows came out. Does the join plan change?" h={200}>
      <Row y={70} label="grouped side turns out tiny" value="plan changes?" />
      <Row y={130} label="the Final Plan's join" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealBroadcastDemotion({ t }: StepCtx) {
  return (
    <Svg label="measured: the Final Plan is a broadcast hash join instead. Zero sort steps anywhere." h={200}>
      <Row y={70} label="Final Plan join" value="broadcast hash join" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="sort steps in that plan" value="zero, confirmed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateDemotion({ t }: StepCtx) {
  return (
    <Svg label="the conversion only became possible once the grouped side's real size existed to check against the threshold." h={200}>
      <Row y={70} label="what changed" value="a real size existed" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="what it cleared" value="the broadcast threshold" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictCoalescing({ t }: StepCtx) {
  return (
    <Svg label="a second query: 200 shuffle partitions configured, but the real data is tiny. Does AQE touch that count?" h={200}>
      <Row y={70} label="200 partitions configured" value="AQE changes it?" />
      <Row y={130} label="the Final Plan's read" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealCoalescing({ t }: StepCtx) {
  return (
    <Svg label="measured: the Final Plan merges the small partitions. The Initial Plan never does this at all." h={200}>
      <Row y={70} label="Initial Plan's read" value="no coalescing" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="Final Plan's read" value="coalesced" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateCoalescing({ t }: StepCtx) {
  return (
    <Svg label="the configured count was never sized to the data; AQE picked the real count only once the shuffle's own output existed." h={200}>
      <Row y={70} label="configured count" value="not sized to data" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="coalesced count" value="sized to real output" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="AQE reoptimizes at a shuffle boundary using real stats: it can demote a join and coalesce partitions, but nothing before the first shuffle." h={280}>
      <Row y={50} label="static plan" value="sort-merge, 2 sorts" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="once real stats exist" value="broadcast, 0 sorts" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="small partitions" value="coalesced automatically" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
