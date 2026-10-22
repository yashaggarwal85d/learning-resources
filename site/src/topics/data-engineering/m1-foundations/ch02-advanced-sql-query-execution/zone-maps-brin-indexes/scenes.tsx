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
    <Svg label="same filter, same table — summary index vs. no index" h={370}>
      {timeBar(30, 90, 15 / 10811, '15 buffers', 'summary index', C.focus)}
      {timeBar(30, 210, 10811 / 10811, '10,811 buffers', 'no index', C.cherryText)}
    </Svg>
  );
}

export function PredictNothingPerRow({ t }: StepCtx) {
  return (
    <Svg label="a B-tree: one entry per row — something smaller?" h={200}>
      <Row y={70} label="B-tree entries" value="one per row" />
      <Row y={130} label="an index with none of that" value="still useful — ?" />
    </Svg>
  );
}

export function RevealWhatBrinStores({ t }: StepCtx) {
  return (
    <Svg label="one summary per block range" h={200}>
      <Row y={70} label="stores per range" value="minimum, maximum" valueColor={C.focus} />
      <Row y={130} label="stores per row" value="nothing at all" />
    </Svg>
  );
}

export function RevealSizeContrast({ t }: StepCtx) {
  return (
    <Svg label="same column, same data, two index types" h={370}>
      {timeBar(30, 90, 24 / 14000, '24 KB', 'block-range summary', C.focus)}
      {timeBar(30, 210, 14000 / 14000, '14 MB', 'B-tree', C.cherryText)}
    </Svg>
  );
}

export function PredictAnyColumn({ t }: StepCtx) {
  return (
    <Svg label="a coarse summary — does it need anything true first?" h={200}>
      <Row y={70} label="summary covers" value="a whole block range" />
      <Row y={130} label="works for any column" value="?" />
    </Svg>
  );
}

export function RevealCorrelationRequirement({ t }: StepCtx) {
  return (
    <Svg label="the summary only helps if this holds" h={200}>
      <Row y={70} label="required" value="correlated with row position" valueColor={C.focus} />
      <Row y={130} label="not required" value="sorted, or unique, or small" />
    </Svg>
  );
}

export function RevealCorrelatedResult({ t }: StepCtx) {
  return (
    <Svg label="well-correlated column, same equality filter" h={370}>
      {timeBar(30, 90, 15 / 10811, '15 buffers', 'summary index', C.focus)}
      {timeBar(30, 210, 10811 / 10811, '10,811 buffers', 'no index', C.cherryText)}
    </Svg>
  );
}

export function PredictScatteredColumn({ t }: StepCtx) {
  return (
    <Svg label="values scattered randomly across the table" h={200}>
      <Row y={70} label="column values" value="scattered, not clustered" />
      <Row y={130} label="summary still helps" value="?" />
    </Svg>
  );
}

export function RevealUncorrelatedResult({ t }: StepCtx) {
  return (
    <Svg label="scattered column, same kind of filter" h={200}>
      <Row y={70} label="buffers touched" value="almost the whole table" valueColor={C.cherryText} />
      <Row y={130} label="vs. no index" value="about the same, a bit slower" />
    </Svg>
  );
}

export function PredictTrustRange({ t }: StepCtx) {
  return (
    <Svg label="the summary matches — are the rows trusted outright?" h={200}>
      <Row y={70} label="range summary matches" value="the filter" />
      <Row y={130} label="every row inside trusted" value="?" />
    </Svg>
  );
}

export function RevealLossyRecheck({ t }: StepCtx) {
  return (
    <Svg label="lossy, by design" h={200}>
      <Row y={70} label="a matching range returns" value="rows as candidates" />
      <Row y={130} label="the executor" value="rechecks each one" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealParquetStats({ t }: StepCtx) {
  return (
    <Svg label="Parquet row groups: the same idea, one layer up" h={200}>
      <Row y={70} label="per row group" value="minimum, maximum" valueColor={C.focus} />
      <Row y={130} label="read before" value="any row is decoded" />
    </Svg>
  );
}

export function RevealSnowflakeMicropartitions({ t }: StepCtx) {
  return (
    <Svg label="Snowflake micro-partitions: the same principle" h={200}>
      <Row y={70} label="per partition" value="each column's value range" valueColor={C.focus} />
      <Row y={130} label="pruned" value="before scanning it" />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  const lines = [
    'a block-range summary is tiny next to a B-tree',
    'it only helps on a genuinely correlated column',
    'a matching range still gets every row rechecked',
  ];
  return (
    <Svg label="recap: a small summary, a real requirement" h={200}>
      {lines.map((l, i) => t > i * 0.6 && (
        <T key={l} x={300} y={60 + i * 42} s={14} f={i === lines.length - 1 ? C.focus : C.crema} a="middle">
          {l}
        </T>
      ))}
    </Svg>
  );
}

export function ProveBlockRangesScanned({ t }: StepCtx) {
  return (
    <Svg label="500 ranges, one date, strictly correlated — how many rechecked?" h={200}>
      <Row y={70} label="total block ranges" value="500" />
      <Row y={130} label="matching the date" value="1 — rest ruled out" valueColor={C.focus} />
    </Svg>
  );
}
