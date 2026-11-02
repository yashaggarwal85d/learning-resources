import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

/** A label-left / value-right row (DESIGN.md, phone text scaling). Keep each
 * side to 1-3 words: longer pairs overlap on phone widths. */
function Row({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={16} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="an ad partner paid per click; two correct pipelines disagree by a small gap" h={270}>
      <T x={300} y={50} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 0, 0.5))}>
        yesterday's click count
      </T>
      <T x={300} y={90} s={17} f={C.crema} a="middle" w={600} serif italic o={easeOut(seg(t, 0.15, 0.6))}>
        streaming says one number, batch says more
      </T>
      <Row y={150} label="streaming" value="fast, slightly low" o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={195} label="reconciled batch" value="slower, the invoice" valueColor={C.focus} o={easeOut(seg(t, 0.5, 0.8))} />
      <Row y={240} label="neither pipeline" value="has a bug" o={easeOut(seg(t, 0.65, 1))} />
    </Svg>
  );
}

export function Predict1({ t }: StepCtx) {
  return (
    <Svg label="late events, duplicates, or bot filtering — which explains the gap, and which side is right?" h={210}>
      <Row y={75} label="duplicates" value="would inflate stream" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="late events" value="missed by stream" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPipelineStrip({ t }: StepCtx) {
  return (
    <Svg label="sdk, collector, log, lake, warehouse, dashboards — a decision card at each hop" h={240}>
      <Row y={55} label="sdk" value="batched, retried" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="collector" value="stateless, scaled" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="log" value="durable, partitioned" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={205} label="lake, warehouse" value="landing, then served" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function RevealSessionGap({ t }: StepCtx) {
  return (
    <Svg label="a session closes on a gap of inactivity, not a fixed clock; a bot run flags red" h={210}>
      <Row y={75} label="session" value="an inactivity gap" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="bot run" value="flagged either way" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealLateEventSliver({ t }: StepCtx) {
  return (
    <Svg label="a dashed correctness boundary after the log; a late dot lands after the window fires" h={210}>
      <Row y={75} label="the window" value="fires, then closes" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="a late dot" value="log, not stream" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealStreamVsBatch({ t }: StepCtx) {
  return (
    <Svg label="idempotent upserts on one side, a scheduled batch recount on the other, overriding the billed figure" h={210}>
      <Row y={75} label="stream" value="fast, for speed" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="batch" value="the billed number" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDualLogicDrift({ t }: StepCtx) {
  return (
    <Svg label="the same logic written twice; a drift gap opens the moment only one copy is updated" h={210}>
      <Row y={75} label="two copies" value="one logic, twice" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="one update" value="drift, not bug" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealEstimateFailure({ t }: StepCtx) {
  return (
    <Svg label="the estimate sheet, the dominant cost lever, and the failure table, side by side" h={240}>
      <Row y={55} label="estimate" value="rate, storage, consumers" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="cost lever" value="lake scan, likely" valueColor={C.focus} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="failures" value="collector, poison, region" o={easeOut(seg(t, 0.35, 0.65))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="the strip, the session gap, the late sliver, the stream-batch override, drift, estimate and failures" h={290}>
      <Row y={45} label="pipeline" value="six hops" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="sessions, bots" value="gap, classifier" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="stream, batch" value="speed, then record" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={210} label="drift, cost" value="budgeted, not fixed" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a second billing dispute, a different partner, the same three candidate causes" h={250}>
      <Row y={65} label="same symptom" value="a count disagrees" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={140} label="this time" value="a duplicate burst" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
      <Row y={215} label="the check" value="diagnose, don't assume" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
