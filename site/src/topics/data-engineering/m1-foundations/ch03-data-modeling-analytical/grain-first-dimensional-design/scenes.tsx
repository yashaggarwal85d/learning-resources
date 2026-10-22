import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling). */
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
    <Svg label="one row per order vs. one row per line" h={200}>
      <Row y={70} label="order grain" value="can't answer a line question" />
      <Row y={130} label="line grain" value="answers it directly" />
    </Svg>
  );
}

export function RevealFourSteps({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['first', 'the business process'],
    ['second', 'the grain'],
    ['third', 'the dimensions'],
    ['fourth', 'the facts'],
  ];
  return (
    <Svg label="process, grain, dimensions, facts — in order" h={280}>
      {rows.map(([label, value], i) => (
        <Row key={label} y={50 + i * 55} label={label} value={value} o={easeOut(seg(t, i * 0.2, i * 0.2 + 0.6))} />
      ))}
    </Svg>
  );
}

export function RevealGrainIsBinding({ t }: StepCtx) {
  return (
    <Svg label="declared once, binding on everything after" h={200}>
      <Row y={70} label="grain" value="what one row represents" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="once declared" value="binding on the rest" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictGrainChoice({ t }: StepCtx) {
  return (
    <Svg label="order-line process — grain at order, or at line?" h={200}>
      <Row y={70} label="order-line process" value="one row per order?" />
      <Row y={130} label="or" value="one row per line?" />
    </Svg>
  );
}

export function RevealAtomicGrain({ t }: StepCtx) {
  return (
    <Svg label="line totals, summed, reproduce the order total exactly" h={200}>
      <Row y={70} label="lines, by region" value="sums to the order total" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="lines, rolled up" value="sums to the order total" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealCoarseGrainLoses({ t }: StepCtx) {
  return (
    <Svg label="no line columns exist, at all" h={200}>
      <Row y={70} label="order-level table" value="no product column" valueColor={C.cherryText} o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="a line question" value="structurally unanswerable" valueColor={C.cherryText} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealAdditiveMeasure({ t }: StepCtx) {
  return (
    <Svg label="correct, summed by any dimension, measured" h={200}>
      <Row y={70} label="line total" value="additive, measured" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="summed any way" value="always correct" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictBalanceAcrossTime({ t }: StepCtx) {
  return (
    <Svg label="a balance sums across accounts — across time too?" h={200}>
      <Row y={70} label="balance, across accounts" value="sums correctly" />
      <Row y={130} label="balance, across time" value="?" />
    </Svg>
  );
}

export function RevealSemiAdditive({ t }: StepCtx) {
  return (
    <Svg label="summed across time: meaningless. the last one: correct." h={200}>
      <Row y={70} label="four balances, summed" value="a meaningless number" valueColor={C.cherryText} o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="the correct year-end" value="the last quarter alone" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealNonAdditive({ t }: StepCtx) {
  return (
    <Svg label="naively averaged vs. recomputed from sums" h={200}>
      <Row y={70} label="margin, averaged naively" value="one number" valueColor={C.cherryText} o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="margin, recomputed" value="a different number" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealNonAdditiveFix({ t }: StepCtx) {
  return (
    <Svg label="sum the components first, the ratio last" h={200}>
      <Row y={70} label="revenue, cost" value="sum these first" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="the ratio itself" value="computed last" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="grain first, binding; three measure classes, measured" h={240}>
      <Row y={55} label="four steps" value="grain declared first" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={115} label="additive / semi" value="anywhere, or not over time" o={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={175} label="non-additive" value="only its components sum" o={easeOut(seg(t, 0.4, 0.9))} />
    </Svg>
  );
}

export function ProveShippingRatio({ t }: StepCtx) {
  return (
    <Svg label="a per-unit ratio — sum directly, or fix first?" h={200}>
      <Row y={70} label="shipping cost per unit" value="sum it directly?" />
      <Row y={130} label="or fix it first" value="?" />
    </Svg>
  );
}
