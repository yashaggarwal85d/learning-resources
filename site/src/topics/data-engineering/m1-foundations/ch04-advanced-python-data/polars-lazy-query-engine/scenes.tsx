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
    <Svg label="pandas adopted the buffers — does polars' own lazy label actually change what runs?" h={200}>
      <Row y={70} label="spelled lazily" value="claimed" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="runs differently?" value="not yet checked" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealEagerVsLazy({ t }: StepCtx) {
  return (
    <Svg label="the same filter and select, written eager and lazy — identical rows out, one of them deferred" h={220}>
      <Row y={55} label="eager call chain" value="runs each step now" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="lazy scan + collect" value="runs once, at the end" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="rows out, both ways" value="identical" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function RevealPushdown({ t }: StepCtx) {
  return (
    <Svg label="the plan as written vs. the plan polars actually runs — read directly from explain()" h={220}>
      <Row y={55} label="as written" value="scan all, filter after" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="as run" value="filter folded into the scan" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="columns read" value="narrowed to what's used" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function RevealCommonSubexpression({ t }: StepCtx) {
  return (
    <Svg label="the same expression, used by two output columns — computed once or twice?" h={200}>
      <Row y={70} label="written twice" value="once per output column" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="run" value="once, then reused" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictRowOrder({ t }: StepCtx) {
  return (
    <Svg label="no engine named, no ordering asked for — does the row order survive anyway?" h={200}>
      <Row y={70} label="collect(), no arguments" value="default engine runs" />
      <Row y={130} label="original row order" value="kept, or not?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealNoImplicitOrder({ t }: StepCtx) {
  return (
    <Svg label="the exact same join, run thirty times — how many different row orders come back?" h={220}>
      <Row y={55} label="default engine" value="several orders" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="order kept, on request" value="same order, every time" o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="the difference" value="one keyword" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function RevealStreamingMemory({ t }: StepCtx) {
  return (
    <Svg label="the same projection, read whole and read in batches — measured peak memory, not claimed" h={260}>
      <Row y={50} label="full eager read" value="higher peak memory" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="streaming scan" value="lower peak memory" valueColor={C.focus} o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="everything spills to disk?" value="not yet" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.65))} />
      <Row y={185} label="today's result" value="real, but not the full story" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function RevealGpuEngine({ t }: StepCtx) {
  return (
    <Svg label="the same query plan, dispatched to an nvidia gpu instead — sourced, not run here" h={220}>
      <Row y={55} label="this sandbox" value="no gpu, not run here" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="unsupported op" value="falls back to cpu" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="shared format" value="same buffers either side" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="deferred execution, a plan that proves its own optimizations, no promise on row order, real memory gains short of the full story" h={260}>
      <Row y={50} label="lazy vs. eager" value="same rows, deferred run" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="pushdown and reuse" value="visible in explain()" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="row order" value="not guaranteed by default" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="memory, gpu" value="measured; sourced" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a nightly job joins two lazyframes and writes a report read by row position — what breaks?" h={220}>
      <Row y={55} label="nightly join" value="no order kept" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="report reads by position" value="assumes stable order" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="the fix" value="one keyword" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
