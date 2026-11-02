import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="two dashboards, the same mart, two different totals for active users this month." h={220}>
      <T x={25} y={40} s={13} f={C.latte}>
        dashboard one
      </T>
      <T x={25} y={65} s={16} f={C.focus}>
        "active users this month: lower"
      </T>
      <T x={25} y={120} s={13} f={C.latte}>
        dashboard two
      </T>
      <T x={25} y={145} s={16} f={C.cherryText}>
        "active users this month: higher"
      </T>
      <T x={300} y={200} s={12} f={C.taupe} a="middle">
        both engineers insist their own query is correct
      </T>
    </Svg>
  );
}

export function PredictWhatWasMissing({ t }: StepCtx) {
  return (
    <Svg label="what was never written down, and whose job should it have been?" h={200}>
      <T x={25} y={60} s={13} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        what was never documented
      </T>
      <T x={25} y={90} s={16} f={C.focus} o={easeOut(seg(t, 0, 0.3))}>
        ?
      </T>
      <T x={25} y={140} s={13} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        whose job was it to write it down
      </T>
      <T x={25} y={170} s={16} f={C.cherryText} o={easeOut(seg(t, 0.2, 0.5))}>
        ?
      </T>
    </Svg>
  );
}

export function RevealWhatGetsHandedOff({ t }: StepCtx) {
  return (
    <Svg label="a conformed mart behind a semantic layer that compiles one metric to SQL for every tool." h={220}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={25} y={40} s={14} f={C.latte}>handed off</T>
        <T x={25} y={66} s={15} f={C.focus}>a conformed mart, a compiled metric layer</T>
      </g>
      <g opacity={easeOut(seg(t, 0.2, 0.5))}>
        <T x={25} y={110} s={14} f={C.latte}>not handed off</T>
        <T x={25} y={136} s={15} f={C.taupe}>the BI tool itself, dashboard design,</T>
        <T x={25} y={162} s={15} f={C.taupe}>ad hoc analysis</T>
      </g>
    </Svg>
  );
}

export function RevealGrainAndFreshness({ t }: StepCtx) {
  return (
    <Svg label="the mart's grain and freshness SLA are facts a consumer must be told, in writing." h={230}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={25} y={40} s={14} f={C.latte}>grain</T>
        <T x={25} y={66} s={15} f={C.crema}>what one row of the mart actually equals</T>
      </g>
      <g opacity={easeOut(seg(t, 0.2, 0.5))}>
        <T x={25} y={110} s={14} f={C.latte}>freshness SLA</T>
        <T x={25} y={136} s={15} f={C.crema}>how stale the mart is allowed to get</T>
      </g>
      <T x={300} y={195} s={12} f={C.taupe} a="middle" o={easeOut(seg(t, 0.55, 0.85))}>
        unspoken becomes assumed, and assumed breaks silently
      </T>
    </Svg>
  );
}

export function RevealAnalyticsEngineerOwnership({ t }: StepCtx) {
  return (
    <Svg label="past this handoff, metric definitions are typically owned by analytics engineers." h={200}>
      <T x={25} y={40} s={13} f={C.latte}>
        moving and modeling data at scale
      </T>
      <T x={25} y={65} s={15} f={C.focus}>
        data engineering
      </T>
      <T x={25} y={120} s={13} f={C.latte}>
        defining a metric correctly for the business
      </T>
      <T x={25} y={145} s={15} f={C.cherryText}>
        analytics engineering
      </T>
    </Svg>
  );
}

export function RevealNegotiation({ t }: StepCtx) {
  return (
    <Svg label="who may change a shared metric, and how a conflicting request gets resolved — the ongoing mechanism." h={180}>
      <T x={300} y={70} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 0, 0.4))}>
        not a document written once
      </T>
      <T x={300} y={110} s={14} f={C.focus} a="middle" o={easeOut(seg(t, 0.3, 0.7))}>
        a process that keeps running
      </T>
    </Svg>
  );
}

export function RevealMinerva({ t }: StepCtx) {
  const stack = ['Airflow — orchestration', 'Hive and Spark — compute', 'Presto and Druid — serving'];
  return (
    <Svg label="Airbnb's own metric platform: every metric defined in exactly one place." h={220}>
      <T x={25} y={35} s={13} f={C.latte}>
        Minerva
      </T>
      {stack.map((s, i) => (
        <g key={s} opacity={easeOut(seg(t, 0.1 + i * 0.2, 0.35 + i * 0.2))}>
          <circle cx={40} cy={65 + i * 32} r={4} fill={C.focus} />
          <T x={55} y={70 + i * 32} s={13} f={C.crema}>
            {s}
          </T>
        </g>
      ))}
    </Svg>
  );
}

export function RevealWhatThisLeavesOut({ t }: StepCtx) {
  const items = [
    'how the semantic layer compiles — already taught',
    'which BI tool consumes the mart — next topic',
    'the engine serving many tools at once — later',
    'the full negotiation process — later still',
  ];
  return (
    <Svg label="each left-out piece named forward to where it is actually taught." h={220}>
      {items.map((it, i) => (
        <g key={it} opacity={easeOut(seg(t, 0.05 + i * 0.15, 0.3 + i * 0.15))}>
          <T x={25} y={45 + i * 38} s={13} f={C.crema}>
            {it}
          </T>
        </g>
      ))}
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a mart and a compiled metric, handed off. Grain and freshness, documented. Ownership, negotiated." h={300}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={25} y={36} s={14} f={C.latte}>what crosses the boundary</T>
        <T x={25} y={62} s={15} f={C.crema}>a conformed mart, a single compiled metric</T>
      </g>
      <g opacity={easeOut(seg(t, 0.15, 0.45))}>
        <T x={25} y={96} s={14} f={C.latte}>grain and freshness</T>
        <T x={25} y={122} s={15} f={C.crema}>written down, never assumed</T>
      </g>
      <g opacity={easeOut(seg(t, 0.3, 0.6))}>
        <T x={25} y={156} s={14} f={C.latte}>ownership</T>
        <T x={25} y={182} s={15} f={C.crema}>moves to analytics engineers past this point</T>
      </g>
      <g opacity={easeOut(seg(t, 0.45, 0.75))}>
        <T x={25} y={216} s={14} f={C.latte}>negotiation</T>
        <T x={25} y={242} s={15} f={C.crema}>the ongoing process that keeps a metric</T>
        <T x={25} y={268} s={15} f={C.crema}>computed once</T>
      </g>
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a third dashboard reports yet another number; the analyst wrote the SQL by hand." h={200}>
      <T x={25} y={50} s={13} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        the mart and the metric layer
      </T>
      <T x={25} y={75} s={15} f={C.focus} o={easeOut(seg(t, 0, 0.3))}>
        unchanged
      </T>
      <T x={25} y={130} s={13} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        what actually broke
      </T>
      <T x={25} y={155} s={15} f={C.cherryText} o={easeOut(seg(t, 0.2, 0.5))}>
        ?
      </T>
    </Svg>
  );
}
