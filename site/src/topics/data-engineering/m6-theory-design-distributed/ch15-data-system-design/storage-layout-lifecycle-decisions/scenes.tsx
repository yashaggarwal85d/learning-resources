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
    <Svg label="the shop partitions events by customer id for fast lookups — a year later the nightly revenue job crawls, and a deletion request rewrites everything" h={270}>
      <T x={300} y={50} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 0, 0.5))}>
        one layout, two symptoms
      </T>
      <T x={300} y={90} s={17} f={C.crema} a="middle" w={600} serif italic o={easeOut(seg(t, 0.15, 0.6))}>
        "partitioned by customer id, for fast lookups"
      </T>
      <Row y={150} label="nightly revenue job" value="crawling" o={easeOut(seg(t, 0.35, 0.7))} />
      <Row y={195} label="a deletion request" value="an expensive rewrite" valueColor={C.focus} o={easeOut(seg(t, 0.5, 0.85))} />
      <Row y={240} label="one layout" value="caused both" o={easeOut(seg(t, 0.65, 1))} />
    </Svg>
  );
}

export function Predict1({ t }: StepCtx) {
  return (
    <Svg label="which single design-time decision would have prevented both symptoms?" h={210}>
      <Row y={75} label="bigger cluster" value="doesn't fix it" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="the partition key" value="from the real path" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSystemOfRecord({ t }: StepCtx) {
  return (
    <Svg label="every dataset is either the one authoritative copy, or derived from it and rebuildable" h={210}>
      <Row y={75} label="orders table" value="source of truth" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="daily revenue rollup" value="derived, rebuildable" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealAccessPath({ t }: StepCtx) {
  return (
    <Svg label="the dominant access path picks the partition key — the nightly job scans by date, so partition by date" h={210}>
      <Row y={75} label="partition by customer" value="not the real path" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="partition by date" value="matches the real path" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealTableFormat({ t }: StepCtx) {
  return (
    <Svg label="a table format is picked from the access pattern, with interoperability and catalog consequences as the deciding cost — not reinvented per dataset" h={210}>
      <Row y={75} label="which format" value="one decisive cost each" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="file layout" value="follows the chosen format" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealBandAcrossLayouts({ t }: StepCtx) {
  return (
    <Svg label="the same day's query drawn as a band across two layouts — one touches nearly every file, the other prunes almost all of them" h={230}>
      <Row y={80} label="by customer id" value="touches every file" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={165} label="by date" value="almost all pruned" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealTiers({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['hot', 'fast, short retention'],
    ['warm', 'cheaper, longer'],
    ['cold', 'archival, longest'],
  ];
  return (
    <Svg label="three shelves, hot, warm and cold, each with its own retention clock" h={280}>
      {rows.map(([label, value], i) => (
        <Row key={label} y={55 + i * 75} label={label} value={value} valueColor={i === 0 ? C.focus : C.crema} o={easeOut(seg(t, i * 0.3, i * 0.3 + 0.45))} />
      ))}
    </Svg>
  );
}

export function RevealStorageLimitation({ t }: StepCtx) {
  return (
    <Svg label="the law names the clock on every shelf — kept no longer than the purpose requires, not an engineering nicety" h={210}>
      <Row y={75} label="storage limitation" value="a legal requirement" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="the retention clock" value="from the law" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Predict2({ t }: StepCtx) {
  return (
    <Svg label="a customer asks to be deleted — on the date-partitioned layout, do their rows sit in one place?" h={210}>
      <Row y={75} label="still together" value="tempting, but wrong" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="scattered by date" value="every day touched" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="source of truth, the access-path layout and its pruned files, three tiers with their clocks, and erasure running through all of it" h={290}>
      <Row y={45} label="system of record" value="one source of truth" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="layout" value="from the access path" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="tiers" value="each with a clock" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={210} label="erasure" value="designed in, or rewritten" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a session-logs table's dominant access path is a point lookup by session id, not a date range — what changes?" h={250}>
      <Row y={65} label="point lookup" value="a different path" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={140} label="partition key" value="session id" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
      <Row y={215} label="erasure risk" value="still there, if scattered" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
