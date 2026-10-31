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
    <Svg label="the same query, measured for real: scanning raw rows from scratch versus a table that already holds the answer" h={200}>
      <Row y={70} label="scan raw rows" value="measured slow" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="pre-built answer" value="measured fast" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictWhyFaster({ t }: StepCtx) {
  return (
    <Svg label="is the fast query fast because it's a different kind of database, or a smaller question?" h={200}>
      <Row y={70} label="different" value="kind of engine" />
      <Row y={130} label="smaller" value="question to answer" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealCostShift({ t }: StepCtx) {
  return (
    <Svg label="pre-aggregation is a cost shift, not a cost cut: the real work still happens, just once, at write time" h={200}>
      <Row y={70} label="read time" value="work repeated" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="write time" value="work done once" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealMaterializedSpeedup({ t }: StepCtx) {
  return (
    <Svg label="a real precomputed table, measured, answers the same question many times faster" h={200}>
      <Row y={70} label="raw table" value="measured slower" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="materialized table" value="measured much faster" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealFreshnessGap({ t }: StepCtx) {
  return (
    <Svg label="a real write, measured invisible in the materialized table until it's refreshed" h={200}>
      <Row y={70} label="raw table" value="sees it now" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="materialized table" value="stale till refresh" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCubes({ t }: StepCtx) {
  return (
    <Svg label="a cube precomputes every combination of a fixed set of dimensions, not just one question" h={200}>
      <Row y={70} label="one table" value="answers one question" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a cube" value="answers many questions" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRealTimeOlap({ t }: StepCtx) {
  return (
    <Svg label="a real-time OLAP store pre-aggregates at ingestion itself, losing per-event queries to stay fresh" h={200}>
      <Row y={70} label="ingestion time" value="rolled up now" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="one event" value="no longer queryable" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="pre-aggregation shifts cost to write time, a materialized table is measurably faster but can go stale, cubes generalize it, real-time OLAP does it at ingestion" h={260}>
      <Row y={50} label="pre-aggregation" value="shifts the cost" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="a materialized table" value="measured much faster" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="that speed" value="can mean stale" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="real-time OLAP" value="pre-aggregates on write" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a number that must be correct to the second and cheap at huge query volume — which option?" h={200}>
      <Row y={70} label="a periodic view" value="not fresh enough" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="real-time OLAP" value="pre-aggregates on write" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
