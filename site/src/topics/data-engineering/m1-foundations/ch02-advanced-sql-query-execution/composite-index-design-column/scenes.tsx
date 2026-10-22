import { Bar, C, Svg, T } from '../../../../../reels/kit';
import type { StepCtx } from '../../../../../reels/types';

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling). */
function Row({ y, label, value, valueColor = C.crema, big = false }: { y: number; label: string; value: string; valueColor?: string; big?: boolean }) {
  return (
    <g>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={big ? 22 : 17} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

/** A label above a bar, with its display value below — safe for long labels. */
function timeBar(x: number, y: number, frac: number, display: string, label: string, fill: string) {
  return (
    <g key={label}>
      <T x={x} y={y - 20} s={13} f={C.latte}>
        {label}
      </T>
      <Bar x={x} y={y} w={340 * frac} h={20} full={340} fill={fill} />
      <T x={x} y={y + 38} s={13} f={C.crema}>
        {display}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="same two columns, same query, a 364x gap" h={370}>
      {timeBar(30, 90, 6 / 2184, '6 buffers', 'index (a, b)', C.focus)}
      {timeBar(30, 210, 2184 / 2184, '2,184 buffers', 'index (b, a)', C.cherryText)}
    </Svg>
  );
}

export function PredictWhyDiffer({ t }: StepCtx) {
  return (
    <Svg label="same columns indexed — different order" h={200}>
      <Row y={70} label="index (a, b)" value="6 buffers" valueColor={C.focus} />
      <Row y={130} label="index (b, a)" value="?" />
    </Svg>
  );
}

export function RevealEqualityLeads({ t }: StepCtx) {
  return (
    <Svg label="equality leading narrows the scan; range leading doesn't" h={200}>
      <Row y={70} label="equality column leads" value="6 buffers" valueColor={C.focus} />
      <Row y={130} label="range column leads" value="2,184 buffers" valueColor={C.cherryText} />
    </Svg>
  );
}

export function RevealSelectivity({ t }: StepCtx) {
  return (
    <Svg label="fewer distinct values, tighter narrowing" h={200}>
      <Row y={70} label="column a" value="1,000 distinct" valueColor={C.focus} />
      <Row y={130} label="column b" value="100,000 distinct" />
    </Svg>
  );
}

export function PredictOrderBy({ t }: StepCtx) {
  return (
    <Svg label="one index, two possible ORDER BY requests" h={200}>
      <Row y={70} label="ORDER BY a, b" value="matches the index" />
      <Row y={130} label="ORDER BY b, a" value="?" />
    </Svg>
  );
}

export function RevealSortMatch({ t }: StepCtx) {
  return (
    <Svg label="matched order: no sort. mismatched: a full sort." h={370}>
      {timeBar(30, 90, 0.095 / 177.6, '0.095 ms', 'ORDER BY a, b', C.focus)}
      {timeBar(30, 210, 177.6 / 177.6, '177.6 ms', 'ORDER BY b, a', C.cherryText)}
    </Svg>
  );
}

export function RevealLimitAmplifies({ t }: StepCtx) {
  return (
    <Svg label="LIMIT 10: read 10 rows, or sort 2,000,000 first" h={200}>
      <Row y={70} label="matched order" value="reads 10 rows" valueColor={C.focus} />
      <Row y={130} label="mismatched order" value="sorts everything first" valueColor={C.cherryText} />
    </Svg>
  );
}

export function PredictLeadingMissing({ t }: StepCtx) {
  return (
    <Svg label="index on (x, y), nothing on x" h={200}>
      <Row y={70} label="predicate on x" value="none" />
      <Row y={130} label="can the index help?" value="?" />
    </Svg>
  );
}

export function RevealPg16FullScan({ t }: StepCtx) {
  return (
    <Svg label="PostgreSQL 16: the whole index, regardless" h={200}>
      <Row y={70} label="buffers read" value="5,468" valueColor={C.cherryText} />
      <Row y={130} label="execution time" value="40.896 ms" valueColor={C.cherryText} />
    </Svg>
  );
}

export function RevealSkipScan({ t }: StepCtx) {
  return (
    <Svg label="same query, same index — PostgreSQL 18" h={200}>
      <Row y={70} label="buffers read" value="40" valueColor={C.focus} />
      <Row y={130} label="Index Searches" value="12" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealSkipScanLimit({ t }: StepCtx) {
  return (
    <Svg label="few leading values made the re-searches pay off" h={200}>
      <Row y={70} label="distinct leading values" value="10" />
      <Row y={130} label="re-searches, roughly one each" value="12" valueColor={C.focus} />
    </Svg>
  );
}

export function ProveIndexFree({ t }: StepCtx) {
  return (
    <Svg label="every index sped up some query — is one ever free?" h={200}>
      <Row y={70} label="every index so far" value="made a query faster" />
      <Row y={130} label="is adding one free?" value="?" />
    </Svg>
  );
}

export function RevealWriteCost({ t }: StepCtx) {
  return (
    <Svg label="0 indexes vs. 3 — same 500,000-row load" h={370}>
      {timeBar(30, 90, 1084 / 5190, '1,084 ms', '0 indexes', C.focus)}
      {timeBar(30, 210, 5190 / 5190, '5,190 ms, +13 MB', '3 indexes', C.cherryText)}
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  const lines = [
    'lead with the most selective, equality-matched column',
    'match the index to ORDER BY, or pay for a sort',
    'skip scan helps, but only with few leading values',
    'every index costs writes and disk — use sparingly',
  ];
  return (
    <Svg label="recap: column order, selectivity, and what it costs" h={240}>
      {lines.map((l, i) => t > i * 0.6 && (
        <T key={l} x={300} y={55 + i * 42} s={14} f={i === lines.length - 1 ? C.focus : C.crema} a="middle">
          {l}
        </T>
      ))}
    </Svg>
  );
}

export function ProveOrderMatch({ t }: StepCtx) {
  return (
    <Svg label="index (region, order_date): equality then range" h={200}>
      <Row y={70} label="region" value="equality" />
      <Row y={130} label="order_date" value="range" />
    </Svg>
  );
}
