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
    <Svg label="the dashboard query takes eight seconds — three fixes proposed: a real-time OLAP store, a nightly pre-aggregate, or a two-line clustering key" h={270}>
      <T x={300} y={50} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 0, 0.5))}>
        one slow query
      </T>
      <T x={300} y={90} s={17} f={C.crema} a="middle" w={600} serif italic o={easeOut(seg(t, 0.15, 0.6))}>
        the dashboard query, far too slow
      </T>
      <Row y={150} label="real-time OLAP" value="a new store" o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={195} label="nightly pre-aggregate" value="a new table" o={easeOut(seg(t, 0.5, 0.8))} />
      <Row y={240} label="clustering key" value="just two lines" valueColor={C.focus} o={easeOut(seg(t, 0.65, 1))} />
    </Svg>
  );
}

export function Predict1({ t }: StepCtx) {
  return (
    <Svg label="which fix is cheapest, which is fastest, and which breaks when the question changes tomorrow?" h={210}>
      <Row y={75} label="OLAP always wins" value="not the cheapest" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="clustering, cheapest" value="pre-agg breaks first" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealEngineDrivers({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['state size', 'fits in memory?'],
    ['latency floor', "from the shape"],
    ['team skill', 'who debugs it'],
  ];
  return (
    <Svg label="three real drivers for picking a processing engine" h={290}>
      {rows.map(([label, value], i) => (
        <Row key={label} y={55 + i * 75} label={label} value={value} valueColor={i === 2 ? C.focus : C.crema} o={easeOut(seg(t, i * 0.3, i * 0.3 + 0.45))} />
      ))}
    </Svg>
  );
}

export function RevealTeamSkillCost({ t }: StepCtx) {
  return (
    <Svg label="an engine nobody on call can debug is a cost bar, same units as latency and compute cost" h={210}>
      <Row y={75} label="latency, compute" value="counted costs" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="who can debug it" value="a cost too" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealQuestionShapeToStore({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['point lookup', 'key-value store'],
    ['OLAP slice', 'columnar store'],
    ['full-text', 'search index'],
    ['similarity', 'vector index'],
  ];
  return (
    <Svg label="four question shapes, four stores, each an arrow out of the one system of record" h={340}>
      {rows.map(([label, value], i) => (
        <Row key={label} y={40 + i * 65} label={label} value={value} o={easeOut(seg(t, i * 0.2, i * 0.2 + 0.35))} />
      ))}
    </Svg>
  );
}

export function RevealOneDatasetThreeStores({ t }: StepCtx) {
  return (
    <Svg label="the shop's order data, served three ways at once — each tagged derived, none of them the system of record itself" h={210}>
      <Row y={75} label="orders table" value="system of record" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="three stores" value="all derived from it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPreaggVsOnQuery({ t }: StepCtx) {
  return (
    <Svg label="the same query, answered two ways — instant but stale-bounded, or fresh but costly at every read" h={210}>
      <Row y={75} label="pre-aggregated" value="instant, fixed shape" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="on-query compute" value="fresh, costs per read" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealAmplificationLedger({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['logical bytes', 'the starting count'],
    ['replication', 'multiplies it'],
    ['rewrite, compaction', 'multiplies again'],
    ['physical bytes', 'the real cost'],
  ];
  return (
    <Svg label="the amplification ledger — logical bytes, replication, rewrite and compaction, summing to physical bytes" h={340}>
      {rows.map(([label, value], i) => (
        <Row key={label} y={40 + i * 70} label={label} value={value} valueColor={i === rows.length - 1 ? C.focus : C.crema} o={easeOut(seg(t, i * 0.2, i * 0.2 + 0.4))} />
      ))}
    </Svg>
  );
}

export function RevealSurprisingMultiplier({ t }: StepCtx) {
  return (
    <Svg label="the cheapest-looking option on paper has the largest physical-bytes bar once replication and rewrite are counted" h={210}>
      <Row y={75} label="pre-agg, looks tiny" value="rewrites the whole table" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="real cost" value="far above its own size" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="three engine drivers, the question-shape-to-store map, pre-agg versus on-query, and the ledger that prices all three honestly" h={290}>
      <Row y={45} label="engine choice" value="state, latency, skill" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="serving store" value="follows the question" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="pre-agg vs on-query" value="repetition, freshness" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={210} label="amplification" value="physical, not logical" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a new breakdown, asked tomorrow — which fix survives, and what does the ledger say about it?" h={250}>
      <Row y={65} label="new breakdown" value="asked tomorrow" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={140} label="clustering key" value="survives, same cost" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
      <Row y={215} label="pre-agg table" value="needs a full rebuild" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
