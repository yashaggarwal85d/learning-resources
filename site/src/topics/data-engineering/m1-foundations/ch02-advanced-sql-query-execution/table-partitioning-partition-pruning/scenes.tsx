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
    <Svg label="same query, same data, same filter — pruning on vs. off" h={370}>
      {timeBar(30, 90, 5 / 300, '5 buffers', 'pruning on', C.focus)}
      {timeBar(30, 210, 300 / 300, '300 buffers', 'pruning off', C.cherryText)}
    </Svg>
  );
}

export function PredictWhyScanAll({ t }: StepCtx) {
  return (
    <Svg label="the filter is a literal, known before anything runs" h={200}>
      <Row y={70} label="filter value" value="a literal, known upfront" />
      <Row y={130} label="partitions it can't match" value="?" />
    </Svg>
  );
}

export function RevealPartitionTypes({ t }: StepCtx) {
  return (
    <Svg label="three boundary shapes, three predicate shapes" h={200}>
      <Row y={70} label="range" value="an ordered interval" />
      <Row y={130} label="list / hash" value="values / a bucket number" />
    </Svg>
  );
}

export function RevealPlanTimePruning({ t }: StepCtx) {
  return (
    <Svg label="proven before any scan starts" h={370}>
      {timeBar(30, 90, 5 / 300, '5 buffers, 0.146 ms', 'pruning on', C.focus)}
      {timeBar(30, 210, 300 / 300, '300 buffers, 3.633 ms', 'pruning off', C.cherryText)}
    </Svg>
  );
}

export function PredictRuntimeValue({ t }: StepCtx) {
  return (
    <Svg label="a parameter, not a literal — not known until execution" h={200}>
      <Row y={70} label="value known at" value="execution, not planning" />
      <Row y={130} label="pruning still possible" value="?" />
    </Svg>
  );
}

export function RevealRuntimePruning({ t }: StepCtx) {
  return (
    <Svg label="EXPLAIN reports it directly" h={200}>
      <Row y={70} label="Subplans Removed" value="59" valueColor={C.focus} />
      <Row y={130} label="pruned when" value="once execution began" />
    </Svg>
  );
}

export function RevealTwoSignals({ t }: StepCtx) {
  return (
    <Svg label="two moments, two different signals in EXPLAIN" h={200}>
      <Row y={70} label="plan-time pruning" value="missing from the plan" />
      <Row y={130} label="run-time pruning" value="Subplans Removed" valueColor={C.focus} />
    </Svg>
  );
}

export function PredictPartitionCost({ t }: StepCtx) {
  return (
    <Svg label="no filter at all — every partition genuinely needed" h={200}>
      <Row y={70} label="partitions needed" value="all of them" />
      <Row y={130} label="still a cost here" value="?" />
    </Svg>
  );
}

export function RevealPartitionOverhead({ t }: StepCtx) {
  return (
    <Svg label="same data, more partitions to plan around" h={370}>
      {timeBar(30, 90, 3.875 / 3.875, '3.875 ms, 791 buffers', '60 partitions', C.cherryText)}
      {timeBar(30, 210, 0.107 / 3.875, '0.107 ms, 4 buffers', 'unpartitioned', C.focus)}
    </Svg>
  );
}

export function PredictDropVsDelete({ t }: StepCtx) {
  return (
    <Svg label="remove a year of old data — two ways to do it" h={200}>
      <Row y={70} label="DROP the partition" value="one object, instantly — ?" />
      <Row y={130} label="DELETE the rows" value="a bulk operation — ?" />
    </Svg>
  );
}

export function RevealDropVsDelete({ t }: StepCtx) {
  return (
    <Svg label="1,000,000 rows, two ways to remove them" h={370}>
      {timeBar(30, 90, 15.44 / 584.947, '15.440 ms', 'DROP TABLE', C.focus)}
      {timeBar(30, 210, 584.947 / 584.947, '584.947 ms', 'DELETE', C.cherryText)}
    </Svg>
  );
}

export function RevealKeyChoice({ t }: StepCtx) {
  return (
    <Svg label="one key, two jobs" h={200}>
      <Row y={70} label="partition key prunes" value="queries, by predicate" />
      <Row y={130} label="same key drops" value="old data, by retention" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealClusteringContrast({ t }: StepCtx) {
  return (
    <Svg label="physical objects vs. sorted storage blocks" h={200}>
      <Row y={70} label="partitioning" value="separate physical objects" />
      <Row y={130} label="warehouse clustering" value="sorted storage blocks" valueColor={C.focus} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  const lines = [
    'match the partitioning method to the predicate',
    'plan-time pruning proves exclusions early',
    'run-time pruning proves them once a value is known',
    'more partitions cost real planning time',
    'DROP a partition beats deleting its rows',
  ];
  return (
    <Svg label="recap: what partitioning actually buys" h={280}>
      {lines.map((l, i) => t > i * 0.5 && (
        <T key={l} x={300} y={50 + i * 40} s={13} f={i === lines.length - 1 ? C.focus : C.crema} a="middle">
          {l}
        </T>
      ))}
    </Svg>
  );
}

export function ProvePartitionCount({ t }: StepCtx) {
  return (
    <Svg label="24 partitions, one literal match — how many scanned?" h={200}>
      <Row y={70} label="total partitions" value="24" />
      <Row y={130} label="matches the filter" value="1 — rest pruned" valueColor={C.focus} />
    </Svg>
  );
}
