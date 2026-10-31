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
    <Svg label="a strong offline score, a flat online lift" h={270}>
      <T x={300} y={50} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 0, 0.5))}>
        the model scored well offline
      </T>
      <T x={300} y={90} s={17} f={C.crema} a="middle" w={600} serif italic o={easeOut(seg(t, 0.15, 0.6))}>
        and changed nothing in production
      </T>
      <Row y={150} label="offline score" value="looked strong" o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={195} label="online lift" value="flat, nothing" valueColor={C.focus} o={easeOut(seg(t, 0.5, 0.8))} />
      <Row y={240} label="one feature" value="joined on now" o={easeOut(seg(t, 0.65, 1))} />
    </Svg>
  );
}

export function Predict1({ t }: StepCtx) {
  return (
    <Svg label="what single join rule prevents this?" h={210}>
      <Row y={75} label="more data" value="repeats the leak" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="join as-of" value="closes it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealOneDefinition({ t }: StepCtx) {
  return (
    <Svg label="one feature definition, two computations" h={210}>
      <Row y={75} label="offline store" value="batch history" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="online store" value="fast, current" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealFreshnessChoice({ t }: StepCtx) {
  return (
    <Svg label="batch or streaming, chosen per feature" h={210}>
      <Row y={75} label="daily feature" value="batch is fine" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="per-event feature" value="needs streaming" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPointInTimeJoin({ t }: StepCtx) {
  return (
    <Svg label="join as of the event, never later" h={240}>
      <Row y={55} label="latest value" value="reaches ahead" valueColor={C.focus} o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="as-of value" value="known back then" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="the rule" value="never read ahead" o={easeOut(seg(t, 0.35, 0.65))} />
    </Svg>
  );
}

export function RevealLeakageMeasured({ t }: StepCtx) {
  return (
    <Svg label="the same feature, two joins, one score inflated" h={210}>
      <Row y={75} label="leaky join" value="score too high" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="as-of join" value="the honest score" o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealParitySLO({ t }: StepCtx) {
  return (
    <Svg label="online and offline, sampled and watched" h={210}>
      <Row y={75} label="parity check" value="a running SLO" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="skew" value="arrives silently" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealBackfill({ t }: StepCtx) {
  return (
    <Svg label="a new feature, reconstructed backward through history" h={210}>
      <Row y={75} label="turn it on" value="only from today" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="backfill it" value="rebuilt from history" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one definition, a join rule, a measured leak, a watched parity" h={290}>
      <Row y={45} label="definition" value="feeds both stores" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="the join" value="as of event" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="leakage" value="measured, not vague" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={210} label="parity" value="a running check" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="ten times the features; what actually moves?" h={250}>
      <Row y={65} label="the join itself" value="still correct" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={140} label="parity checks" value="the real bottleneck" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
      <Row y={215} label="alert volume" value="climbs with it" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
